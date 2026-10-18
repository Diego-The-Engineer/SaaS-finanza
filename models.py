import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String

from database import Base, engine


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


class UsuarioDB(Base):
    __tablename__ = "administradores"
    id_admin = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)


Base.metadata.create_all(bind=engine)
