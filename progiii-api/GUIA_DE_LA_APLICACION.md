# 📚 Guía Completa de la Aplicación - Sistema de Reservas PROGIII

Esta guía detalla la implementación de todas las funcionalidades según los requisitos del Trabajo Final Integrador.

---

## 📋 ÍNDICE

1. [Roles y Permisos](#roles-y-permisos)
2. [Autenticación JWT](#autenticación-jwt)
3. [Autorización por Roles](#autorización-por-roles)
4. [BREAD Completo](#bread-completo)
5. [Notificaciones Automáticas](#notificaciones-automáticas)
6. [Estadísticas y Reportes](#estadísticas-y-reportes)
7. [Validaciones](#validaciones)
8. [Documentación Swagger](#documentación-swagger)
9. [Manejo de Errores](#manejo-de-errores)
10. [Modelo de Datos](#modelo-de-datos)
11. [Frontend Público](#frontend-público)

---

## 🔐 ROLES Y PERMISOS

### **CLIENTE (tipo_usuario = 1)**

#### **Funcionalidades Implementadas:**

**1. Iniciar Sesión (Autenticación)**
- **Archivos:**
  - Backend: `src/controllers/authController.js` → función `login`
  - Backend: `src/routes/auth.js` → ruta `POST /api/auth/login`
  - Frontend: `public/login.html`
  - Frontend: `public/scripts/auth.js` → función de login
- **Funcionamiento:**
  - El cliente ingresa `nombre_usuario` y `contrasenia` en el formulario de login
  - El backend verifica credenciales en BD (tabla `usuarios`)
  - Se compara la contraseña hasheada con bcrypt
  - Se genera token JWT con información del usuario
  - El token se almacena en `localStorage` del frontend
  - El usuario es redirigido según su rol

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
  - Backend: `src/routes/reservas.js` → ruta `GET /api/reservas/mis-reservas`
  - Frontend: `public/cliente/reservas.html`
  - Frontend: `public/scripts/cliente-reservas.js`
- **Funcionamiento:**
  - El cliente solo ve sus propias reservas activas
  - Se filtra por `usuario_id` del token JWT
  - Se muestran salón, fecha, turno, servicios asociados e importes

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
  - Backend: `src/controllers/usuarioController.js` → funciones `browse`, `read`, `add`, `edit`, `delete`
  - Backend: `src/routes/usuarios.js` → todas las rutas CRUD
  - Frontend: `public/usuarios.html`
  - Frontend: `public/scripts/usuarios.js`
- **Funcionamiento:**
  - Solo administradores pueden gestionar usuarios
  - Puede crear, editar, eliminar (soft delete) cualquier usuario
  - Puede asignar roles (cliente, empleado, administrador)
  - Contraseñas se hashean con bcrypt antes de guardar
  - Middleware: `authorizeRoles('administrador')` en todas las rutas

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
  - Backend: `src/routes/reportes.js` → rutas para reportes
  - Frontend: `public/administrador/reportes-reservas.html`
  - Frontend: `public/scripts/reportes-reservas.js`
- **Funcionamiento:**
  - **PDF**: Se genera en el frontend usando `jsPDF` y `jspdf-autotable`
    - Muestra: ID reserva, fecha, cliente, salón, turno, servicios, importes
    - Se puede filtrar por rango de fechas y salón
  - **CSV**: Se genera en el backend y se descarga directamente
    - Endpoint: `GET /api/reportes/reservas/csv?fecha_desde=&fecha_hasta=&idSalon=`
    - Headers: `Content-Type: text/csv` y `Content-Disposition: attachment`
  - Ambos usan el stored procedure `sp_reservas_detalladas` para obtener datos

**9. Recepción de Notificaciones Automáticas**
- **Archivos:**
  - Backend: `src/services/notificationService.js` → función `notifyReservaCreated`
  - Backend: `src/controllers/reservaController.js` → se llama cuando se crea reserva
- **Funcionamiento:**
  - Cuando se crea una nueva reserva, todos los administradores y empleados reciben notificación
  - Tipo: `nueva_reserva`
  - Contiene información del cliente y salón reservado

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
- **Archivo:** `src/controllers/authController.js` → función `login`
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
- **Expiración:** 24 horas

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
  - `POST /api/auth/login` (pública)
  - `GET /api/salones` (pública, solo activos)
  - `GET /api/servicios` (pública, solo activos)
  - `GET /api/turnos` (pública, solo activos)
- Resto de rutas requieren token válido

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

**PDF:**
- **Frontend:** `public/scripts/reportes-reservas.js`
- **Librerías:** `jsPDF`, `jspdf-autotable`
- **Funcionamiento:**
  - Obtiene datos de `GET /api/reportes/reservas` (usa stored procedure)
  - Genera PDF en el cliente
  - Incluye tabla con todas las columnas de reservas detalladas

**CSV:**
- **Backend:** `src/controllers/reportesController.js` → `exportarReservasCSV`
- **Ruta:** `GET /api/reportes/reservas/csv`
- **Funcionamiento:**
  - Obtiene datos del stored procedure `sp_reservas_detalladas`
  - Genera CSV en el backend
  - Headers apropiados para descarga

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
- ✅ Parámetros de query y path documentados
- ✅ Request bodies documentados
- ✅ Respuestas documentadas (200, 201, 400, 401, 403, 404, 500)

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

**Script de Corrección:**
- **Archivo:** `scripts/fix_datetime_fields.js`
- Ejecuta ALTER TABLE para cambiar TIMESTAMP a DATETIME en todas las tablas
- Se ejecutó exitosamente

---

## 🌐 FRONTEND PÚBLICO

### **Index Público:**

**Archivo:** `public/index-public.html`

**Funcionalidades:**
- ✅ Muestra salones disponibles (sin autenticación)
- ✅ Muestra servicios disponibles (sin autenticación)
- ✅ Muestra turnos/horarios disponibles (sin autenticación)
- ✅ Enlace a página de login
- ✅ Diseño responsive y profesional

**APIs Utilizadas:**
- `GET /api/salones` (público)
- `GET /api/servicios` (público)
- `GET /api/turnos` (público)

**Nota:** Este archivo está creado pero debe ser configurado como página inicial o accesible públicamente según necesidades.

---

## 📝 PLAN DE ACCIÓN - ITEMS FALTANTES O MEJORABLES

### ✅ **IMPLEMENTADO COMPLETAMENTE:**
1. ✅ Autenticación con JWT
2. ✅ Autorización por roles
3. ✅ BREAD completo para todas las entidades
4. ✅ Documentación Swagger
5. ✅ Validaciones con express-validator
6. ✅ Estadísticas con stored procedures
7. ✅ Reportes PDF y CSV
8. ✅ Notificaciones automáticas
9. ✅ Soft delete en todas las entidades
10. ✅ Modelo de datos corregido (DATETIME)
11. ✅ Manejo de errores global
12. ✅ Frontend público básico

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

**5. Registro de Clientes (Público)**
- **Estado:** Solo admin puede crear usuarios
- **Acción:** Crear endpoint público para registro de clientes (opcional, según requisitos)
- **Prioridad:** Baja (puede ser funcionalidad extra)

---

## 📌 RESUMEN DE ARCHIVOS CLAVE

### **Backend - Controladores:**
- `src/controllers/authController.js` - Autenticación
- `src/controllers/usuarioController.js` - CRUD usuarios
- `src/controllers/salonController.js` - CRUD salones
- `src/controllers/servicioController.js` - CRUD servicios
- `src/controllers/turnoController.js` - CRUD turnos
- `src/controllers/reservaController.js` - CRUD reservas + lógica de negocio
- `src/controllers/estadisticasController.js` - Estadísticas (stored procedures)
- `src/controllers/reportesController.js` - Reportes PDF/CSV
- `src/controllers/notificacionController.js` - API de notificaciones

### **Backend - Rutas:**
- `src/routes/auth.js` - Autenticación
- `src/routes/usuarios.js` - Usuarios
- `src/routes/salones.js` - Salones
- `src/routes/servicios.js` - Servicios
- `src/routes/turnos.js` - Turnos
- `src/routes/reservas.js` - Reservas
- `src/routes/estadisticas.js` - Estadísticas
- `src/routes/reportes.js` - Reportes
- `src/routes/notificaciones.js` - Notificaciones

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
- `src/services/notificationService.js` - Lógica de notificaciones

### **Backend - Configuración:**
- `src/config/database.js` - Conexión MySQL
- `src/config/swagger.js` - Configuración Swagger
- `src/app.js` - Configuración Express y rutas

### **Base de Datos:**
- `database/migrations/001_initial_schema.sql` - Estructura de tablas
- `database/migrations/002_stored_procedures.sql` - Stored procedures
- `src/database/create_notifications_table.sql` - Tabla notificaciones
- `scripts/fix_datetime_fields.js` - Script para corregir campos DATETIME

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
- `public/login.html` - Login
- `public/index-public.html` - Index público (nuevo)

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

**Funcionalidad Extra Implementada:**
- ✅ Sistema de notificaciones completo (backend + API)
- ✅ Sidebar profesional con iconos SVG
- ✅ Frontend público para consulta

