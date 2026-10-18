import os
import datetime
from datetime import date, timedelta
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import extract, or_, func
from sqlalchemy.orm import Session
from models import (
    SessionLocal, 
    ConceptoDB, 
    MovimientoDB, 
    SucursalDB, 
    TransaccionCreate, 
    ConceptosCreate, 
    SucursalesCreate
)

app = FastAPI(title="Premier - Inventory")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def ids_desde_texto(texto: Optional[str]) -> list[int]:
    return [int(x) for x in (texto or "").split(",") if x.strip().isdigit()]

def aplicar_filtros(query, tipo=None, mes=None, anio=None, id_sucursal=None,
                    q=None, desde=None, hasta=None, q_sucursales=None):
    if tipo:
        query = query.filter(MovimientoDB.id_tipo == tipo)
    if mes:
        query = query.filter(extract('month', MovimientoDB.fecha) == mes)
    if anio:
        query = query.filter(extract('year', MovimientoDB.fecha) == anio)
    if id_sucursal:
        query = query.filter(MovimientoDB.id_sucursal == id_sucursal)
    if desde:
        query = query.filter(MovimientoDB.fecha >= desde)
    if hasta:
        query = query.filter(MovimientoDB.fecha < hasta + timedelta(days=1))
    if q and q.strip():
        termino = f"%{q.strip()}%"
        condiciones = [ConceptoDB.nombre.ilike(termino), MovimientoDB.notas.ilike(termino)]
        if q_sucursales:
            condiciones.append(MovimientoDB.id_sucursal.in_(q_sucursales))
        query = query.join(ConceptoDB, MovimientoDB.id_concepto == ConceptoDB.id).filter(or_(*condiciones))
    return query

@app.get("/sucursales")
def obtener_sucursales(db: Session = Depends(get_db)):
    return db.query(SucursalDB).all()


@app.post("/transacciones")
def registrar_movimiento(transaccion: TransaccionCreate, db: Session = Depends(get_db)):
    sucursal_existe = db.query(SucursalDB).filter(SucursalDB.id_sucursal == transaccion.id_sucursal).first()
    if not sucursal_existe:
        raise HTTPException(status_code=404, detail="La sucursal seleccionada no existe")
    concepto_existe = db.query(ConceptoDB).filter(ConceptoDB.id == transaccion.id_concepto).first()
    if not concepto_existe:
        raise HTTPException(status_code=404, detail="El concepto seleccionado no existe")
    nuevo_movimiento = MovimientoDB(
        id_tipo=transaccion.id_tipo,
        id_concepto=transaccion.id_concepto,
        id_sucursal=transaccion.id_sucursal,
        monto=transaccion.monto,
        notas=transaccion.notas
    )
    if concepto_existe.tipo != transaccion.id_tipo:
        raise HTTPException(status_code=422, detail="El concepto no corresponde al tipo indicado")

    datos = dict(
        id_tipo=transaccion.id_tipo,
        id_concepto=transaccion.id_concepto,
        id_sucursal=transaccion.id_sucursal,
        monto=transaccion.monto,
        notas=transaccion.notas,
    )
    if transaccion.fecha:
        datos["fecha"] = transaccion.fecha
    nuevo_movimiento = MovimientoDB(**datos)

    db.add(nuevo_movimiento)
    db.commit()
    db.refresh(nuevo_movimiento)
    return {"mensaje": "¡Guardado en la base de datos!", "datos": nuevo_movimiento}


