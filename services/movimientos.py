"""Reglas de negocio y consultas de movimientos (sin nada de HTTP salvo los errores)."""
from dataclasses import dataclass
from datetime import date, timedelta
from typing import Optional

from fastapi import HTTPException
from sqlalchemy import extract, or_
from sqlalchemy.orm import Session

from models import ConceptoDB, MovimientoDB, SucursalDB
from schemas import TransaccionCreate


@dataclass
class FiltrosMovimientos:
    tipo: Optional[str] = None
    mes: Optional[int] = None
    anio: Optional[int] = None
    id_sucursal: Optional[int] = None
    q: Optional[str] = None
    q_sucursales: Optional[str] = None 
    desde: Optional[date] = None
    hasta: Optional[date] = None


def ids_desde_texto(texto: Optional[str]) -> list[int]:
    return [int(x) for x in (texto or "").split(",") if x.strip().isdigit()]


def aplicar_filtros(query, f: FiltrosMovimientos):
    if f.tipo:
        query = query.filter(MovimientoDB.id_tipo == f.tipo)
    if f.mes:
        query = query.filter(extract("month", MovimientoDB.fecha) == f.mes)
    if f.anio:
        query = query.filter(extract("year", MovimientoDB.fecha) == f.anio)
    if f.id_sucursal:
        query = query.filter(MovimientoDB.id_sucursal == f.id_sucursal)
    if f.desde:
        query = query.filter(MovimientoDB.fecha >= f.desde)
    if f.hasta:
        query = query.filter(MovimientoDB.fecha < f.hasta + timedelta(days=1))
    if f.q and f.q.strip():
        termino = f"%{f.q.strip()}%"
        condiciones = [ConceptoDB.nombre.ilike(termino), MovimientoDB.notas.ilike(termino)]
        ids_sucursal = ids_desde_texto(f.q_sucursales)
        if ids_sucursal:
            condiciones.append(MovimientoDB.id_sucursal.in_(ids_sucursal))
        query = query.join(ConceptoDB, MovimientoDB.id_concepto == ConceptoDB.id).filter(or_(*condiciones))
    return query


def validar_movimiento(db: Session, datos: TransaccionCreate) -> None:
    sucursal = db.query(SucursalDB).filter(SucursalDB.id_sucursal == datos.id_sucursal).first()
    if not sucursal:
        raise HTTPException(status_code=404, detail="La sucursal seleccionada no existe")

    concepto = db.query(ConceptoDB).filter(ConceptoDB.id == datos.id_concepto).first()
    if not concepto:
        raise HTTPException(status_code=404, detail="El concepto seleccionado no existe")

    if concepto.tipo != datos.id_tipo:
        raise HTTPException(status_code=422, detail="El concepto no corresponde al tipo indicado")
