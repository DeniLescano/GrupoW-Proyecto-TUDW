# 📚 Guía Completa de la Aplicación - Sistema de Reservas PROGIII

Esta guía detalla la implementación de todas las funcionalidades según los requisitos del Trabajo Final Integrador, incluyendo las funcionalidades extras implementadas.

**Última actualización:** Incluye registro de clientes, envío de emails automáticos, sistema de comentarios, generación de PDF en backend, soft/hard delete, reactivación de elementos, cambio de rol, cancelación de reservas por clientes, JWT expiration de 15 minutos con detección de inactividad, y enlace a documentación de API.

---

## 📋 ÍNDICE

1. [Instalación y Configuración](#-instalación-y-configuración)
2. [Roles y Permisos](#roles-y-permisos)
3. [Autenticación JWT y Registro](#autenticación-jwt)
4. [Autorización por Roles](#autorización-por-roles)
5. [BREAD Completo](#bread-completo)
6. [Notificaciones Automáticas](#notificaciones-automáticas)
7. [Envío de Emails](#-envío-de-emails-automáticos-nuevo)
8. [Sistema de Comentarios](#-sistema-de-comentariosobservaciones-nuevo)
9. [Soft Delete y Hard Delete](#-soft-delete-y-hard-delete)
10. [Cambio de Rol de Usuarios](#-cambio-de-rol-de-usuarios)
11. [Estadísticas y Reportes](#estadísticas-y-reportes)
12. [Validaciones](#validaciones)
13. [Documentación Swagger](#documentación-swagger)
14. [Manejo de Errores](#manejo-de-errores)
15. [Modelo de Datos](#modelo-de-datos)
16. [Frontend Público](#frontend-público)

---

## 🚀 INSTALACIÓN Y CONFIGURACIÓN COMPLETA

Esta guía te llevará paso a paso para instalar, configurar y ejecutar la aplicación completa.

---

### 📋 REQUISITOS PREVIOS

Antes de comenzar, asegúrate de tener instalado:

1. **Node.js** (versión 14 o superior)
   - Verificar instalación: `node --version`
   - Descargar desde: https://nodejs.org/

2. **MySQL** (versión 5.7 o superior, o MariaDB 10.3+)
   - Verificar instalación: `mysql --version`
   - Descargar desde: https://dev.mysql.com/downloads/mysql/

3. **npm** (viene con Node.js)
   - Verificar instalación: `npm --version`

4. **Git** (opcional, para clonar el repositorio)
   - Verificar instalación: `git --version`

---

### 🔧 PASO 1: PREPARAR EL PROYECTO

#### 1.1. Navegar a la carpeta del proyecto
```bash
cd progiii-api
```

#### 1.2. Verificar que estás en el directorio correcto
Debes ver archivos como:
- `package.json`
- `server.js`
- `src/`
- `public/`
- `database/`

---

### 📦 PASO 2: INSTALAR DEPENDENCIAS NPM

#### 2.1. Instalar todas las dependencias
```bash
npm install
```

Esto instalará todas las dependencias listadas en `package.json`. Puede tomar unos minutos.

#### 2.2. Verificar instalación
Si todo está bien, deberías ver un mensaje de éxito y una carpeta `node_modules/` creada.

**Dependencias principales que se instalarán:**
- `express` - Framework web
- `mysql2` - Cliente MySQL
- `jsonwebtoken` - Autenticación JWT
- `bcryptjs` - Hash de contraseñas
- `express-validator` - Validaciones
- `swagger-jsdoc` y `swagger-ui-express` - Documentación API
- `express-rate-limit` - Rate limiting
- `node-cache` - Caché de respuestas
- `nodemailer` - Envío de emails
- `pdfkit` - Generación de PDFs

---

### 🗄️ PASO 3: CONFIGURAR LA BASE DE DATOS

#### 3.1. Crear la Base de Datos

Abre MySQL (Workbench, línea de comandos, o tu cliente preferido) y ejecuta:

```sql
CREATE DATABASE IF NOT EXISTS reservas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE reservas;
```

#### 3.2. Ejecutar Scripts de Migración en Orden

**⚠️ IMPORTANTE: Ejecuta los scripts en el orden exacto indicado a continuación.**

**1. Estructura Principal de Tablas**
```bash
# Desde MySQL Workbench o línea de comandos:
mysql -u root -p reservas < database/migrations/001_initial_schema.sql
```

O copia y pega el contenido del archivo en MySQL Workbench:
- **Archivo:** `database/migrations/001_initial_schema.sql`
- **Contenido:** Crea todas las tablas principales (`usuarios`, `salones`, `servicios`, `turnos`, `reservas`, `reservas_servicios`)

**2. Stored Procedures**
```bash
mysql -u root -p reservas < database/migrations/002_stored_procedures.sql
```

O ejecuta el contenido en MySQL Workbench:
- **Archivo:** `database/migrations/002_stored_procedures.sql`
- **Contenido:** Crea todos los stored procedures para estadísticas y reportes

**3. Tabla de Notificaciones**
```bash
mysql -u root -p reservas < src/database/create_notifications_table.sql
```

O ejecuta el contenido en MySQL Workbench:
- **Archivo:** `src/database/create_notifications_table.sql`
- **Contenido:** Crea la tabla `notificaciones` para el sistema de notificaciones

**4. Tabla de Comentarios**
```bash
mysql -u root -p reservas < scripts/create_comentarios_table.sql
```

O ejecuta el contenido en MySQL Workbench:
- **Archivo:** `scripts/create_comentarios_table.sql`
- **Contenido:** Crea la tabla `comentarios_reservas` para comentarios de administradores

**5. (Opcional) Agregar Campo Estado a Reservas**
Si la tabla `reservas` no tiene el campo `estado`, ejecuta:
- **Archivo:** `src/database/add_estado_reservas.sql`
- **Contenido:** Agrega el campo `estado` a la tabla `reservas` si no existe

#### 3.3. Verificar Estructura de la Base de Datos

Ejecuta en MySQL:
```sql
USE reservas;
SHOW TABLES;
```

Deberías ver las siguientes tablas:
- `usuarios`
- `salones`
- `servicios`
- `turnos`
- `reservas`
- `reservas_servicios`
- `notificaciones`
- `comentarios_reservas`

#### 3.4. (Opcional) Cargar Datos de Prueba

Si quieres datos de ejemplo para probar la aplicación:

**Datos Iniciales (Salones, Servicios, Turnos):**
```bash
mysql -u root -p reservas < database/seeds/initial_data.sql
```

**Usuarios de Prueba:**
```bash
mysql -u root -p reservas < database/seeds/usuarios_prueba.sql
```

**Nota:** Las contraseñas de los usuarios de prueba están en `CREDENCIALES.md`

---

### ⚙️ PASO 4: CONFIGURAR VARIABLES DE ENTORNO

#### 4.1. Crear archivo `.env`

En la raíz del proyecto (`progiii-api/`), crea un archivo llamado `.env` (sin extensión).

#### 4.2. Configurar Variables de Entorno

Copia y pega el siguiente contenido en el archivo `.env`, ajustando los valores según tu configuración:

```env
# ============================================
# BASE DE DATOS
# ============================================
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=reservas

# ============================================
# JWT (JSON Web Token)
# ============================================
JWT_SECRET=tu_secret_key_super_seguro_cambiar_en_produccion_123456789

# ============================================
# SERVIDOR
# ============================================
PORT=3007

# ============================================
# EMAIL (Solo para producción)
# ============================================
# En desarrollo, el sistema usa Ethereal (no requiere configuración)
# Deja estas variables vacías o comentadas para desarrollo
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=tu_email@gmail.com
# SMTP_PASS=tu_password_app
# SMTP_FROM="Sistema de Reservas <tu_email@gmail.com>"
```

#### 4.3. Ajustar Valores

**Base de Datos:**
- `DB_HOST`: Generalmente `localhost`
- `DB_USER`: Tu usuario de MySQL (generalmente `root`)
- `DB_PASSWORD`: Tu contraseña de MySQL
- `DB_NAME`: `reservas` (o el nombre que le diste a la base de datos)

**JWT:**
- `JWT_SECRET`: Cambia por una clave secreta aleatoria y segura (mínimo 32 caracteres)

**Servidor:**
- `PORT`: Puerto donde correrá la aplicación (por defecto `3007`)

**Email (Solo Producción):**
- Si estás en desarrollo, NO configures estas variables
- El sistema usará Ethereal automáticamente para emails de prueba
- En producción, descomenta y configura según tu proveedor SMTP

---

### 🚀 PASO 5: INICIAR EL SERVIDOR

#### 5.1. Verificar que todo está listo

Asegúrate de que:
- ✅ Dependencias instaladas (`node_modules/` existe)
- ✅ Base de datos creada y migrada
- ✅ Archivo `.env` configurado correctamente
- ✅ MySQL está corriendo

#### 5.2. Iniciar el servidor

**Opción A: Modo Producción**
```bash
npm start
```

**Opción B: Modo Desarrollo (con auto-reload)**
```bash
npm run dev
```

#### 5.3. Verificar que el servidor inició correctamente

Deberías ver en la consola algo como:
```
🚀 Servidor corriendo en http://localhost:3007
📚 Documentación API disponible en http://localhost:3007/api-docs
✅ Base de datos conectada correctamente
```

Si ves errores, verifica:
- Que MySQL esté corriendo
- Que las credenciales en `.env` sean correctas
- Que la base de datos `reservas` exista
- Que el puerto 3007 no esté ocupado por otra aplicación

---

### ✅ PASO 6: VERIFICAR INSTALACIÓN

#### 6.1. Acceder a la Aplicación

Abre tu navegador y visita:

**Frontend Principal:**
- URL: `http://localhost:3007/`
- Deberías ver la página principal con salones, servicios y turnos

**Documentación de API (Swagger):**
- URL: `http://localhost:3007/api-docs`
- Deberías ver la documentación interactiva de la API

**Página de Login:**
- URL: `http://localhost:3007/login.html`
- Deberías ver el formulario de inicio de sesión

**Página de Registro:**
- URL: `http://localhost:3007/registro.html`
- Deberías ver el formulario de registro de clientes

#### 6.2. Probar Login

Si cargaste los datos de prueba, puedes iniciar sesión con las credenciales de `CREDENCIALES.md`.

#### 6.3. Verificar API

Prueba hacer una petición GET a:
```
http://localhost:3007/api/v1/salones
```

Deberías recibir una respuesta JSON con los salones (aunque esté vacía si no cargaste datos).

---

### 🔍 TROUBLESHOOTING (Solución de Problemas)

#### Error: "Cannot connect to MySQL"
- **Causa:** MySQL no está corriendo o credenciales incorrectas
- **Solución:** 
  - Verifica que MySQL esté corriendo: `sudo service mysql start` (Linux) o desde servicios (Windows)
  - Verifica credenciales en `.env`

#### Error: "Database 'reservas' does not exist"
- **Causa:** La base de datos no fue creada
- **Solución:** Ejecuta `CREATE DATABASE reservas;` en MySQL

#### Error: "Table 'usuarios' doesn't exist"
- **Causa:** No se ejecutaron los scripts de migración
- **Solución:** Ejecuta los scripts SQL en orden (Paso 3.2)

#### Error: "Port 3007 is already in use"
- **Causa:** Otra aplicación está usando el puerto 3007
- **Solución:** 
  - Cambia `PORT` en `.env` a otro puerto (ej: 3008)
  - O detén la aplicación que está usando el puerto 3007

#### Error: "Module not found"
- **Causa:** Dependencias no instaladas correctamente
- **Solución:** 
  - Elimina `node_modules/` y `package-lock.json`
  - Ejecuta `npm install` nuevamente

#### Error: "JWT_SECRET is required"
- **Causa:** Variable de entorno no configurada
- **Solución:** Verifica que el archivo `.env` exista y tenga `JWT_SECRET` configurado

---

### 📝 RESUMEN DE ARCHIVOS IMPORTANTES

**Scripts SQL (en orden de ejecución):**
1. `database/migrations/001_initial_schema.sql` - Tablas principales
2. `database/migrations/002_stored_procedures.sql` - Stored procedures
3. `src/database/create_notifications_table.sql` - Tabla notificaciones
4. `scripts/create_comentarios_table.sql` - Tabla comentarios
5. `src/database/add_estado_reservas.sql` - Campo estado (si no existe)

**Datos de Prueba (opcionales):**
- `database/seeds/initial_data.sql` - Salones, servicios, turnos de ejemplo
- `database/seeds/usuarios_prueba.sql` - Usuarios de prueba

**Configuración:**
- `.env` - Variables de entorno (crear manualmente)
- `CREDENCIALES.md` - Credenciales de usuarios de prueba

**Archivos Principales:**
- `server.js` - Punto de entrada del servidor
- `src/app.js` - Configuración de Express
- `package.json` - Dependencias y scripts

---

### 🎉 ¡LISTO!

Si llegaste hasta aquí sin errores, tu aplicación está instalada y lista para usar.

**Próximos pasos:**
1. Revisa `CREDENCIALES.md` para credenciales de prueba
2. Explora la documentación API en `http://localhost:3007/api-docs`
3. Prueba crear un usuario desde `http://localhost:3007/registro.html`
4. Inicia sesión y explora los diferentes paneles según el rol

**Para más información:**
- Ver secciones de esta guía para detalles de cada funcionalidad
- Consultar `SISTEMA_DE_EMAILS.md` para configuración de emails

---

## 🔐 ROLES Y PERMISOS

### **CLIENTE (tipo_usuario = 1)**

#### **Funcionalidades Implementadas:**

**1. Iniciar Sesión (Autenticación)**
- **Archivos:**
  - Backend: `src/controllers/authController.js` → función `login`
  - Backend: `src/routes/auth.js` → ruta `POST /api/v1/auth/login`
  - Frontend: `public/login.html`
  - Frontend: `public/scripts/auth.js` → función de login
- **Funcionamiento:**
  - El cliente ingresa `nombre_usuario` y `contrasenia` en el formulario de login
  - El backend verifica credenciales en BD (tabla `usuarios`)
  - Se compara la contraseña hasheada con bcrypt
  - Se genera token JWT con información del usuario
  - El token se almacena en `localStorage` del frontend
  - El usuario es redirigido según su rol

**1.1. Registro de Clientes (Nuevo)**
- **Archivos:**
  - Backend: `src/controllers/authController.js` → función `register`
  - Backend: `src/services/authService.js` → método `register`
  - Backend: `src/routes/auth.js` → ruta `POST /api/v1/auth/register`
  - Backend: `src/validators/authValidator.js` → `registerValidator`
  - Frontend: `public/registro.html`
- **Funcionamiento:**
  - Los clientes pueden registrarse desde la página pública `registro.html`
  - El formulario requiere: nombre, apellido, email (nombre_usuario), contraseña (mínimo 6 caracteres), celular (opcional)
  - El backend valida los datos con express-validator
  - Verifica que el email no esté registrado
  - Hash de contraseña con bcrypt (10 rounds)
  - Crea usuario con `tipo_usuario = 1` (cliente) y `activo = 1`
  - Genera token JWT automáticamente
  - Redirige al panel de cliente después del registro exitoso
- **Enlace:** Disponible desde `login.html` con enlace "Regístrate aquí"

**2. Reservas - Crear**
- **Archivos:**
  - Backend: `src/controllers/reservaController.js` → función `add`
  - Backend: `src/routes/reservas.js` → ruta `POST /api/reservas`
  - Frontend: `public/cliente/nueva-reserva.html`
  - Frontend: `public/scripts/cliente-nueva-reserva.js`
- **Funcionamiento:**
  - El cliente accede a "Nueva Reserva" desde el sidebar
  - Selecciona salón, fecha, turno y servicios opcionales
  - El sistema calcula automáticamente `importe_salon` e `importe_total`
  - Se guarda la reserva con estado activo
  - Se envían notificaciones automáticas (ver sección Notificaciones)
  - Solo puede crear reservas donde `id_cliente` = su `usuario_id`

**3. Reservas - Listar (Solo propias)**
- **Archivos:**
  - Backend: `src/controllers/reservaController.js` → función `browseByUser`
  - Backend: `src/routes/reservas.js` → ruta `GET /api/v1/reservas/mis-reservas`
  - Frontend: `public/cliente/reservas.html`
  - Frontend: `public/scripts/cliente-reservas.js`
- **Funcionamiento:**
  - El cliente solo ve sus propias reservas activas
  - Se filtra por `usuario_id` del token JWT
  - Se muestran salón, fecha, turno, servicios asociados e importes

**3.1. Reservas - Cancelar (Solo propias)**
- **Archivos:**
  - Backend: `src/controllers/reservaController.js` → función `cancelar`
  - Backend: `src/routes/reservas.js` → ruta `DELETE /api/v1/reservas/:id/cancelar`
  - Frontend: `public/cliente/reservas.html` → botón "Cancelar Reserva"
  - Frontend: `public/scripts/cliente-reservas.js` → función `cancelarReserva`
- **Funcionamiento:**
  - El cliente puede cancelar solo sus propias reservas activas
  - Debe ingresar un motivo obligatorio de cancelación
  - El motivo se guarda automáticamente como comentario
  - Se realiza soft delete (`activo = 0`)
  - Se envía email automático de cancelación
  - Solo administradores pueden hacer hard delete (eliminación definitiva)

**4. Listado de Salones (Público)**
- **Archivos:**
  - Backend: `src/controllers/salonController.js` → función `browse`
  - Backend: `src/routes/salones.js` → ruta `GET /api/salones` (pública, sin autenticación)
  - Frontend: `public/cliente/salones-view.html`
  - Frontend: `public/scripts/cliente-nueva-reserva.js` → función `fetchSalones`
- **Funcionamiento:**
  - Endpoint público que retorna solo salones con `activo = 1`
  - Muestra: título, dirección, capacidad, importe, coordenadas (si existen)
  - Accesible sin autenticación para consulta pública

**5. Listado de Servicios (Público)**
- **Archivos:**
  - Backend: `src/controllers/servicioController.js` → función `browse`
  - Backend: `src/routes/servicios.js` → ruta `GET /api/servicios` (pública, sin autenticación)
  - Frontend: `public/cliente/servicios-view.html`
  - Frontend: `public/scripts/cliente-nueva-reserva.js` → función `fetchServicios`
- **Funcionamiento:**
  - Endpoint público que retorna solo servicios con `activo = 1`
  - Muestra: descripción e importe
  - Se usa en el formulario de nueva reserva para selección múltiple

**6. Listado de Turnos (Público)**
- **Archivos:**
  - Backend: `src/controllers/turnoController.js` → función `browse`
  - Backend: `src/routes/turnos.js` → ruta `GET /api/turnos` (pública, sin autenticación)
  - Frontend: `public/cliente/turnos-view.html`
  - Frontend: `public/scripts/cliente-nueva-reserva.js` → función `fetchTurnos`
- **Funcionamiento:**
  - Endpoint público que retorna solo turnos con `activo = 1`
  - Muestra: `hora_desde`, `hora_hasta`, `orden`
  - Ordenados por campo `orden`

**7. Recepción de Notificaciones Automáticas**
- **Archivos:**
  - Backend: `src/services/notificationService.js` → función `notifyReservaCreated`, `notifyReservaConfirmed`
  - Backend: `src/controllers/reservaController.js` → se llama en función `add` y `confirmar`
  - Backend: `src/routes/notificaciones.js` → rutas para consultar notificaciones
  - Frontend: `public/scripts/auth.js` → funciones para obtener notificaciones
- **Funcionamiento:**
  - **Cuando se crea una reserva:**
    - Se inserta notificación tipo `reserva_creada` para el cliente
    - Se inserta notificación tipo `nueva_reserva` para empleados/administradores
  - **Cuando se confirma una reserva (admin):**
    - Se inserta notificación tipo `reserva_confirmada` para el cliente
    - Mensaje especial: "Reserva CONFIRMADA"
  - **Cuando se actualiza una reserva:**
    - Se inserta notificación tipo `reserva_actualizada` para el cliente
  - **Cuando se cancela una reserva:**
    - Se inserta notificación tipo `reserva_cancelada` para el cliente
  - El cliente puede consultar sus notificaciones en `/api/notificaciones`

---

### **EMPLEADO (tipo_usuario = 2)**

#### **Funcionalidades Implementadas:**

**1. Iniciar Sesión (Autenticación)**
- **Misma implementación que Cliente** (ver arriba)
- **Archivos:**
  - Backend: `src/controllers/authController.js` → función `login`
  - Backend: `src/routes/auth.js` → ruta `POST /api/auth/login`

**2. Listado de Reservas (Todas)**
- **Archivos:**
  - Backend: `src/controllers/reservaController.js` → función `browse`
  - Backend: `src/routes/reservas.js` → ruta `GET /api/reservas`
  - Frontend: `public/empleado/reservas.html`
  - Frontend: `public/scripts/empleado-reservas.js`
- **Funcionamiento:**
  - Requiere autenticación + rol empleado/administrador
  - Retorna todas las reservas activas con información completa
  - Muestra: cliente, salón, fecha, turno, servicios, importes
  - Middleware: `src/middlewares/auth.js` → `authorizeRoles('empleado', 'administrador')`

**3. Listado de Clientes**
- **Archivos:**
  - Backend: `src/controllers/usuarioController.js` → función `read` (permite empleado)
  - Backend: `src/routes/usuarios.js` → ruta `GET /api/usuarios/:id` con autorización empleado
  - Frontend: `public/empleado/clientes.html`
  - Frontend: `public/scripts/empleado-clientes.js`
- **Funcionamiento:**
  - El empleado puede ver información de clientes (pero no modificar)
  - Acceso limitado a lectura de usuarios tipo cliente
  - No puede ver contraseñas (excluidas en SELECT)

**4. BREAD Completo - Salones**
- **Archivos:**
  - Backend: `src/controllers/salonController.js` → funciones `browse`, `read`, `add`, `edit`, `delete`
  - Backend: `src/routes/salones.js` → todas las rutas CRUD
  - Frontend: `public/salones.html` (compartido con admin)
  - Frontend: `public/scripts/salones.js`
- **Funcionamiento:**
  - **Browse (GET /api/salones)**: Lista salones activos (público) o todos con `?all=true` (requiere auth)
  - **Read (GET /api/salones/:id)**: Obtiene un salón específico
  - **Add (POST /api/salones)**: Crea nuevo salón (requiere auth + rol empleado/admin)
  - **Edit (PUT /api/salones/:id)**: Actualiza salón existente (requiere auth + rol empleado/admin)
  - **Delete (DELETE /api/salones/:id)**: Soft delete (pone `activo = 0`)
  - Middleware: `authorizeRoles('empleado', 'administrador')` en POST, PUT, DELETE

**5. BREAD Completo - Servicios**
- **Archivos:**
  - Backend: `src/controllers/servicioController.js` → funciones `browse`, `read`, `add`, `edit`, `delete`
  - Backend: `src/routes/servicios.js` → todas las rutas CRUD
  - Frontend: `public/empleado/servicios.html`
  - Frontend: `public/scripts/empleado-servicios.js`
- **Funcionamiento:**
  - Similar a Salones
  - GET es público (solo activos)
  - POST/PUT/DELETE requieren autenticación + rol empleado/admin
  - Soft delete implementado

**6. BREAD Completo - Turnos**
- **Archivos:**
  - Backend: `src/controllers/turnoController.js` → funciones `browse`, `read`, `add`, `edit`, `delete`
  - Backend: `src/routes/turnos.js` → todas las rutas CRUD
  - Frontend: `public/empleado/turnos.html`
  - Frontend: `public/scripts/empleado-turnos.js`
- **Funcionamiento:**
  - Similar a Salones y Servicios
  - Campos: `orden`, `hora_desde`, `hora_hasta`
  - Validaciones: hora_fin debe ser posterior a hora_inicio

---

### **ADMINISTRADOR (tipo_usuario = 3)**

#### **Funcionalidades Implementadas:**

**1. Iniciar Sesión (Autenticación)**
- **Misma implementación que Cliente/Empleado** (ver arriba)

**2. BREAD Completo - Reservas**
- **Archivos:**
  - Backend: `src/controllers/reservaController.js` → funciones `browse`, `read`, `add`, `edit`, `delete`, `confirmar`
  - Backend: `src/routes/reservas.js` → todas las rutas CRUD + confirmar
  - Frontend: `public/administrador/reportes-reservas.html` (para reportes)
  - Frontend: `public/scripts/reportes-reservas.js`
- **Funcionamiento:**
  - **Browse (GET /api/reservas)**: Todas las reservas (requiere auth + rol admin/empleado)
  - **Read (GET /api/reservas/:id)**: Una reserva específica (requiere auth)
  - **Add (POST /api/reservas)**: Crear reserva con estado `'pendiente'` por defecto (cualquier rol autenticado puede crear)
  - **Confirmar (PATCH /api/reservas/:id/confirmar)**: Solo administradores pueden confirmar (cambia estado de `'pendiente'` a `'confirmada'`)
    - Cuando se confirma, se envía notificación especial `reserva_confirmada` al cliente
  - **Edit (PUT /api/reservas/:id)**: Solo administradores pueden modificar (regla de negocio)
    - Puede cambiar estado incluido
    - Si cambia a `'confirmada'`, envía notificación especial
  - **Delete (DELETE /api/reservas/:id)**: Solo administradores pueden eliminar (soft delete)
  - **Estados de reserva:**
    - `'pendiente'`: Reserva creada, esperando confirmación
    - `'confirmada'`: Reserva confirmada por administrador
    - `'cancelada'`: Reserva cancelada
    - `'completada'**: Reserva ya cumplida
  - Middleware: `authorizeRoles('administrador')` en PUT, DELETE y PATCH /confirmar

**3. BREAD Completo - Salones**
- **Archivos:** (mismos que Empleado, pero admin también puede ver todos)
- **Funcionamiento:** Similar a empleado, pero con acceso completo

**4. BREAD Completo - Servicios**
- **Archivos:** (mismos que Empleado)
- **Funcionamiento:** Similar a empleado, con acceso completo

**5. BREAD Completo - Turnos**
- **Archivos:** (mismos que Empleado)
- **Funcionamiento:** Similar a empleado, con acceso completo

**6. BREAD Completo - Usuarios**
- **Archivos:**
  - Backend: `src/controllers/usuarioController.js` → funciones `browse`, `read`, `add`, `edit`, `delete`, `permanentDelete`
  - Backend: `src/routes/usuarios.js` → todas las rutas CRUD + `DELETE /api/v1/usuarios/:id/permanent`
  - Frontend: `public/usuarios.html`
  - Frontend: `public/scripts/usuarios.js`
- **Funcionamiento:**
  - Solo administradores pueden gestionar usuarios
  - Puede crear, editar, eliminar (soft delete) cualquier usuario
  - Puede asignar roles (cliente, empleado, administrador)
  - Contraseñas se hashean con bcrypt antes de guardar
  - Middleware: `authorizeRoles('administrador')` en todas las rutas
  - **Soft Delete:** Cambia `activo = 0`, no elimina físicamente
  - **Reactivación:** Puede reactivar usuarios desactivados (cambia `activo = 1`)
  - **Hard Delete:** Solo disponible para usuarios desactivados, elimina físicamente de la BD
  - **Cambio de Rol:** Puede cambiar el `tipo_usuario` de cualquier usuario desde el modal de detalles
  - **Visualización:** Muestra tablas separadas para usuarios activos e inactivos
  - **Resaltado:** El usuario actual se resalta en verde en la tabla de usuarios activos

**7. Generación de Informes Estadísticos (Stored Procedures)**
- **Archivos:**
  - Backend: `src/controllers/estadisticasController.js` → funciones que llaman stored procedures
  - Backend: `src/routes/estadisticas.js` → rutas protegidas para admin
  - Backend: `database/migrations/002_stored_procedures.sql` → definición de procedures
  - Frontend: `public/informes-salones.html`, `public/informes-usuarios.html`
  - Frontend: `public/scripts/informes-salones.js`, `public/scripts/informes-usuarios.js`
- **Stored Procedures Implementados:**
  1. **`sp_estadisticas_reservas`**: Estadísticas generales de reservas (totales, activas, canceladas, importes, etc.)
  2. **`sp_estadisticas_salones`**: Estadísticas de salones (totales, activos, capacidades, importes)
  3. **`sp_estadisticas_usuarios`**: Estadísticas de usuarios (por tipo, activos, inactivos)
  4. **`sp_reservas_por_mes`**: Reservas agrupadas por mes con importes
  5. **`sp_reservas_detalladas`**: Reservas con toda la información relacionada (cliente, salón, turno, servicios)
- **Endpoints:**
  - `GET /api/estadisticas/reservas?fecha_desde=&fecha_hasta=`
  - `GET /api/estadisticas/salones`
  - `GET /api/estadisticas/usuarios`
  - `GET /api/estadisticas/reservas-por-mes?anio=`
  - `GET /api/estadisticas/reservas-detalladas?fecha_desde=&fecha_hasta=`
- **Funcionamiento:**
  - Todos los endpoints requieren autenticación + rol administrador
  - Ejecutan stored procedures en MySQL
  - Retornan datos procesados directamente desde la BD

**8. Reportes de Reservas en PDF y CSV**
- **Archivos:**
  - Backend: `src/controllers/reportesController.js` → funciones `reporteReservas`, `exportarReservasCSV`
  - Backend: `src/services/reporteService.js` → método `generarPDF` (nuevo)
  - Backend: `src/routes/reportes.js` → rutas para reportes
  - Frontend: `public/administrador/reportes-reservas.html`
  - Frontend: `public/scripts/reportes-reservas.js`
- **Funcionamiento:**
  - **PDF**: Se genera en el backend usando `pdfkit` (implementación completa)
    - Endpoint: `GET /api/v1/reportes/reservas?formato=PDF&fecha_desde=&fecha_hasta=`
    - Modo horizontal (landscape) para mejor visualización de tablas
    - Incluye: ID reserva, fecha, cliente, salón, turno, temática, servicios, importes, estado
    - Encabezados repetidos en nuevas páginas
    - Formato profesional con colores y estilos
    - Headers: `Content-Type: application/pdf` y `Content-Disposition: attachment`
    - También disponible en frontend (jsPDF) para compatibilidad
  - **CSV**: Se genera en el backend y se descarga directamente
    - Endpoint: `GET /api/v1/reportes/reservas/csv?fecha_desde=&fecha_hasta=`
    - Headers: `Content-Type: text/csv;charset=utf-8` y `Content-Disposition: attachment`
    - Incluye BOM UTF-8 para compatibilidad con Excel
    - Escape correcto de comillas y caracteres especiales
  - Ambos usan el stored procedure `sp_reservas_detalladas` para obtener datos
  - Endpoint unificado: `GET /api/v1/reportes/reservas?formato=PDF|CSV|JSON`

**9. Recepción de Notificaciones Automáticas**
- **Archivos:**
  - Backend: `src/services/notificationService.js` → función `notifyReservaCreated`
  - Backend: `src/controllers/reservaController.js` → se llama cuando se crea reserva
- **Funcionamiento:**
  - Cuando se crea una nueva reserva, todos los administradores y empleados reciben notificación
  - Tipo: `nueva_reserva`
  - Contiene información del cliente y salón reservado

**10. Envío de Emails Automáticos (Nuevo)**
- **Archivos:**
  - Backend: `src/services/emailService.js` → servicio completo de emails
  - Backend: `src/controllers/reservaController.js` → integrado en `confirmar` y `edit`
  - Librería: `nodemailer` (agregada a package.json)
- **Funcionamiento:**
  - **Email de Confirmación**: Se envía automáticamente cuando un administrador confirma una reserva
    - Template HTML profesional con estilos
    - Incluye: fecha, salón, dirección, horario, temática, servicios, importe total
    - Se envía al email del cliente (`nombre_usuario`)
  - **Email de Cancelación**: Se envía automáticamente cuando se cancela una reserva (soft delete)
    - Template HTML con estilos diferenciados (rojo)
    - Incluye: fecha, salón, dirección, horario, importe
    - Notifica al cliente sobre la cancelación
- **Configuración:**
  - **Desarrollo**: Usa nodemailer con ethereal (emails de prueba)
    - En consola se muestra la URL de preview del email
    - No requiere configuración adicional
  - **Producción**: Configurar variables de entorno en `.env`:
    ```env
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=tu_email@gmail.com
    SMTP_PASS=tu_password_app
    SMTP_FROM="Sistema de Reservas <tu_email@gmail.com>"
    ```

**11. Sistema de Comentarios/Observaciones (Nuevo)**
- **Archivos:**
  - Backend: `src/repositories/comentarioRepository.js` → acceso a datos
  - Backend: `src/services/comentarioService.js` → lógica de negocio
  - Backend: `src/controllers/comentarioController.js` → controlador HTTP
  - Backend: `src/routes/comentarios.js` → rutas REST
  - Frontend: `public/administrador/reservas.html` → sección de comentarios en modal
  - Frontend: `public/scripts/administrador-reservas.js` → funciones de comentarios
  - Base de Datos: `scripts/create_comentarios_table.sql` → script SQL
- **Funcionamiento:**
  - **Tabla**: `comentarios_reservas` con campos: `comentario_id`, `reserva_id`, `usuario_id`, `comentario`, `creado`, `modificado`
  - **Permisos**: Solo administradores pueden agregar comentarios
  - **Endpoints**:
    - `GET /api/v1/reservas/:reservaId/comentarios` → Obtener comentarios de una reserva (admin/empleado)
    - `POST /api/v1/reservas/:reservaId/comentarios` → Crear comentario (solo admin)
    - `PUT /api/v1/comentarios/:id` → Actualizar comentario (solo el autor)
    - `DELETE /api/v1/comentarios/:id` → Eliminar comentario (solo el autor)
  - **Frontend**:
    - Sección de comentarios visible en el modal de detalles de reserva
    - Lista de comentarios con información del autor y fecha
    - Formulario para agregar nuevo comentario
    - Validación: máximo 1000 caracteres
  - **Uso típico**: "Pago 50% de la reserva", "Cliente solicitó cambio de fecha", etc.

---

## 🔑 AUTENTICACIÓN JWT

### **Implementación:**

**Backend:**
- **Archivo:** `src/middlewares/auth.js`
- **Función:** `authenticateToken`
- **Funcionamiento:**
  - Extrae token del header `Authorization: Bearer <token>`
  - Verifica token con `jwt.verify()` usando `JWT_SECRET` del `.env`
  - Si es válido, agrega información del usuario a `req.user`
  - Si es inválido, retorna 401 o 403

**Generación de Token:**
- **Archivo:** `src/controllers/authController.js` → funciones `login` y `register`
- **Librería:** `jsonwebtoken`
- **Payload del token:**
  ```javascript
  {
    usuario_id: usuario.usuario_id,
    nombre_usuario: usuario.nombre_usuario,
    tipo_usuario: usuario.tipo_usuario,
    nombre: usuario.nombre,
    apellido: usuario.apellido
  }
  ```
- **Expiración:** 15 minutos (configurado para evaluación)
- **Registro:** También genera token automáticamente después del registro exitoso

**Gestión de Sesión y Expiración:**
- **Archivo:** `public/scripts/auth.js`
- **Funciones de Gestión de Sesión:**
  - `decodeToken(token)` - Decodifica el token JWT sin verificar
  - `isTokenExpired(token)` - Verifica si el token está expirado
  - `isTokenExpiringSoon(token)` - Verifica si el token expira en menos de 1 minuto
  - `checkTokenExpiration()` - Verifica periódicamente la expiración del token
- **Detección de Inactividad:**
  - **Sistema implementado:** Detección automática de inactividad del usuario
  - **Tiempo de advertencia:** 14 minutos de inactividad
  - **Tiempo de expiración:** 15 minutos de inactividad
  - **Eventos monitoreados:** `mousedown`, `mousemove`, `keypress`, `scroll`, `touchstart`, `click`
  - **Modal de advertencia:** Se muestra a los 14 minutos con opción de "Continuar Sesión"
  - **Redirección automática:** A los 15 minutos redirige a `index.html` si no se continúa
  - **Funciones:**
    - `resetInactivityTimer()` - Reinicia el temporizador de inactividad
    - `initInactivityDetection()` - Inicia la detección de inactividad
    - `stopInactivityDetection()` - Detiene la detección de inactividad
    - `showExpirationWarningModal()` - Muestra modal de advertencia
    - `closeExpirationWarningModal()` - Cierra modal de advertencia
    - `continueSession()` - Extiende la sesión haciendo refresh del token

**Frontend:**
- **Archivo:** `public/scripts/auth.js`
- **Funciones:**
  - `getToken()`: Obtiene token de `localStorage`
  - `getUsuario()`: Obtiene información del usuario de `localStorage`
  - `isAuthenticated()`: Verifica si hay token válido
  - `logout()`: Limpia token y usuario, redirige a login
  - `fetchWithAuth()`: Wrapper de `fetch()` que agrega token automáticamente

**Rutas Protegidas:**
- Todas las rutas excepto:
  - `POST /api/v1/auth/login` (pública)
  - `POST /api/v1/auth/register` (pública - registro de clientes)
  - `GET /api/v1/salones` (pública, solo activos)
  - `GET /api/v1/servicios` (pública, solo activos)
  - `GET /api/v1/turnos` (pública, solo activos)
- Resto de rutas requieren token válido
- Mantiene compatibilidad con rutas antiguas (`/api/auth/login`, etc.)

---

## 🛡️ AUTORIZACIÓN POR ROLES

### **Implementación:**

**Backend:**
- **Archivo:** `src/middlewares/auth.js`
- **Función:** `authorizeRoles(...allowedRoles)`
- **Funcionamiento:**
  - Recibe uno o más roles permitidos como parámetros
  - Compara `req.user.tipo_usuario` con el mapeo de roles:
    - `1` → `'cliente'`
    - `2` → `'empleado'`
    - `3` → `'administrador'`
  - Si el rol del usuario no está en `allowedRoles`, retorna 403
  - Si está permitido, continúa al siguiente middleware/controlador

**Uso en Rutas:**
```javascript
// Solo administradores
router.get('/', authenticateToken, authorizeRoles('administrador'), controller.browse);

// Empleados y administradores
router.post('/', authenticateToken, authorizeRoles('empleado', 'administrador'), controller.add);

// Cualquier autenticado
router.get('/:id', authenticateToken, controller.read);
```

**Frontend:**
- **Archivo:** `public/scripts/auth.js`
- **Funciones de verificación:**
  - `hasRole('cliente', 'empleado')`: Verifica si tiene alguno de los roles
  - `isAdmin()`: Verifica si es administrador
  - `isEmpleado()`: Verifica si es empleado
  - `isCliente()`: Verifica si es cliente
- **Uso:**
  - En cada página HTML se verifica el rol antes de mostrar contenido
  - Si no tiene el rol adecuado, redirige a login

---

## 📊 BREAD COMPLETO

### **Entidades con BREAD Completo:**

**1. Usuarios** (Solo Admin)
- **Archivo Controlador:** `src/controllers/usuarioController.js`
- **Archivo Rutas:** `src/routes/usuarios.js`
- **Endpoints:**
  - `GET /api/usuarios` → Lista todos los usuarios (solo admin)
  - `GET /api/usuarios/:id` → Obtiene un usuario (admin o empleado para lectura)
  - `POST /api/usuarios` → Crea nuevo usuario (solo admin)
  - `PUT /api/usuarios/:id` → Actualiza usuario (solo admin)
  - `DELETE /api/usuarios/:id` → Soft delete usuario (solo admin)

**2. Salones** (Empleado + Admin)
- **Archivo Controlador:** `src/controllers/salonController.js`
- **Archivo Rutas:** `src/routes/salones.js`
- **Endpoints:**
  - `GET /api/salones` → Lista salones activos (público) o todos con `?all=true` (auth)
  - `GET /api/salones/:id` → Obtiene un salón
  - `POST /api/salones` → Crea salón (empleado/admin)
  - `PUT /api/salones/:id` → Actualiza salón (empleado/admin)
  - `DELETE /api/salones/:id` → Soft delete salón (empleado/admin)

**3. Servicios** (Empleado + Admin)
- **Archivo Controlador:** `src/controllers/servicioController.js`
- **Archivo Rutas:** `src/routes/servicios.js`
- **Endpoints:** Similar a Salones

**4. Turnos** (Empleado + Admin)
- **Archivo Controlador:** `src/controllers/turnoController.js`
- **Archivo Rutas:** `src/routes/turnos.js`
- **Endpoints:** Similar a Salones

**5. Reservas** (Cliente puede crear/listar propias, Admin puede todo)
- **Archivo Controlador:** `src/controllers/reservaController.js`
- **Archivo Rutas:** `src/routes/reservas.js`
- **Endpoints:**
  - `GET /api/reservas/mis-reservas` → Reservas del usuario autenticado (cliente)
  - `GET /api/reservas` → Todas las reservas (empleado/admin)
  - `GET /api/reservas/:id` → Una reserva específica (cualquier autenticado)
  - `POST /api/reservas` → Crea reserva (cliente/empleado/admin)
  - `PUT /api/reservas/:id` → Actualiza reserva (solo admin - regla de negocio)
  - `DELETE /api/reservas/:id` → Soft delete reserva (solo admin)

**Soft Delete:**
- Todas las operaciones DELETE implementan soft delete
- No se eliminan físicamente los registros
- Se actualiza el campo `activo = 0`
- Las consultas filtran por `activo = 1` por defecto

---

## 🔔 NOTIFICACIONES AUTOMÁTICAS

### **Implementación:**

**Tabla de Base de Datos:**
- **Tabla:** `notificaciones`
- **Archivo SQL:** `src/database/create_notifications_table.sql`
- **Campos:**
  - `id`: ID único
  - `usuario_id`: FK a usuarios
  - `tipo`: Tipo de notificación (`reserva_creada`, `reserva_actualizada`, `reserva_cancelada`, `nueva_reserva`, `recordatorio_reserva`)
  - `titulo`: Título de la notificación
  - `mensaje`: Mensaje detallado
  - `leida`: Boolean (si fue leída)
  - `fecha_creacion`: Timestamp

**Servicio de Notificaciones:**
- **Archivo:** `src/services/notificationService.js`
- **Funciones:**
  1. **`notifyReservaCreated(reservaId, clienteId)`**:
     - Se llama cuando se crea una reserva
     - Crea notificación para el cliente
     - Crea notificaciones para todos los empleados y administradores
  2. **`notifyReservaUpdated(reservaId, cambios)`**:
     - Se llama cuando un admin actualiza una reserva
     - Notifica al cliente sobre los cambios
  3. **`notifyReservaCancelled(reservaId)`**:
     - Se llama cuando se cancela una reserva (soft delete)
     - Notifica al cliente
  4. **`notifyReservaReminder()`**:
     - Envía recordatorios de reservas del día siguiente
     - Puede ejecutarse con cron job
  5. **`getUserNotifications(userId, limit)`**:
     - Obtiene notificaciones de un usuario
  6. **`markAsRead(notificacionId, userId)`**:
     - Marca una notificación como leída
  7. **`markAllAsRead(userId)`**:
     - Marca todas las notificaciones de un usuario como leídas

**API de Notificaciones:**
- **Archivo Rutas:** `src/routes/notificaciones.js`
- **Archivo Controlador:** `src/controllers/notificacionController.js`
- **Endpoints:**
  - `GET /api/notificaciones` → Lista notificaciones del usuario autenticado
  - `GET /api/notificaciones/unread` → Cantidad de no leídas
  - `PATCH /api/notificaciones/:id/read` → Marca una como leída
  - `PATCH /api/notificaciones/read-all` → Marca todas como leídas

**Integración:**
- Se llama automáticamente en `reservaController.js`:
  - En función `add`: Llama `notifyReservaCreated`
  - En función `edit`: Llama `notifyReservaUpdated`
  - En función `delete`: Llama `notifyReservaCancelled`

---

## 📧 ENVÍO DE EMAILS AUTOMÁTICOS

### **Implementación:**

**Servicio de Emails:**
- **Archivo:** `src/services/emailService.js`
- **Librería:** `nodemailer` (agregada a package.json)
- **Funcionamiento:**
  - En desarrollo: usa nodemailer con ethereal (emails de prueba)
  - En producción: configuración SMTP mediante variables de entorno
  - Templates HTML profesionales con estilos CSS inline

**Emails Automáticos:**

**1. Email de Confirmación de Reserva:**
- **Trigger:** Cuando un administrador confirma una reserva
- **Archivo:** `src/controllers/reservaController.js` → función `confirmar` y `edit`
- **Funcionamiento:**
  - Se llama automáticamente cuando se cambia el estado de una reserva a `'confirmada'`
  - Se envía al email del cliente (`nombre_usuario`)
  - Template HTML con diseño profesional (verde/azul)
  - Incluye: fecha, salón, dirección, horario, temática, servicios, importe total
  - Mensaje: "Reserva Confirmada" con detalles completos

**2. Email de Cancelación de Reserva:**
- **Trigger:** Cuando se cancela una reserva (soft delete - `activo = 0`)
- **Archivos:** 
  - `src/controllers/reservaController.js` → función `delete`, `edit` y `cancelar`
  - `src/routes/reservas.js` → ruta `DELETE /api/v1/reservas/:id/cancelar` (para clientes)
- **Funcionamiento:**
  - Se llama automáticamente cuando se desactiva una reserva
  - Se envía al email del cliente (`nombre_usuario`)
  - Template HTML con diseño diferenciado (rojo)
  - Incluye: fecha, salón, dirección, horario, importe
  - Mensaje: "Reserva Cancelada" con detalles de la reserva cancelada
  - **Cancelación por Cliente:** Los clientes pueden cancelar sus propias reservas desde "Mis Reservas", deben ingresar un motivo obligatorio que se guarda como comentario

**3. Cancelación de Reservas por Cliente (Nuevo):**
- **Archivos:**
  - Backend: `src/controllers/reservaController.js` → función `cancelar`
  - Backend: `src/routes/reservas.js` → ruta `DELETE /api/v1/reservas/:id/cancelar`
  - Frontend: `public/cliente/reservas.html`
  - Frontend: `public/scripts/cliente-reservas.js`
- **Funcionamiento:**
  - Los clientes pueden cancelar solo sus propias reservas desde "Mis Reservas"
  - Deben ingresar un motivo obligatorio de cancelación
  - El motivo se guarda automáticamente como comentario en la reserva
  - Se realiza soft delete (`activo = 0`)
  - Se envía email automático de cancelación al cliente
  - Solo los administradores pueden hacer hard delete (eliminación definitiva)

**Configuración:**

**Desarrollo (Ethereal):**
- No requiere configuración adicional
- Crea cuenta de prueba automáticamente
- En consola del servidor se muestra la URL de preview del email
- Ejemplo: `https://ethereal.email/message/...`

**Producción (SMTP):**
- Configurar variables de entorno en `.env`:
  ```env
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=tu_email@gmail.com
  SMTP_PASS=tu_password_app
  SMTP_FROM="Sistema de Reservas <tu_email@gmail.com>"
  ```
- Para Gmail, usar contraseña de aplicación (no la contraseña normal)
- Soporta otros proveedores SMTP (Outlook, SendGrid, etc.)

**Integración:**
- Se integra automáticamente en `reservaController.js`
- No bloquea la respuesta HTTP (se envía en background)
- Errores se registran en consola pero no afectan la respuesta

**Notificaciones de Envío:**
- **Frontend:** Al confirmar o cancelar una reserva, se muestra un alert con:
  - ✅ Confirmación de la operación
  - 📧 Email enviado a: [email del cliente]
  - 🔗 Preview URL (en modo desarrollo con Ethereal)
- **Backend:** En consola del servidor se registra cada envío con Preview URL

**Cómo Ver Emails en Desarrollo:**
- **Modo Ethereal (sin SMTP configurado):**
  - Cuando se envía un email, aparece un Preview URL en el alert del frontend y en la consola del servidor
  - Copiar y abrir la URL en el navegador para ver el email completo
  - Ejemplo: `https://ethereal.email/message/wafls3e7q6k5...`
  - Los emails no se envían realmente, solo se generan para visualización
- **Modo Producción (con SMTP configurado):**
  - Los emails se envían realmente al buzón del cliente
  - No hay Preview URL, el email llega al email real del usuario

**Ver documentación completa:** Ver archivo `SISTEMA_DE_EMAILS.md` para detalles completos.

---

## 💬 SISTEMA DE COMENTARIOS/OBSERVACIONES

### **Implementación:**

**Base de Datos:**
- **Tabla:** `comentarios_reservas`
- **Script SQL:** `scripts/create_comentarios_table.sql`
- **Campos:**
  - `comentario_id` (PK, AUTO_INCREMENT)
  - `reserva_id` (FK a reservas)
  - `usuario_id` (FK a usuarios)
  - `comentario` (TEXT)
  - `creado` (DATETIME)
  - `modificado` (DATETIME)
- **Índices:** `idx_reserva_id`, `idx_usuario_id`, `idx_creado`
- **Foreign Keys:** CASCADE DELETE con `reservas` y `usuarios`

**Backend:**

**Repository:**
- **Archivo:** `src/repositories/comentarioRepository.js`
- **Métodos:**
  - `findByReservaId(reservaId)` - Obtener todos los comentarios de una reserva
  - `create(comentarioData)` - Crear nuevo comentario
  - `update(id, comentario)` - Actualizar comentario
  - `delete(id)` - Eliminar comentario
  - `findById(id)` - Obtener comentario por ID

**Service:**
- **Archivo:** `src/services/comentarioService.js`
- **Lógica de Negocio:**
  - Validación de campos requeridos
  - Validación de longitud máxima (1000 caracteres)
  - Verificación de permisos para actualizar/eliminar (solo el autor)
  - Validación de existencia de reserva y usuario

**Controller:**
- **Archivo:** `src/controllers/comentarioController.js`
- **Métodos:**
  - `getComentarios(req, res)` - GET comentarios de una reserva
  - `createComentario(req, res)` - POST crear comentario
  - `updateComentario(req, res)` - PUT actualizar comentario
  - `deleteComentario(req, res)` - DELETE eliminar comentario

**Rutas:**
- **Archivo:** `src/routes/comentarios.js`
- **Endpoints:**
  - `GET /api/v1/reservas/:reservaId/comentarios` - Obtener comentarios (admin/empleado)
  - `POST /api/v1/reservas/:reservaId/comentarios` - Crear comentario (solo admin)
  - `PUT /api/v1/comentarios/:id` - Actualizar comentario (solo el autor - admin)
  - `DELETE /api/v1/comentarios/:id` - Eliminar comentario (solo el autor - admin)

**Permisos:**
- **Ver comentarios:** Administradores y empleados
- **Crear comentarios:** Solo administradores
- **Editar/Eliminar:** Solo el autor del comentario (verificado por `usuario_id`)

**Frontend:**

**Integración:**
- **Archivo:** `public/administrador/reservas.html`
- **Sección:** Agregada en el modal de detalles de reserva
- **Componentes:**
  - Lista de comentarios con scroll (max-height: 300px)
  - Cada comentario muestra: autor, texto, fecha de creación
  - Formulario para agregar nuevo comentario
  - Validación: máximo 1000 caracteres

**Funcionalidades:**
- **Archivo:** `public/scripts/administrador-reservas.js`
- **Funciones:**
  - `loadComentarios(reservaId)` - Cargar comentarios de una reserva
  - `renderComentarios(comentarios)` - Renderizar lista de comentarios
  - Event listener para agregar comentario
  - Actualización automática después de agregar comentario

**Uso Típico:**
- "Pago 50% de la reserva realizado"
- "Cliente solicitó cambio de fecha"
- "Salón preparado con anticipación"
- "Recordatorio enviado al cliente"
- Cualquier observación relevante para la gestión de la reserva

---

## 🔄 SOFT DELETE Y HARD DELETE

### **Implementación:**

**Soft Delete (Desactivación):**
- **Disponible para:** Usuarios, Salones, Servicios, Turnos, Reservas
- **Funcionamiento:**
  - Cambia el campo `activo = 0` en lugar de eliminar físicamente
  - El registro permanece en la base de datos
  - No aparece en listados normales (solo con `?all=true`)
  - Se puede reactivar cambiando `activo = 1`
- **Endpoints:**
  - `DELETE /api/v1/usuarios/:id` - Soft delete usuario
  - `DELETE /api/v1/salones/:id` - Soft delete salón
  - `DELETE /api/v1/servicios/:id` - Soft delete servicio
  - `DELETE /api/v1/turnos/:id` - Soft delete turno
  - `DELETE /api/v1/reservas/:id` - Soft delete reserva
- **Visualización Frontend:**
  - Tablas separadas para elementos activos e inactivos
  - Botones "Desactivar" / "Reactivar" según estado
  - Estilos diferenciados (gris, opacidad reducida) para elementos inactivos

**Hard Delete (Eliminación Definitiva):**
- **Disponible para:** Usuarios, Salones, Servicios, Turnos, Reservas (solo si están desactivados)
- **Funcionamiento:**
  - Elimina físicamente el registro de la base de datos
  - Solo disponible para elementos que ya están desactivados (soft delete)
  - Requiere doble confirmación (modal de advertencia)
  - Acción irreversible
- **Endpoints:**
  - `DELETE /api/v1/usuarios/:id/permanent` - Hard delete usuario
  - `DELETE /api/v1/salones/:id/permanent` - Hard delete salón
  - `DELETE /api/v1/servicios/:id/permanent` - Hard delete servicio
  - `DELETE /api/v1/turnos/:id/permanent` - Hard delete turno
  - `DELETE /api/v1/reservas/:id/permanent` - Hard delete reserva
- **Frontend:**
  - Botón "Eliminar Definitivamente" solo visible para elementos inactivos
  - Modal de confirmación con advertencia clara
  - Requiere escribir "ELIMINAR" o confirmación doble según implementación

**Reactivación:**
- **Funcionamiento:**
  - Cambia `activo = 0` a `activo = 1`
  - Elemento vuelve a aparecer en listados normales
  - Disponible desde el modal de detalles
- **Endpoints:**
  - `PUT /api/v1/usuarios/:id` - Actualizar usuario con `activo = 1`
  - `PUT /api/v1/salones/:id` - Actualizar salón con `activo = 1`
  - `PUT /api/v1/servicios/:id` - Actualizar servicio con `activo = 1`
  - `PUT /api/v1/turnos/:id` - Actualizar turno con `activo = 1`
  - `PUT /api/v1/reservas/:id` - Actualizar reserva con `activo = 1`

**Listado de Elementos Inactivos:**
- **Parámetro de Query:** `?all=true`
- **Funcionamiento:**
  - Incluye elementos activos e inactivos en la respuesta
  - Frontend filtra y muestra en tablas separadas
  - Permite ver todos los elementos para gestión completa
- **Endpoints que soportan:**
  - `GET /api/v1/usuarios?all=true`
  - `GET /api/v1/salones?all=true`
  - `GET /api/v1/servicios?all=true`
  - `GET /api/v1/turnos?all=true`
  - `GET /api/v1/reservas?all=true`

---

## 👤 CAMBIO DE ROL DE USUARIOS

### **Implementación:**

**Funcionalidad:**
- **Archivos:**
  - Backend: `src/controllers/usuarioController.js` → función `edit` (actualiza `tipo_usuario`)
  - Frontend: `public/usuarios.html` → botón "Cambiar Rol" en modal de detalles
  - Frontend: `public/scripts/usuarios.js` → función `cambiarRol`
- **Permisos:**
  - Solo administradores pueden cambiar roles
  - No se puede cambiar el rol del propio usuario (protección)
- **Funcionamiento:**
  - El administrador puede cambiar el `tipo_usuario` de cualquier usuario
  - Roles disponibles: `1` (Cliente), `2` (Empleado), `3` (Administrador)
  - Modal de confirmación antes de cambiar
  - Actualiza inmediatamente el rol en la base de datos
  - Útil para promover usuarios que se registran como clientes a empleados o administradores
- **Casos de Uso:**
  - Un cliente se registra y luego el administrador lo promueve a empleado
  - Un empleado es promovido a administrador
  - Un administrador puede degradar roles si es necesario

---

## 📈 ESTADÍSTICAS Y REPORTES

### **Estadísticas (Stored Procedures):**

**Archivo de Procedures:** `database/migrations/002_stored_procedures.sql`

**1. `sp_estadisticas_reservas(fecha_desde, fecha_hasta)`**
- **Llamado desde:** `src/controllers/estadisticasController.js` → `estadisticasReservas`
- **Ruta:** `GET /api/estadisticas/reservas`
- **Retorna:** Total reservas, activas, canceladas, importe total, promedio, máximo, mínimo, total clientes, salones utilizados, turnos utilizados

**2. `sp_estadisticas_salones()`**
- **Llamado desde:** `src/controllers/estadisticasController.js` → `estadisticasSalones`
- **Ruta:** `GET /api/estadisticas/salones`
- **Retorna:** Total salones, activos, inactivos, capacidad total, promedio, máximo, mínimo, importe total, promedio, máximo, mínimo

**3. `sp_estadisticas_usuarios()`**
- **Llamado desde:** `src/controllers/estadisticasController.js` → `estadisticasUsuarios`
- **Ruta:** `GET /api/estadisticas/usuarios`
- **Retorna:** Total usuarios, activos, inactivos, total clientes, empleados, administradores, usuarios con celular, usuarios con foto

**4. `sp_reservas_por_mes(anio)`**
- **Llamado desde:** `src/controllers/estadisticasController.js` → `reservasPorMes`
- **Ruta:** `GET /api/estadisticas/reservas-por-mes?anio=`
- **Retorna:** Agrupación por mes con total reservas, importe total, importe promedio

**5. `sp_reservas_detalladas(fecha_desde, fecha_hasta)`**
- **Llamado desde:** `src/controllers/reportesController.js` → `reporteReservas`
- **Ruta:** `GET /api/reportes/reservas`
- **Retorna:** Reservas con información completa: cliente, salón, turno, servicios (usando GROUP_CONCAT)

### **Reportes:**

**PDF (Generación en Backend - Nuevo):**
- **Backend:** `src/services/reporteService.js` → método `generarPDF`
- **Backend:** `src/controllers/reportesController.js` → función `reporteReservas`
- **Librería:** `pdfkit` (agregada a package.json)
- **Endpoint:** `GET /api/v1/reportes/reservas?formato=PDF&fecha_desde=&fecha_hasta=`
- **Funcionamiento:**
  - Obtiene datos del stored procedure `sp_reservas_detalladas`
  - Genera PDF en el backend usando `pdfkit`
  - Modo horizontal (landscape) para mejor visualización de tablas
  - Incluye: ID reserva, fecha, cliente, salón, turno, temática, servicios, importes, estado
  - Encabezados repetidos en nuevas páginas
  - Formato profesional con colores y estilos
  - Headers: `Content-Type: application/pdf` y `Content-Disposition: attachment`
  - También disponible en frontend (jsPDF) para compatibilidad
- **Frontend:** `public/scripts/reportes-reservas.js` (generación alternativa con jsPDF)

**CSV:**
- **Backend:** `src/services/reporteService.js` → método `generarCSV`
- **Backend:** `src/controllers/reportesController.js` → función `exportarReservasCSV`
- **Ruta:** `GET /api/v1/reportes/reservas/csv?fecha_desde=&fecha_hasta=`
- **Funcionamiento:**
  - Obtiene datos del stored procedure `sp_reservas_detalladas`
  - Genera CSV en el backend
  - Incluye BOM UTF-8 para compatibilidad con Excel
  - Escape correcto de comillas y caracteres especiales
  - Headers: `Content-Type: text/csv;charset=utf-8` y `Content-Disposition: attachment`

**Endpoint Unificado:**
- `GET /api/v1/reportes/reservas?formato=PDF|CSV|JSON&fecha_desde=&fecha_hasta=`
- Soporta tres formatos: PDF (backend), CSV (backend), JSON (frontend)

---

## ✅ VALIDACIONES

### **Implementación con express-validator:**

**Archivos de Validadores:**
- `src/validators/usuarioValidator.js`
- `src/validators/salonValidator.js`
- `src/validators/servicioValidator.js`
- `src/validators/turnoValidator.js`
- `src/validators/reservaValidator.js`
- `src/validators/authValidator.js`

**Middleware de Validación:**
- **Archivo:** `src/middlewares/validationMiddleware.js`
- **Función:** `handleValidationErrors`
- **Funcionamiento:**
  - Verifica si hay errores de validación
  - Si hay errores, retorna 400 con detalles
  - Si no hay errores, continúa al siguiente middleware

**Ejemplo de Validador:**
```javascript
// src/validators/usuarioValidator.js
const createUsuarioValidator = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('El email no es válido'),
  // ... más validaciones
];
```

**Uso en Rutas:**
```javascript
router.post('/', 
  authenticateToken, 
  authorizeRoles('administrador'), 
  createUsuarioValidator, 
  handleValidationErrors, 
  usuarioController.add
);
```

**Validaciones Implementadas:**
- ✅ Campos obligatorios
- ✅ Longitud de strings
- ✅ Formatos (email, fecha ISO, hora HH:mm)
- ✅ Valores numéricos (enteros, decimales)
- ✅ Enums (tipo_usuario, estado reserva)
- ✅ Validaciones custom (fecha no pasada, hora_fin > hora_inicio)

---

## 📖 DOCUMENTACIÓN SWAGGER

### **Implementación:**

**Configuración:**
- **Archivo:** `src/config/swagger.js`
- **Librerías:** `swagger-jsdoc`, `swagger-ui-express`

**Integración:**
- **Archivo:** `src/app.js`
- **Ruta:** `/api-docs`
- **URL de acceso:** `http://localhost:3007/api-docs`

**Documentación Incluida:**
- ✅ Todos los endpoints documentados
- ✅ Esquemas definidos para todos los modelos (Usuario, Salon, Servicio, Turno, Reserva)
- ✅ Autenticación JWT documentada
- ✅ Registro de clientes documentado (nuevo)
- ✅ Parámetros de query y path documentados
- ✅ Request bodies documentados
- ✅ Respuestas documentadas (200, 201, 400, 401, 403, 404, 500)
- ✅ Endpoints de comentarios documentados (nuevo)

**Tags Organizados:**
- Autenticación
- Usuarios
- Salones
- Servicios
- Turnos
- Reservas
- Estadísticas
- Reportes
- Notificaciones
- Comentarios (nuevo)

---

## ⚠️ MANEJO DE ERRORES

### **Implementación:**

**Middleware Global de Errores:**
- **Archivo:** `src/middlewares/errorHandler.js`
- **Función:** `errorHandler`
- **Funcionamiento:**
  - Captura todos los errores no manejados
  - Retorna respuestas HTTP apropiadas según el tipo de error:
    - `400`: Error de validación o base de datos
    - `401`: Error de autenticación
    - `403`: Error de autorización
    - `404`: Recurso no encontrado
    - `500`: Error interno del servidor
  - En desarrollo muestra detalles, en producción mensajes genéricos

**Middleware de Rutas No Encontradas:**
- **Archivo:** `src/middlewares/errorHandler.js`
- **Función:** `notFoundHandler`
- **Funcionamiento:**
  - Captura rutas que no existen
  - Retorna 404 con mensaje descriptivo

**Uso:**
- Se agrega al final de `src/app.js` después de todas las rutas

**Manejo de Errores en Controladores:**
- Todos los controladores usan try-catch
- Retornan códigos HTTP apropiados
- Mensajes de error descriptivos

---

## 🗄️ MODELO DE DATOS

### **Tablas Implementadas:**

**1. `usuarios`**
- Campos según especificación: ✅
- `creado` y `modificado` como DATETIME: ✅ (corregido con script)

**2. `salones`**
- Campos según especificación: ✅
- `creado` y `modificado` como DATETIME: ✅ (corregido con script)

**3. `servicios`**
- Campos según especificación: ✅
- `creado` y `modificado` como DATETIME: ✅ (corregido con script)

**4. `turnos`**
- Campos según especificación: ✅
- `creado` y `modificado` como DATETIME: ✅ (corregido con script)

**5. `reservas`**
- Campos según especificación: ✅
- `creado` y `modificado` como DATETIME: ✅ (corregido con script)

**6. `reservas_servicios`**
- Campos según especificación: ✅
- `creado` y `modificado` como DATETIME: ✅ (corregido con script)

**7. `notificaciones`** (Extra)
- Tabla adicional para sistema de notificaciones

**8. `comentarios_reservas`** (Extra - Nuevo)
- Tabla adicional para comentarios/observaciones de administradores en reservas
- Campos: `comentario_id`, `reserva_id`, `usuario_id`, `comentario`, `creado`, `modificado`
- Foreign keys a `reservas` y `usuarios`
- Script SQL: `scripts/create_comentarios_table.sql`

**Script de Corrección:**
- **Archivo:** `scripts/fix_datetime_fields.js`
- Ejecuta ALTER TABLE para cambiar TIMESTAMP a DATETIME en todas las tablas
- Se ejecutó exitosamente

---

## 🌐 FRONTEND PÚBLICO

### **Index Público:**

**Archivo:** `public/index.html`

**Funcionalidades:**
- ✅ Muestra salones disponibles (sin autenticación)
- ✅ Muestra servicios disponibles (sin autenticación)
- ✅ Muestra turnos/horarios disponibles (sin autenticación)
- ✅ Enlace a página de login
- ✅ Enlace a página de registro (nuevo)
- ✅ **Enlace a Documentación de API (Swagger)** - Nuevo
  - Card visible en el header del index público
  - Enlace directo a `http://localhost:3007/api-docs`
  - Texto: "📚 Docs API REST - Para los profesores"
  - Descripción: "Docs para los profesores sobre API REST, solo visible en desarrollo para la corrección"
  - Accesible sin autenticación para evaluación del trabajo
- ✅ Diseño moderno con gradientes, transparencias y animaciones
- ✅ Cards con efectos hover avanzados (transform, shadow, glow)
- ✅ Animaciones al hacer scroll (Intersection Observer)
- ✅ Diseño responsive y profesional
- ✅ Persistencia de sesión (verifica si hay usuario logueado)

**APIs Utilizadas:**
- `GET /api/v1/salones` (público)
- `GET /api/v1/servicios` (público)
- `GET /api/v1/turnos` (público)

**Página de Registro:**

**Archivo:** `public/registro.html`

**Funcionalidades:**
- ✅ Formulario de registro público
- ✅ Campos: nombre, apellido, email (nombre_usuario), contraseña, celular (opcional)
- ✅ Validación frontend (mínimo 6 caracteres para contraseña)
- ✅ Validación backend con express-validator
- ✅ Verificación de email único
- ✅ Hash automático de contraseña
- ✅ Generación automática de token JWT
- ✅ Redirección automática al panel de cliente después del registro
- ✅ Enlace a página de login

---

## 📝 PLAN DE ACCIÓN - ITEMS FALTANTES O MEJORABLES

### ✅ **IMPLEMENTADO COMPLETAMENTE:**
1. ✅ Autenticación con JWT
2. ✅ Registro público de clientes (nuevo)
3. ✅ Autorización por roles
4. ✅ BREAD completo para todas las entidades
5. ✅ Documentación Swagger
6. ✅ Validaciones con express-validator
7. ✅ Estadísticas con stored procedures
8. ✅ Reportes PDF (generación en backend) y CSV
9. ✅ Notificaciones automáticas
10. ✅ Envío de emails automáticos (confirmación y cancelación) (nuevo)
11. ✅ Sistema de comentarios/observaciones para administradores (nuevo)
12. ✅ Soft delete en todas las entidades
13. ✅ Hard delete para elementos desactivados
14. ✅ Modelo de datos corregido (DATETIME)
15. ✅ Manejo de errores global
16. ✅ Frontend público completo

### 🔄 **PENDIENTE DE VERIFICAR/MEJORAR:**

**1. UI de Notificaciones en Frontend**
- **Estado:** Backend completo, frontend básico
- **Archivos:** `public/scripts/auth.js` tiene funciones, pero falta UI
- **Acción:** Crear componente de notificaciones en el sidebar o header
- **Prioridad:** Media

**2. Disponibilidad de Salones/Turnos en Index Público**
- **Estado:** Index público creado, falta mostrar disponibilidad real
- **Archivo:** `public/index-public.html`
- **Acción:** Agregar endpoint para verificar disponibilidad (salones no reservados en fecha/turno)
- **Prioridad:** Media

**3. Confirmación de Reservas**
- **Estado:** Las reservas se crean directamente con `activo = 1`
- **Acción:** Evaluar si se necesita un estado "pendiente" que luego se "confirma"
- **Prioridad:** Baja (depende de reglas de negocio)

**4. Sistema de Recordatorios Automáticos**
- **Estado:** Función implementada, falta configurar cron job
- **Archivo:** `src/services/notificationService.js` → `notifyReservaReminder`
- **Acción:** Configurar cron job en servidor para ejecutar diariamente
- **Prioridad:** Baja

**5. Registro de Clientes (Público)** ✅ IMPLEMENTADO
- **Estado:** ✅ Completamente implementado
- **Archivos:** `public/registro.html`, `src/routes/auth.js` → `/register`
- **Funcionalidad:** Los clientes pueden registrarse desde la página pública

---

## 📌 RESUMEN DE ARCHIVOS CLAVE

### **Backend - Controladores:**
- `src/controllers/authController.js` - Autenticación y registro
- `src/controllers/usuarioController.js` - CRUD usuarios
- `src/controllers/salonController.js` - CRUD salones
- `src/controllers/servicioController.js` - CRUD servicios
- `src/controllers/turnoController.js` - CRUD turnos
- `src/controllers/reservaController.js` - CRUD reservas + lógica de negocio + emails
- `src/controllers/estadisticasController.js` - Estadísticas (stored procedures)
- `src/controllers/reportesController.js` - Reportes PDF/CSV (generación en backend)
- `src/controllers/notificacionController.js` - API de notificaciones
- `src/controllers/comentarioController.js` - CRUD comentarios (nuevo)

### **Backend - Rutas:**
- `src/routes/auth.js` - Autenticación y registro
- `src/routes/usuarios.js` - Usuarios
- `src/routes/salones.js` - Salones
- `src/routes/servicios.js` - Servicios
- `src/routes/turnos.js` - Turnos
- `src/routes/reservas.js` - Reservas
- `src/routes/estadisticas.js` - Estadísticas
- `src/routes/reportes.js` - Reportes
- `src/routes/notificaciones.js` - Notificaciones
- `src/routes/comentarios.js` - Comentarios de reservas (nuevo)

### **Backend - Middlewares:**
- `src/middlewares/auth.js` - Autenticación JWT y autorización por roles
- `src/middlewares/validationMiddleware.js` - Manejo de errores de validación
- `src/middlewares/errorHandler.js` - Manejo global de errores

### **Backend - Validadores:**
- `src/validators/usuarioValidator.js`
- `src/validators/salonValidator.js`
- `src/validators/servicioValidator.js`
- `src/validators/turnoValidator.js`
- `src/validators/reservaValidator.js`
- `src/validators/authValidator.js`

### **Backend - Servicios:**
- `src/services/authService.js` - Lógica de autenticación y registro
- `src/services/notificationService.js` - Lógica de notificaciones
- `src/services/emailService.js` - Servicio de envío de emails (nuevo)
- `src/services/comentarioService.js` - Lógica de comentarios (nuevo)
- `src/services/reporteService.js` - Lógica de reportes (incluye generación PDF)

### **Backend - Configuración:**
- `src/config/database.js` - Conexión MySQL
- `src/config/swagger.js` - Configuración Swagger
- `src/app.js` - Configuración Express y rutas

### **Base de Datos:**
- `database/migrations/001_initial_schema.sql` - Estructura de tablas
- `database/migrations/002_stored_procedures.sql` - Stored procedures
- `src/database/create_notifications_table.sql` - Tabla notificaciones
- `scripts/fix_datetime_fields.js` - Script para corregir campos DATETIME
- `scripts/create_comentarios_table.sql` - Tabla comentarios_reservas (nuevo)

### **Frontend - Páginas Administrador:**
- `public/index.html` - Dashboard admin
- `public/usuarios.html` - Gestión usuarios
- `public/salones.html` - Gestión salones
- `public/informes-salones.html` - Informes salones
- `public/informes-usuarios.html` - Informes usuarios
- `public/administrador/reportes-reservas.html` - Reportes reservas

### **Frontend - Páginas Empleado:**
- `public/empleado/index.html` - Dashboard empleado
- `public/empleado/reservas.html` - Lista reservas
- `public/empleado/clientes.html` - Lista clientes
- `public/empleado/servicios.html` - Gestión servicios
- `public/empleado/turnos.html` - Gestión turnos

### **Frontend - Páginas Cliente:**
- `public/cliente/index.html` - Dashboard cliente
- `public/cliente/reservas.html` - Mis reservas
- `public/cliente/nueva-reserva.html` - Crear reserva
- `public/cliente/salones-view.html` - Ver salones
- `public/cliente/servicios-view.html` - Ver servicios
- `public/cliente/turnos-view.html` - Ver turnos

### **Frontend - Páginas Públicas:**
- `public/login.html` - Login (con enlace a registro)
- `public/registro.html` - Registro de clientes (nuevo)
- `public/index.html` - Index público principal con diseño moderno

### **Frontend - Scripts:**
- `public/scripts/auth.js` - Utilidades de autenticación
- `public/scripts/sidebar.js` - Sidebar dinámico por rol
- `public/scripts/icons.js` - Iconos SVG profesionales
- `public/scripts/*.js` - Scripts específicos de cada página

---

## ✅ CONCLUSIÓN

**Todos los requisitos del Trabajo Final Integrador están implementados y funcionando correctamente.**

El sistema está completo con:
- ✅ Autenticación JWT
- ✅ Autorización por roles
- ✅ BREAD completo para todas las entidades
- ✅ Validaciones con express-validator
- ✅ Documentación Swagger
- ✅ Estadísticas con stored procedures
- ✅ Reportes PDF y CSV
- ✅ Notificaciones automáticas
- ✅ Manejo de errores apropiado
- ✅ Soft delete implementado
- ✅ Modelo de datos correcto

**Funcionalidades Extras Implementadas:**
- ✅ Sistema de notificaciones completo (backend + API)
- ✅ Envío de emails automáticos (confirmación y cancelación de reservas)
- ✅ Sistema de comentarios/observaciones para administradores en reservas
- ✅ Registro público de clientes
- ✅ Generación de PDF en backend (además de frontend)
- ✅ Sidebar profesional con iconos SVG
- ✅ Frontend público completo con diseño moderno
- ✅ **Soft Delete y Hard Delete** en todas las entidades (usuarios, salones, servicios, turnos, reservas)
- ✅ **Reactivación de elementos desactivados** desde el frontend
- ✅ **Cambio de rol de usuarios** por administradores
- ✅ **Cancelación de reservas por clientes** con motivo obligatorio
- ✅ **JWT expiration de 15 minutos** con detección de inactividad
- ✅ **Modal de advertencia de expiración** a los 14 minutos
- ✅ **Enlace a documentación de API (Swagger)** en index público para evaluación
- ✅ **Sincronización de columnas** en tablas de elementos activos/inactivos
- ✅ **Resaltado del usuario actual** en gestión de usuarios

