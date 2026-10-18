import os

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth, conceptos, sucursales, transacciones
from security import usuario_actual, validar_configuracion

validar_configuracion() 

app = FastAPI(title="Premier - Inventory")


origenes = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origenes,
    allow_methods=["*"],
    allow_headers=["*"],
)

protegido = [Depends(usuario_actual)]

app.include_router(auth.router)
app.include_router(sucursales.router, dependencies=protegido)
app.include_router(conceptos.router, dependencies=protegido)
app.include_router(transacciones.router, dependencies=protegido)
