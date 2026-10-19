"""Esquemas de entrada y salida de la API (Pydantic)."""
from datetime import date
from typing import Optional

from pydantic import BaseModel


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
    ubicacion: Optional[str] = None


class SucursalUpdate(BaseModel):
    nombre: Optional[str] = None
    ubicacion: Optional[str] = None


class LoginIn(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str
