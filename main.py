from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import datetime

# 1. Configuración de la Conexión a la Base de Datos
DATABASE_URL = "postgresql://admin:secretpassword@db:5432/finanzas_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 2. Modelo de la Tabla (Python crea la tabla en Postgres por ti)
# 2. Modelos de Tablas (PostgreSQL)
class ConceptoDB(Base):
    __tablename__ = "conceptos"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, index=True)
    tipo = Column(String) # "Ingreso" o "Egreso"
    categoria_padre = Column(String) # Ej: "VENTAS SAIT", "LIMPIEZA", "ADMINISTRATIVOS"

class MovimientoDB(Base):
    __tablename__ = "movimientos"
    id = Column(Integer, primary_key=True, index=True)
    id_tipo = Column(String, index=True) 
    id_concepto = Column(Integer) # Ahora este ID apuntará a la tabla conceptos
    monto = Column(Float)
    notas = Column(String, nullable=True)
    fecha = Column(DateTime, default=datetime.datetime.utcnow)
# Instrucción mágica: Crea las tablas si no existen
Base.metadata.create_all(bind=engine)

# 3. Modelos de Entrada (Lo que FastAPI valida)
class TransaccionCreate(BaseModel):
    id_tipo: str
    id_concepto: int
    monto: float
    notas: Optional[str] = None

app = FastAPI(title="SaaS Finanzas MVP - Fase 2")

# Dependencia para inyectar la base de datos en cada petición
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 4. Las Rutas Reales
@app.post("/transacciones")
def registrar_movimiento(transaccion: TransaccionCreate, db: Session = Depends(get_db)):
    # Convertimos los datos de FastAPI al formato de SQLAlchemy
    nuevo_movimiento = MovimientoDB(**transaccion.dict())
    db.add(nuevo_movimiento)
    db.commit()      # Guardamos en la BD
    db.refresh(nuevo_movimiento)
    return {"mensaje": "¡Guardado en Postgres!", "datos": nuevo_movimiento}

@app.get("/transacciones")
def obtener_movimientos(tipo: Optional[str] = None, mes: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(MovimientoDB)
    
    if tipo:
        query = query.filter(MovimientoDB.id_tipo == tipo)
    
    # Filtro por mes (extraemos el mes de la columna fecha)
    if mes:
        from sqlalchemy import extract
        query = query.filter(extract('month', MovimientoDB.fecha) == mes)
        
    return query.all()
@app.put("/transacciones/{id_transaccion}")
def actualizar_movimiento(id_transaccion: int, transaccion: TransaccionCreate, db: Session = Depends(get_db)):
    # 1. Buscamos el registro en PostgreSQL por su ID
    movimiento = db.query(MovimientoDB).filter(MovimientoDB.id == id_transaccion).first()
    
    # 2. Si no existe, devolvemos un error 404 limpio
    if not movimiento:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")
    
    # 3. Si existe, actualizamos sus campos con los datos nuevos
    movimiento.id_tipo = transaccion.id_tipo
    movimiento.id_concepto = transaccion.id_concepto
    movimiento.monto = transaccion.monto
    movimiento.notas = transaccion.notas
    
    # 4. Guardamos los cambios
    db.commit()
    db.refresh(movimiento)
    return {"mensaje": "Transacción actualizada correctamente", "datos": movimiento}

@app.delete("/transacciones/{id_transaccion}")
def eliminar_movimiento(id_transaccion: int, db: Session = Depends(get_db)):
    # 1. Buscamos el registro
    movimiento = db.query(MovimientoDB).filter(MovimientoDB.id == id_transaccion).first()
    
    if not movimiento:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")
    
    # 2. Lo fulminamos de la base de datos
    db.delete(movimiento)
    db.commit()
    return {"mensaje": f"Transacción {id_transaccion} eliminada permanentemente"}

@app.get("/conceptos")
def obtener_conceptos(db: Session = Depends(get_db)):
    # Devuelve todo el catálogo de categorías a Nginx
    return db.query(ConceptoDB).all()
