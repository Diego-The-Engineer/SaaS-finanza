import os
import datetime
from datetime import date
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import extract, or_
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
    db.add(nuevo_movimiento)
    db.commit()
    db.refresh(nuevo_movimiento)
    return {"mensaje": "¡Guardado en la base de datos!", "datos": nuevo_movimiento}

@app.get("/transacciones")
def obtener_movimientos(
    tipo: Optional[str] = None, 
    mes: Optional[int] = None, 
    id_sucursal: Optional[int] = None,
    limit: int = 10,
    offset: int = 0,
    q: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(MovimientoDB)
    if tipo:
        query = query.filter(MovimientoDB.id_tipo == tipo)
    if mes:
        query = query.filter(extract('month', MovimientoDB.fecha) == mes)
    if id_sucursal:
        query = query.filter(MovimientoDB.id_sucursal == id_sucursal)
    if q:
        from models import ConceptoDB
        termino = f"%{q.strip().replace(' ', '')}%"
        
        query = query.join(ConceptoDB, MovimientoDB.id_concepto == ConceptoDB.id).filter(
            or_(
                ConceptoDB.nombre.ilike(termino),
                MovimientoDB.notas.ilike(termino)
            )
        )
    if q:
        return query.all()

    return query.offset(offset).limit(limit).all()

@app.put("/transacciones/{id_transaccion}")
def actualizar_movimiento(id_transaccion: int, transaccion: TransaccionCreate, db: Session = Depends(get_db)):
    movimiento = db.query(MovimientoDB).filter(MovimientoDB.id == id_transaccion).first()
    if not movimiento:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")
    
    sucursal_existe = db.query(SucursalDB).filter(SucursalDB.id_sucursal == transaccion.id_sucursal).first()
    if not sucursal_existe:
        raise HTTPException(status_code=404, detail="La sucursal seleccionada no existe")

    movimiento.id_tipo = transaccion.id_tipo
    movimiento.id_concepto = transaccion.id_concepto
    movimiento.id_sucursal = transaccion.id_sucursal
    movimiento.monto = transaccion.monto
    movimiento.notas = transaccion.notas
    
    db.commit()
    db.refresh(movimiento)
    return {"mensaje": "Transacción actualizada correctamente", "datos": movimiento}

@app.delete("/transacciones/{id_transaccion}")
def eliminar_movimiento(id_transaccion: int, db: Session = Depends(get_db)):
    movimiento = db.query(MovimientoDB).filter(MovimientoDB.id == id_transaccion).first()
    if not movimiento:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")
    db.delete(movimiento)
    db.commit()
    return {"mensaje": f"Transacción {id_transaccion} eliminada permanentemente"}


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