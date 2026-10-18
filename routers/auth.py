import time

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from dependencies import get_db
from models import UsuarioDB
from schemas import LoginIn, TokenOut
from security import HASH_FALSO, crear_token, usuario_actual, verificar_password

router = APIRouter(tags=["Autenticación"])

MAX_INTENTOS = 5
VENTANA_SEGUNDOS = 15 * 60
_fallos: dict[str, list[float]] = {}


def _intentos_recientes(username: str) -> int:
    ahora = time.time()
    vigentes = [t for t in _fallos.get(username, []) if ahora - t < VENTANA_SEGUNDOS]
    if vigentes:
        _fallos[username] = vigentes
    else:
        _fallos.pop(username, None)
    return len(vigentes)


@router.post("/login", response_model=TokenOut)
def login(datos: LoginIn, db: Session = Depends(get_db)):
    username = datos.username.strip().lower()

    if _intentos_recientes(username) >= MAX_INTENTOS:
        raise HTTPException(status_code=429, detail="Demasiados intentos. Espera unos minutos e intenta de nuevo.")

    usuario = db.query(UsuarioDB).filter(UsuarioDB.username == username).first()

    valido = verificar_password(datos.password, usuario.password_hash if usuario else HASH_FALSO)

    if not usuario or not valido:
        if len(_fallos) > 1000: 
            _fallos.clear()
        _fallos.setdefault(username, []).append(time.time())
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    _fallos.pop(username, None)
    return {"access_token": crear_token(usuario.username), "token_type": "bearer"}


@router.get("/me")
def quien_soy(usuario: UsuarioDB = Depends(usuario_actual)):
    return {"username": usuario.username}
