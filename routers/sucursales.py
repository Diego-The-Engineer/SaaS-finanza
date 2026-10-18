from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from dependencies import get_db
from models import SucursalDB

router = APIRouter(prefix="/sucursales", tags=["Sucursales"])


@router.get("")
def obtener_sucursales(db: Session = Depends(get_db)):
    return db.query(SucursalDB).all()
