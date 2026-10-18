import os
from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from dependencies import get_db
from models import UsuarioDB

ALGORITMO = "HS256"
HORAS_DE_SESION = int(os.environ.get("JWT_HORAS", "8"))

_hasher = PasswordHasher()
_bearer = HTTPBearer(auto_error=False)  
HASH_FALSO = _hasher.hash("contrasena-falsa-para-igualar-tiempos")


def _clave() -> str:
    clave = os.environ.get("JWT_SECRET", "")
    if len(clave) < 32:
        raise RuntimeError("Configura la variable de entorno JWT_SECRET con al menos 32 caracteres")
    return clave


def validar_configuracion() -> None:
    _clave()


def hashear_password(password: str) -> str:
    return _hasher.hash(password)


def verificar_password(password: str, password_hash: str) -> bool:
    try:
        return _hasher.verify(password_hash, password)
    except (VerificationError, InvalidHashError):  
        return False


def crear_token(username: str) -> str:
    ahora = datetime.now(timezone.utc)
    payload = {"sub": username, "iat": ahora, "exp": ahora + timedelta(hours=HORAS_DE_SESION)}
    return jwt.encode(payload, _clave(), algorithm=ALGORITMO)


def usuario_actual(
    credenciales: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> UsuarioDB:
    error = HTTPException(
        status_code=401,
        detail="Sesión inválida o expirada",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credenciales is None:
        raise error
    try:
        payload = jwt.decode(credenciales.credentials, _clave(), algorithms=[ALGORITMO])
    except jwt.PyJWTError:
        raise error

    usuario = db.query(UsuarioDB).filter(UsuarioDB.username == payload.get("sub")).first()
    if usuario is None:
        raise error
    return usuario
