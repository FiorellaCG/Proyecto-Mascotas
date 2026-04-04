# 🚀 GUÍA DE TESTING - Proyecto Patitos

## ✅ VERIFICACIÓN RÁPIDA DE CONEXIÓN A BD

### 1️⃣ Abrir SQL Management Studio

1. Abre **SQL Server Management Studio**
2. Conéctate a: `localhost\SQLEXPRESS`
3. Busca la base de datos **`PatitosDB`**
4. Expande y verifica que existan las tablas:
   - `Usuario`
   - `Rol`
   - `Mascota`
   - `Nivelasistencia`
   - `TipoCuidadoEspecial`
   - `Habitacion`
   - `Reservacion`
   - Etc.

**Si las ves = ✅ BD está correctamente configurada**

---

## 🔧 COMO EJECUTAR EL SISTEMA

### Backend (Django)

```powershell
# 1. Navega a la carpeta del proyecto
cd "e:\Universidad\ARQUITECTURA DE SOFTWARE APLICADA\Proyecto final\Proyecto-Mascotas"

# 2. Activa el entorno virtual (ajusta según tu ruta)
.\venv\Scripts\Activate.ps1

# 3. Asegúrate de que Django puede conectar a BD
python manage.py dbshell

# Si ves "Connection to back-end server failed" = problema con BD
# Si se abre consola SQL = ✅ Conexión OK

exit()  # Salir de dbshell

# 4. Inicia el servidor Django
python manage.py runserver

# Deberías ver:
# Starting development server at http://127.0.0.1:8000/
# Django version 6.0.3, using settings 'patitos_backend.settings'
```

**Deja este terminal abierto mientras pruebas.**

---

### Frontend (React)

En **otra terminal**:

```powershell
# 1. Navega a la carpeta frontend
cd "e:\Universidad\ARQUITECTURA DE SOFTWARE APLICADA\Proyecto final\Proyecto-Mascotas\patitos-frontend"

# 2. Instala dependencias (solo primera vez)
npm install

# 3. Inicia servidor Vite
npm run dev

# Deberías ver:
# Local:   http://localhost:5173/
```

**Abre navegador:** http://localhost:5173

---

## 🧪 PROBAR CON POSTMAN / THUNDER CLIENT

### Opción 1: Instalar extensión "REST Client" en VS Code

1. En VS Code: Extensiones → Busca "REST Client"
2. Instala de **Huachao Mao**
3. Abre archivo: `test.http` (está en raíz del proyecto)
4. Haz clic en **"Send Request"** sobre cualquier endpoint

### Opción 2: Usar Postman

1. Descarga [Postman](https://www.postman.com/downloads/)
2. Crea nueva request
3. Método: `POST`
4. URL: `http://localhost:8000/api/auth/login/`
5. Header: `Content-Type: application/json`
6. Body (JSON):
```json
{
  "correo": "admin@patitos.com",
  "contrasena": "admin123"
}
```
7. Clic en **Send**

---

## 📋 CHECKLIST DE VERIFICACIÓN

Ejecuta esto en **orden** para validar que todo está conectado:

```
1. ✅ Django inicia sin errores de BD
   python manage.py runserver

2. ✅ React inicia sin errores
   npm run dev (desde patitos-frontend)

3. ✅ Endpoint de login responde
   POST http://localhost:8000/api/auth/login/
   Body: { "correo": "...", "contrasena": "..." }

4. ✅ Endpoint de mascotas responde
   GET http://localhost:8000/api/mascotas/mis-mascotas/
   (después de tener sessionid)

5. ✅ Frontend conecta a backend
   Abre http://localhost:5173 y haz login
   (debería guardar sesión en BD)
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS

| Problema | Solución |
|----------|----------|
| **"ODBC Driver 17 not found"** | Instalar: https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server |
| **"Connection to SQL Server failed"** | 1. Abre Services (services.msc)<br>2. Busca "SQL Server (SQLEXPRESS)"<br>3. Verifica que esté en status "Running" |
| **"Database PatitosDB doesn't exist"** | Crear BD en SQL Management Studio con nombre exacto "PatitosDB" |
| **CORS error en navegador** | Ya está configured en settings.py, pero verifica que backend corre en puerto 8000 |
| **"No module named 'mssql'"** | Instalar: `pip install django-mssql-backend` |
| **NodeJS/npm no reconocido** | Instalar Node.js: https://nodejs.org/ |

---

## 🎯 PRÓXIMO PASO

Una vez validado que todo funciona:

1. **Backend + BD conectado** ✅
2. **Frontend + Backend comunicándose** ✅
3. **Puedes proceder a implementar Módulo 4 (Habitaciones)**

---

## 📚 ARCHIVOS ÚTILES

| Archivo | Propósito |
|---------|-----------|
| `test.http` | Pruebas de endpoints con extensión REST Client |
| `patitos_backend/settings.py` | Configuración Django (BD, CORS, REST framework) |
| `manage.py` | Scripts de Django (migrate, shell, etc.) |
| `patitos-frontend/src/api/*.js` | Funciones para consumir endpoints |

---

**¿Necesitas ayuda en algún paso específico?** 😊
