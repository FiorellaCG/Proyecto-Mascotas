# Cuidados Los Patitos S.A. - Proyecto Mascotas

Este es un sistema integral para la gestión de una guardería y centro de cuidado de mascotas, diseñado para administrar usuarios, mascotas, habitaciones, reservaciones y monitoreo. El proyecto está dividido en un frontend interactivo y un backend robusto que provee una API REST.

## Tecnologías Principales

*   **Frontend**: React (creado con Vite), JavaScript, CSS.
*   **Backend**: Python, Django, Django REST Framework.
*   **Base de Datos**: Microsoft SQL Server.

## Estructura del Proyecto

El proyecto sigue una arquitectura separada (Full Stack):

*   `patitos-frontend/`: Código fuente de la interfaz de usuario en React.
*   `patitos_backend/`: Configuración principal del proyecto y servidor Django (Settings, URLs principales).
*   **Módulos del Backend (Apps Django)**:
    *   `usuarios/`: Autenticación, registro y gestión de perfiles (dueños y administradores).
    *   `mascotas/`: Registro, listado y perfiles detallados de las mascotas.
    *   `habitaciones/`: Gestión de los espacios disponibles para el cuidado.
    *   `reservaciones/`: Control de citas y estancias en la guardería.
    *   `monitoreo/`: Seguimiento y estado de las mascotas durante su estancia.
    *   `especialistas/`: Control del personal encargado del cuidado.

## Cómo Ejecutar el Proyecto

### Backend (Django)
1. Activa tu entorno virtual: `.\venv\Scripts\Activate.ps1` (en Windows).
2. Asegúrate de tener instaladas las dependencias (usualmente con `pip install -r requirements.txt`).
3. Ejecuta las migraciones de la base de datos: `python manage.py migrate`.
4. Levanta el servidor: `python manage.py runserver`.

### Frontend (React/Vite)
1. Abre otra terminal y entra a la carpeta: `cd patitos-frontend`.
2. Instala los paquetes de Node: `npm install`.
3. Levanta el servidor de desarrollo: `npm run dev`.