@app.get("/transacciones")
def obtener_movimientos(
    tipo: Optional[str] = None, mes: Optional[int] = None, anio: Optional[int] = None,
    id_sucursal: Optional[int] = None, q: Optional[str] = None, q_sucursales: Optional[str] = None,
    desde: Optional[date] = None, hasta: Optional[date] = None,
    limit: int = Query(10, ge=1, le=1000), offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    query = aplicar_filtros(db.query(MovimientoDB), tipo=tipo, mes=mes, anio=anio,
                            id_sucursal=id_sucursal, q=q, desde=desde, hasta=hasta,
                            q_sucursales=ids_desde_texto(q_sucursales))
    return (query.order_by(MovimientoDB.fecha.desc(), MovimientoDB.id.desc())
                 .offset(offset).limit(limit).all())


@app.get("/transacciones/count")
def contar_transacciones(
    tipo: Optional[str] = None, mes: Optional[int] = None, anio: Optional[int] = None,
    id_sucursal: Optional[int] = None, q: Optional[str] = None, q_sucursales: Optional[str] = None,
    desde: Optional[date] = None, hasta: Optional[date] = None,
    db: Session = Depends(get_db),
):
    query = aplicar_filtros(db.query(MovimientoDB), tipo=tipo, mes=mes, anio=anio,
                            id_sucursal=id_sucursal, q=q, desde=desde, hasta=hasta,
                            q_sucursales=ids_desde_texto(q_sucursales))
    return {"total": query.count()}

@app.get("/transacciones/resumen")
def resumen_por_concepto(
    mes: Optional[int] = None, anio: Optional[int] = None,
    id_sucursal: Optional[int] = None,
    desde: Optional[date] = None, hasta: Optional[date] = None,
    db: Session = Depends(get_db),
):
    query = aplicar_filtros(
        db.query(MovimientoDB.id_tipo, MovimientoDB.id_concepto, func.sum(MovimientoDB.monto).label("total")),
        mes=mes, anio=anio, id_sucursal=id_sucursal, desde=desde, hasta=hasta,
    )
    filas = query.group_by(MovimientoDB.id_tipo, MovimientoDB.id_concepto).all()
    return [
        {"id_tipo": tipo, "id_concepto": concepto, "total": float(total or 0)}
        for tipo, concepto, total in filas
    ]

@app.put("/transacciones/{id_transaccion}")
def actualizar_movimiento(id_transaccion: int, transaccion: TransaccionCreate, db: Session = Depends(get_db)):
    movimiento = db.query(MovimientoDB).filter(MovimientoDB.id == id_transaccion).first()
    if not movimiento:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")

    sucursal = db.query(SucursalDB).filter(SucursalDB.id_sucursal == transaccion.id_sucursal).first()
    if not sucursal:
        raise HTTPException(status_code=404, detail="La sucursal seleccionada no existe")

    concepto = db.query(ConceptoDB).filter(ConceptoDB.id == transaccion.id_concepto).first()
    if not concepto:
        raise HTTPException(status_code=404, detail="El concepto seleccionado no existe")
    if concepto.tipo != transaccion.id_tipo:
        raise HTTPException(status_code=422, detail="El concepto no corresponde al tipo indicado")

    movimiento.id_tipo = transaccion.id_tipo
    movimiento.id_concepto = transaccion.id_concepto
    movimiento.id_sucursal = transaccion.id_sucursal
    movimiento.monto = transaccion.monto
    movimiento.notas = transaccion.notas
    if transaccion.fecha:
        movimiento.fecha = transaccion.fecha  
    db.commit()
    db.refresh(movimiento)
    return {"mensaje": "Transacción actualizada correctamente", "datos": movimiento}

@app.delete("/conceptos/{id_concepto}")
def eliminar_concepto(id_concepto: int, db: Session = Depends(get_db)):
    concepto = db.query(ConceptoDB).filter(ConceptoDB.id == id_concepto).first()
    if not concepto:
        raise HTTPException(status_code=404, detail="Concepto no encontrado")
    en_uso = db.query(MovimientoDB).filter(MovimientoDB.id_concepto == id_concepto).first()
    if en_uso:
        raise HTTPException(status_code=409, detail="El concepto tiene movimientos y no se puede eliminar")
    db.delete(concepto)
    db.commit()
    return {"mensaje": f"Concepto {id_concepto} eliminado correctamente"}


@app.post("/conceptos")
async def crear_conceptos(concepto: ConceptosCreate, db: Session = Depends(get_db)):
    nuevo_concepto = ConceptoDB(**concepto.dict())
    db.add(nuevo_concepto)
    db.commit()
    db.refresh(nuevo_concepto)
    return {"mensaje": "Concepto creado correctamente", "datos": nuevo_concepto}

@app.put("/conceptos/{id_concepto}")
def actualizar_concepto(id_concepto: int, concepto_in: ConceptosCreate, db: Session = Depends(get_db)):
    db_concepto = db.query(ConceptoDB).filter(ConceptoDB.id == id_concepto).first()
    if not db_concepto:
        raise HTTPException(status_code=404, detail="Concepto no encontrado")
    
    db_concepto.nombre = concepto_in.nombre
    db_concepto.tipo = concepto_in.tipo
    db_concepto.categoria_padre = concepto_in.categoria_padre
    
    db.commit()
    db.refresh(db_concepto)
    return {"mensaje": "Concepto actualizado correctamente", "datos": db_concepto}

@app.delete("/conceptos/{id_concepto}")
async def eliminar_concepto(id_concepto: int, db: Session = Depends(get_db)):
    concepto = db.query(ConceptoDB).filter(ConceptoDB.id == id_concepto).first()
    if not concepto:
        raise HTTPException(status_code=404, detail="Concepto no encontrado")
    db.delete(concepto)
    db.commit()
    return {"mensaje": f"Concepto {id_concepto} eliminado correctamente"}

@app.get("/conceptos")
def obtener_conceptos(db: Session = Depends(get_db)):
    return db.query(ConceptoDB).all()