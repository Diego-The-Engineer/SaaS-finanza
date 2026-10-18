from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from dependencies import get_db
from models import MovimientoDB
from schemas import TransaccionCreate
from services.movimientos import FiltrosMovimientos, aplicar_filtros, validar_movimiento

router = APIRouter(prefix="/transacciones", tags=["Transacciones"])


def leer_filtros(
    tipo: Optional[str] = None,
    mes: Optional[int] = None,
    anio: Optional[int] = None,
    id_sucursal: Optional[int] = None,
    q: Optional[str] = None,
    q_sucursales: Optional[str] = None,
    desde: Optional[date] = None,
    hasta: Optional[date] = None,
) -> FiltrosMovimientos:
    return FiltrosMovimientos(
        tipo=tipo, mes=mes, anio=anio, id_sucursal=id_sucursal,
        q=q, q_sucursales=q_sucursales, desde=desde, hasta=hasta,
    )


def _movimiento_o_404(db: Session, id_transaccion: int) -> MovimientoDB:
    movimiento = db.query(MovimientoDB).filter(MovimientoDB.id == id_transaccion).first()
    if not movimiento:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")
    return movimiento


@router.get("")
def obtener_movimientos(
    filtros: FiltrosMovimientos = Depends(leer_filtros),
    limit: int = Query(10, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    query = aplicar_filtros(db.query(MovimientoDB), filtros)
    return (
        query.order_by(MovimientoDB.fecha.desc(), MovimientoDB.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get("/count")
def contar_transacciones(
    filtros: FiltrosMovimientos = Depends(leer_filtros),
    db: Session = Depends(get_db),
):
    query = aplicar_filtros(db.query(MovimientoDB), filtros)
    return {"total": query.count()}


@router.get("/resumen")
def resumen_por_concepto(
    filtros: FiltrosMovimientos = Depends(leer_filtros),
    db: Session = Depends(get_db),
):
    query = aplicar_filtros(
        db.query(MovimientoDB.id_tipo, MovimientoDB.id_concepto, func.sum(MovimientoDB.monto).label("total")),
        filtros,
    )
    filas = query.group_by(MovimientoDB.id_tipo, MovimientoDB.id_concepto).all()
    return [
        {"id_tipo": tipo, "id_concepto": concepto, "total": float(total or 0)}
        for tipo, concepto, total in filas
    ]


@router.post("")
def registrar_movimiento(transaccion: TransaccionCreate, db: Session = Depends(get_db)):
    validar_movimiento(db, transaccion)

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


@router.put("/{id_transaccion}")
def actualizar_movimiento(id_transaccion: int, transaccion: TransaccionCreate, db: Session = Depends(get_db)):
    movimiento = _movimiento_o_404(db, id_transaccion)
    validar_movimiento(db, transaccion)

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


@router.delete("/{id_transaccion}")
def eliminar_movimiento(id_transaccion: int, db: Session = Depends(get_db)):
    movimiento = _movimiento_o_404(db, id_transaccion)
    db.delete(movimiento)
    db.commit()
    return {"mensaje": f"Transacción {id_transaccion} eliminada permanentemente"}
