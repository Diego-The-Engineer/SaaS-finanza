from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from dependencies import get_db
from models import MovimientoDB, SucursalDB
from schemas import SucursalesCreate, SucursalUpdate

router = APIRouter(prefix="/sucursales", tags=["Sucursales"])


def _sucursal_o_404(db: Session, id_sucursal: int) -> SucursalDB:
    sucursal = db.query(SucursalDB).filter(SucursalDB.id_sucursal == id_sucursal).first()
    if not sucursal:
        raise HTTPException(status_code=404, detail="Sucursal no encontrada")
    return sucursal


def _nombre_limpio(nombre: str) -> str:
    nombre = nombre.strip()
    if not nombre:
        raise HTTPException(status_code=422, detail="El nombre de la sucursal no puede estar vacío")
    return nombre


def _nombre_repetido(db: Session, nombre: str, excepto_id: Optional[int] = None) -> bool:
    """Compara sin importar mayúsculas. Al editar, se ignora la propia sucursal."""
    consulta = db.query(SucursalDB).filter(func.lower(SucursalDB.nombre) == nombre.lower())
    if excepto_id is not None:
        consulta = consulta.filter(SucursalDB.id_sucursal != excepto_id)
    return consulta.first() is not None


@router.get("")
def obtener_sucursales(db: Session = Depends(get_db)):
    return db.query(SucursalDB).order_by(SucursalDB.id_sucursal).all()


@router.post("", status_code=201)
def agregar_sucursal(sucursal: SucursalesCreate, db: Session = Depends(get_db)):
    nombre = _nombre_limpio(sucursal.nombre)
    if _nombre_repetido(db, nombre):
        raise HTTPException(status_code=409, detail="La sucursal ya está registrada")

    nueva = SucursalDB(nombre=nombre, ubicacion=sucursal.ubicacion)
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return {"mensaje": "Sucursal creada con éxito", "datos": nueva}


@router.put("/{id_sucursal}")
def actualizar_sucursal(id_sucursal: int, datos: SucursalUpdate, db: Session = Depends(get_db)):
    sucursal = _sucursal_o_404(db, id_sucursal)

    if datos.nombre is not None:
        nombre = _nombre_limpio(datos.nombre)
        if _nombre_repetido(db, nombre, excepto_id=id_sucursal):
            raise HTTPException(status_code=409, detail="Ya existe otra sucursal con ese nombre")
        sucursal.nombre = nombre
    if datos.ubicacion is not None:
        sucursal.ubicacion = datos.ubicacion

    db.commit()
    db.refresh(sucursal)
    return {"mensaje": "Sucursal actualizada correctamente", "datos": sucursal}


@router.delete("/{id_sucursal}")
def eliminar_sucursal(id_sucursal: int, db: Session = Depends(get_db)):
    sucursal = _sucursal_o_404(db, id_sucursal)

    en_uso = db.query(MovimientoDB).filter(MovimientoDB.id_sucursal == id_sucursal).first()
    if en_uso:
        raise HTTPException(status_code=409, detail="La sucursal tiene movimientos y no se puede eliminar")

    db.delete(sucursal)
    db.commit()
    return {"mensaje": f"Sucursal {id_sucursal} eliminada correctamente"}
