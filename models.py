import os
import datetime
from datetime import date
from typing import Optional
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, extract, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from dotenv import load_dotenv
load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("No se ha configurado la variable de entorno DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


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
    id_concepto = Column(Integer, ForeignKey("conceptos.id"))
    id_sucursal = Column(Integer, ForeignKey("sucursales.id_sucursal"))
    monto = Column(Float)
    notas = Column(String, nullable=True)
    fecha = Column(DateTime, default=datetime.datetime.utcnow)

class SucursalDB(Base):
    __tablename__ = "sucursales"
    id_sucursal = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    ubicacion = Column(String)


Base.metadata.create_all(bind=engine)

class TransaccionCreate(BaseModel):
    id_tipo: str
    id_concepto: int
    id_sucursal: int
    monto: float
    notas: Optional[str] = None
    fecha: Optional[date] = None

class ConceptosCreate(BaseModel):
    nombre: str
    tipo: str
    categoria_padre: str

class SucursalesCreate(BaseModel):
    nombre: str
    ubicacion: str


