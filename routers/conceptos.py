from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from dependencies import get_db
from models import ConceptoDB, MovimientoDB
from schemas import ConceptosCreate

router = APIRouter(prefix="/conceptos", tags=["Conceptos"])


def _concepto_o_404(db: Session, id_concepto: int) -> ConceptoDB:
    concepto = db.query(ConceptoDB).filter(ConceptoDB.id == id_concepto).first()
    if not concepto:
        raise HTTPException(status_code=404, detail="Concepto no encontrado")
    return concepto


@router.get("")
def obtener_conceptos(db: Session = Depends(get_db)):
    return db.query(ConceptoDB).all()


@router.post("")
def crear_concepto(concepto: ConceptosCreate, db: Session = Depends(get_db)):
    nuevo_concepto = ConceptoDB(**concepto.dict())  
    db.add(nuevo_concepto)
    db.commit()
    db.refresh(nuevo_concepto)
    return {"mensaje": "Concepto creado correctamente", "datos": nuevo_concepto}


@router.put("/{id_concepto}")
def actualizar_concepto(id_concepto: int, concepto_in: ConceptosCreate, db: Session = Depends(get_db)):
    concepto = _concepto_o_404(db, id_concepto)
    concepto.nombre = concepto_in.nombre
    concepto.tipo = concepto_in.tipo
    concepto.categoria_padre = concepto_in.categoria_padre
    db.commit()
    db.refresh(concepto)
    return {"mensaje": "Concepto actualizado correctamente", "datos": concepto}


@router.delete("/{id_concepto}")
def eliminar_concepto(id_concepto: int, db: Session = Depends(get_db)):
    concepto = _concepto_o_404(db, id_concepto)
    en_uso = db.query(MovimientoDB).filter(MovimientoDB.id_concepto == id_concepto).first()
    if en_uso:
        raise HTTPException(status_code=409, detail="El concepto tiene movimientos y no se puede eliminar")
    db.delete(concepto)
    db.commit()
    return {"mensaje": f"Concepto {id_concepto} eliminado correctamente"}
