# SaaS Finanzas - Dashboard de Control Financiero

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)
![openEuler](https://img.shields.io/badge/openEuler-%232D68C4.svg?style=for-the-badge&logo=openeuler&logoColor=white)
![NGINX](https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white)

Plataforma SaaS (Software as a Service) de arquitectura desacoplada diseñada para el registro, control y visualización analítica de operaciones financieras en tiempo real.

## Enlace del Proyecto
https://diego-the-engineer.github.io/SaaS-finanza/

## Arquitectura del Proyecto

El sistema está construido bajo una arquitectura de microservicios separando la capa de presentación, la lógica de negocio y la persistencia de datos, garantizando alta disponibilidad y escalabilidad en la nube.

### Stack Tecnológico
* **Frontend (Capa de Presentación):** HTML5, CSS3 (UI responsiva en Dark Mode) y Vanilla JavaScript (ES6). Implementación de Chart.js para renderizado dinámico de gráficas de dona.
* **Backend (Lógica de Negocio):** API RESTful desarrollada con Python y FastAPI, validación de esquemas con Pydantic y mapeo objeto-relacional mediante SQLAlchemy.
* **Base de Datos (Persistencia):** PostgreSQL alojado en entorno Serverless (Neon Cloud) con autoescalado (Scale-to-Zero).
* **Despliegue y CI/CD:** Contenedores en Render (Backend) y despliegue estático en GitHub Pages / Vercel (Frontend).

## Características Principales

- **Gestión de Transacciones (CRUD):** Registro asíncrono de ingresos y egresos con selectores dinámicos poblados desde la base de datos.
- **Visualización Analítica:** Gráficos dinámicos actualizados en tiempo real mediante la API Fetch.
- **Filtros Temporales y Categóricos:** Capacidad de segmentar la información por meses y tipo de flujo financiero.
- **Seguridad y CORS:** Backend protegido con políticas estrictas de Intercambio de Recursos de Origen Cruzado. Abstracción de credenciales en variables de entorno.

## Endpoints de la API (Resumen)

| Método | Endpoint | Descripción |
| ------ | -------- | ----------- |
| `GET`  | `/conceptos` | Retorna el catálogo maestro de categorías financieras. |
| `GET`  | `/transacciones` | Lista los movimientos financieros (soporta query params para filtrado). |
| `POST` | `/transacciones` | Inserta un nuevo registro validado en la base de datos. |
| `DELETE`| `/transacciones/{id}`| Elimina un registro financiero específico. |
