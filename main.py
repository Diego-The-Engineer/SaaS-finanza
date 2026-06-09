import os
import datetime
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, extract
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# 1. Configuración inicial
DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("No se ha configurado la variable de entorno DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 2. Inicialización de la App
app = FastAPI(title="SaaS Finanzas MVP - Fase 2")

# Middleware CORS (Debe ir después de definir app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://diego-the-engineer.github.io"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Modelos de Base de Datos
class ConceptoDB(Base):
    __tablename__ = "conceptos"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, index=True)
    tipo = Column(String) 
    categoria_padre = Column(String)

class MovimientoDB(Base):
    __tablename__ = "movimientos"
    id = Column(Integer, primary_key=True, index=True)
    id_tipo = Column(String, index=True)
    id_concepto = Column(Integer)
    monto = Column(Float)
    notas = Column(String, nullable=True)
    fecha = Column(DateTime, default=datetime.datetime.utcnow)

# Crea las tablas
Base.metadata.create_all(bind=engine)

# 4. Modelos de Entrada (Pydantic)
class TransaccionCreate(BaseModel):
    id_tipo: str
    id_concepto: int
    monto: float
    notas: Optional[str] = None

# Dependencia DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 5. Rutas
@app.post("/transacciones")
def registrar_movimiento(transaccion: TransaccionCreate, db: Session = Depends(get_db)):
    nuevo_movimiento = MovimientoDB(**transaccion.dict())
    db.add(nuevo_movimiento)
    db.commit()
    db.refresh(nuevo_movimiento)
    return {"mensaje": "¡Guardado en Postgres!", "datos": nuevo_movimiento}

@app.get("/transacciones")
def obtener_movimientos(tipo: Optional[str] = None, mes: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(MovimientoDB)
    if tipo:
        query = query.filter(MovimientoDB.id_tipo == tipo)
    if mes:
        query = query.filter(extract('month', MovimientoDB.fecha) == mes)
    return query.all()

@app.put("/transacciones/{id_transaccion}")
def actualizar_movimiento(id_transaccion: int, transaccion: TransaccionCreate, db: Session = Depends(get_db)):
    movimiento = db.query(MovimientoDB).filter(MovimientoDB.id == id_transaccion).first()
    if not movimiento:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")
    movimiento.id_tipo = transaccion.id_tipo
    movimiento.id_concepto = transaccion.id_concepto
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

@app.get("/conceptos")
def obtener_conceptos(db: Session = Depends(get_db)):
    return db.query(ConceptoDB).all()
