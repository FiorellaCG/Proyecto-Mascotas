# 🗄️ CONFIGURACIÓN BASE DE DATOS - Patitos Backend

## CONFIGURACIÓN ACTUAL

### Ubicación: `patitos_backend/settings.py` (líneas 80-92)

```python
DATABASES = {
    'default': {
        'ENGINE': 'mssql',
        'NAME': 'PatitosDB',
        'OPTIONS': {
            'driver': 'ODBC Driver 17 for SQL Server',
            'server': 'localhost\\SQLEXPRESS',
            'trusted_connection': 'yes',
            'extra_params': 'TrustServerCertificate=yes;',
        },
    }
}
```

---

## DESGLOSE DE LA CONFIGURACIÓN

| Parámetro | Valor | Significado |
|-----------|-------|-------------|
| `ENGINE` | `mssql` | Motor SQL Server (requiere `django-mssql-backend`) |
| `NAME` | `PatitosDB` | Nombre exacto de la BD en SQL Server |
| `driver` | `ODBC Driver 17 for SQL Server` | Controlador ODBC para conectar |
| `server` | `localhost\SQLEXPRESS` | Servidor SQL (localhost) + instancia (SQLEXPRESS) |
| `trusted_connection` | `yes` | Usar autenticación Windows (no usuario/contraseña) |
| `TrustServerCertificate` | `yes` | Permitir conexiones sin certificado SSL (dev) |

---

## REQUISITOS PREVIOS

### 1. SQL Server Express debe estar instalado

Verificar en Windows:
1. Abre **Services** (`services.msc`)
2. Busca: **SQL Server (SQLEXPRESS)**
3. Verifica que esté en status **"Running"**

```powershell
# En PowerShell (como admin)
Get-Service -Name MSSQL*
```

### 2. ODBC Driver 17 debe estar instalado

Verificar:
```powershell
# Ver controladores disponibles
odbcad32.exe
# Busca "ODBC Driver 17 for SQL Server" en la lista
```

Si no aparece, descargar desde:
https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server

### 3. Django MSSQL Backend

Debe estar instalado:
```powershell
pip list | grep django-mssql-backend
```

Si no está:
```powershell
pip install django-mssql-backend
```

---

## VERIFICAR CONEXIÓN A BD

### Opción 1: Django Shell

```powershell
# Desde la raíz del proyecto con venv activado
python manage.py shell

# En la consola Python:
>>> from django.db import connection
>>> connection.ensure_connection()  # Si no falla = OK

# Ver tabla Usuario
>>> from usuarios.models import Usuario
>>> Usuario.objects.all()
<QuerySet [<Usuario: usuario1>, <Usuario: usuario2>]>
```

### Opción 2: DBShell

```powershell
python manage.py dbshell
# Se abre consola SQL interactiva
# Si sale error = problema de conexión

SELECT * FROM Usuario;
exit
```

### Opción 3: Intentar login

```powershell
python manage.py runserver

# En otra terminal, ejecutar:
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d "{\"correo\":\"admin@patitos.com\",\"contrasena\":\"admin123\"}"
```

Si retorna datos = ✅ BD funciona

---

## SI TIENES PROBLEMAS DE CONEXIÓN

### Problema: "Connection to backend server failed"

**Causa 1:** SQL Server Express no está corriendo
```powershell
# Abir Services y reiniciar SQL Server (SQLEXPRESS)
# O desde PowerShell (como admin):
Restart-Service -Name "MSSQL$SQLEXPRESS"
```

**Causa 2:** ODBC Driver no está instalado
```powershell
# Descargar e instalar desde:
# https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server
```

**Causa 3:** BD `PatitosDB` no existe
```powershell
# Abir SQL Management Studio
# Click derecho en "Databases" > "New Database"
# Nombre: PatitosDB
# Crear
```

### Problema: "ODBC Driver 17 for SQL Server not found"

```powershell
# Verificar qué versión está instalada
odbcad32.exe

# Si solo ves versión 13, 11, etc.:
# Descargar Driver 17: 
# https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server

# Reinstalar Django MSSQL:
pip uninstall django-mssql-backend
pip install django-mssql-backend
```

### Problema: "Azure Active Directory authentication not supported"

Esto es normal en desarrollo. Verificar que:
1. `trusted_connection = 'yes'` en settings.py ✓
2. Estás usando cuenta Windows, no Azure AD

---

## CAMBIAR LA CONEXIÓN (si tienes servidor remoto)

Editar `patitos_backend/settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'mssql',
        'NAME': 'PatitosDB',
        'OPTIONS': {
            'driver': 'ODBC Driver 17 for SQL Server',
            'server': 'tu_servidor.com,1433',  # Servidor remoto + puerto
            'user': 'tu_usuario',                # Usuario SQL Server
            'password': 'tu_contraseña',         # Contraseña
            'TrustServerCertificate': 'yes',
        },
    }
}
```

---

## RESUMEN: CHECKLIST DE VERIFICACIÓN

```
✓ SQL Server Express está installed
✓ SQL Server (SQLEXPRESS) service está running (Services)
✓ ODBC Driver 17 está instalado (obtenerlo si no)
✓ BD "PatitosDB" existe en SQL Server
✓ django-mssql-backend está instalado (pip install ...)
✓ patitos_backend/settings.py tiene credenciales correctas
✓ python manage.py dbshell abre consola SQL sin errores
✓ python manage.py shell puede importar modelos sin errores
```

Si todos pasan → **¡Tu BD está lista!** 🎉

---

## ENLACES ÚTILES

- [Django MSSQL Backend](https://github.com/ESSolutions/django-mssql-backend)
- [ODBC Drivers SQL Server](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server)
- [SQL Server Express Download](https://www.microsoft.com/en-us/sql-server/sql-server-express)
- [Django Database Backends](https://docs.djangoproject.com/en/6.0/ref/settings/#databases)
