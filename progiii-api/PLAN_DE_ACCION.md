# 📋 Plan de Acción - Items Faltantes y Mejoras

## ✅ ESTADO ACTUAL

### **Requisitos del Trabajo Final - COMPLETADOS:**

✅ **Autenticación con JWT**
- Implementado en: `src/controllers/authController.js`, `src/middlewares/auth.js`
- Funciona correctamente

✅ **Autorización por Roles**
- Implementado en: `src/middlewares/auth.js` → función `authorizeRoles`
- Funciona correctamente para todos los roles

✅ **BREAD Completo**
- ✅ Usuarios (admin)
- ✅ Salones (empleado/admin)
- ✅ Servicios (empleado/admin)
- ✅ Turnos (empleado/admin)
- ✅ Reservas (cliente puede crear/listar propias, admin todo)

✅ **Documentación Swagger**
- Configurado en: `src/config/swagger.js`
- Accesible en: `/api-docs`
- Todas las rutas documentadas

✅ **Validaciones con express-validator**
- Implementado en: `src/validators/*`
- Middleware en: `src/middlewares/validationMiddleware.js`
- Todas las rutas protegidas tienen validaciones

✅ **Estadísticas con Stored Procedures**
- Procedures creados en: `database/migrations/002_stored_procedures.sql`
- Controlador en: `src/controllers/estadisticasController.js`
- 5 stored procedures implementados y funcionando

✅ **Reportes PDF y CSV**
- PDF: Frontend con `jsPDF` (funciona)
- CSV: Backend con stored procedure (funciona)
- Implementado en: `src/controllers/reportesController.js`

✅ **Notificaciones Automáticas**
- Tabla creada: `notificaciones`
- Servicio: `src/services/notificationService.js`
- Integrado en creación/actualización de reservas
- API completa de notificaciones

✅ **Manejo de Errores**
- Middleware global: `src/middlewares/errorHandler.js`
- Respuestas HTTP apropiadas en todos los controladores

✅ **Soft Delete**
- Implementado en todas las entidades
- Campo `activo` usado para soft delete

✅ **Modelo de Datos**
- Todas las tablas según especificación
- Campos `creado` y `modificado` como DATETIME (corregido)

---

## 🔄 ITEMS FALTANTES / MEJORAS

### **1. UI de Notificaciones en Frontend**

**Estado Actual:**
- ✅ Backend completo (API de notificaciones funcionando)
- ✅ Funciones en `public/scripts/auth.js` para obtener notificaciones
- ❌ No hay UI visible para mostrar notificaciones al usuario

**Archivos Involucrados:**
- `public/scripts/auth.js` - Funciones de notificaciones existen
- `public/scripts/sidebar.js` - Sidebar podría tener badge de notificaciones
- `public/styless/main.css` - Estilos para componente de notificaciones

**Acción Requerida:**
1. Crear componente de notificaciones en el sidebar (badge con contador)
2. Agregar dropdown/modal para mostrar notificaciones
3. Agregar funcionalidad para marcar como leídas desde el frontend
4. Actualizar contador en tiempo real (polling cada X segundos)

**Prioridad:** Media

**Código Estimado:**
- Crear `public/scripts/notificaciones.js` con lógica de UI
- Agregar HTML/CSS para componente de notificaciones
- Integrar en sidebar existente

---

### **2. Disponibilidad de Salones/Turnos en Index Público**

**Estado Actual:**
- ✅ Index público creado (`public/index-public.html`)
- ✅ Muestra salones, servicios, turnos disponibles
- ❌ No muestra disponibilidad real (qué salones están libres en qué fechas/turnos)

**Archivos Involucrados:**
- `public/index-public.html` - Index público
- `src/controllers/salonController.js` - Controlador de salones
- `src/routes/salones.js` - Rutas de salones

**Acción Requerida:**
1. Crear endpoint para verificar disponibilidad:
   - `GET /api/salones/disponibilidad?fecha=YYYY-MM-DD&turno_id=`
   - Retorna salones disponibles para esa fecha/turno
2. Actualizar `index-public.html` para mostrar disponibilidad:
   - Agregar selector de fecha
   - Agregar selector de turno
   - Mostrar solo salones disponibles
3. Agregar visualización de disponibilidad en tiempo real

**Prioridad:** Media

**Código Estimado:**
- Nuevo endpoint en `src/routes/salones.js`
- Nueva función en `src/controllers/salonController.js`
- Lógica para verificar reservas existentes en esa fecha/turno
- Actualizar frontend con selectores y filtros

---

### **3. Confirmación de Reservas (Estado Pendiente/Confirmada)**

**Estado Actual:**
- ✅ Las reservas se crean directamente con `activo = 1`
- ✅ Las reservas tienen campo `estado` en el modelo de datos (pero no se usa)
- ❌ No hay flujo de confirmación (pendiente → confirmada)

**Archivos Involucrados:**
- `src/controllers/reservaController.js` - Controlador de reservas
- `database/migrations/001_initial_schema.sql` - Tabla reservas
- `src/validators/reservaValidator.js` - Validaciones

**Requisito del Trabajo Final:**
- Trabajo final dice: "Recepción de notificaciones automáticas cuando se confirma una reserva"
- Esto implica que las reservas pueden tener estado "pendiente" que luego se "confirma"

**Acción Requerida:**
1. Agregar campo `estado` a la tabla `reservas` si no existe (verificar)
2. Las reservas se crean con `estado = 'pendiente'` por defecto
3. Solo administradores pueden cambiar estado a `'confirmada'`
4. Cuando se cambia a `'confirmada'`, se envía notificación al cliente
5. Actualizar stored procedure `sp_reservas_detalladas` para incluir estado
6. Actualizar frontend para mostrar estado de reservas

**Prioridad:** Alta (requisito del trabajo final)

**Código Estimado:**
- Verificar/agregar campo `estado` en tabla reservas
- Modificar `reservaController.add` para crear con `estado = 'pendiente'`
- Agregar endpoint `PATCH /api/reservas/:id/estado` para cambiar estado (solo admin)
- Modificar `notificationService` para enviar notificación cuando se confirma
- Actualizar frontend para mostrar estados

---

### **4. Sistema de Recordatorios Automáticos (Cron Job)**

**Estado Actual:**
- ✅ Función implementada: `notificationService.notifyReservaReminder()`
- ✅ Lógica completa para enviar recordatorios 24hs antes
- ❌ No está configurado cron job en servidor

**Archivos Involucrados:**
- `src/services/notificationService.js` - Función `notifyReservaReminder`
- Servidor donde se ejecuta la aplicación

**Acción Requerida:**
1. Crear script standalone: `scripts/send_reminders.js` (ya existe pero fue eliminado)
2. Configurar cron job en servidor de producción:
   - Windows: Task Scheduler (ejecutar diariamente a las 9:00 AM)
   - Linux/Mac: Cron job (`0 9 * * *`)
3. Documentar proceso de configuración

**Prioridad:** Baja (funcionalidad extra)

**Código Estimado:**
- Crear script standalone para ejecutar recordatorios
- Documentación de configuración de cron
- Verificación de funcionamiento

---

### **5. Registro de Clientes (Público)**

**Estado Actual:**
- ✅ Solo administradores pueden crear usuarios
- ❌ No hay endpoint público para registro de clientes

**Requisito del Trabajo Final:**
- En la lista de "EXTRAS" se menciona: "Registro de usuario tipo 'cliente'"

**Archivos Involucrados:**
- `src/routes/auth.js` - Rutas de autenticación (o nueva ruta)
- `src/controllers/authController.js` - Controlador de auth
- `public/login.html` - Página de login

**Acción Requerida:**
1. Crear endpoint público: `POST /api/auth/register`
2. Validar que solo se puedan crear usuarios tipo cliente (tipo_usuario = 1)
3. Validar datos con express-validator
4. Hashear contraseña antes de guardar
5. Agregar botón "Registrarse" en `login.html`
6. Crear formulario de registro (opcional, puede ser modal)

**Prioridad:** Baja (funcionalidad extra, no requerida)

**Código Estimado:**
- Nueva función en `authController.js`
- Nueva ruta en `src/routes/auth.js`
- Validador para registro (puede usar parte de `usuarioValidator`)
- Frontend: Formulario de registro

---

## 📝 PRIORIDADES Y ORDEN DE IMPLEMENTACIÓN

### **Prioridad ALTA (Requisitos del Trabajo Final):**

**1. Confirmación de Reservas** ⚠️
- **Motivo:** El trabajo final menciona "cuando se confirma una reserva", lo que implica un estado pendiente → confirmada
- **Tiempo estimado:** 2-3 horas
- **Archivos a modificar:**
  - `src/controllers/reservaController.js`
  - `src/services/notificationService.js`
  - `src/routes/reservas.js`
  - Frontend de reservas (cliente y admin)

### **Prioridad MEDIA (Mejoras importantes):**

**2. UI de Notificaciones en Frontend**
- **Motivo:** Sistema de notificaciones está implementado pero no visible para el usuario
- **Tiempo estimado:** 2-3 horas
- **Archivos a crear/modificar:**
  - `public/scripts/notificaciones.js` (nuevo)
  - `public/scripts/sidebar.js` (modificar)
  - `public/styless/main.css` (modificar)
  - HTML de sidebar (modificar)

**3. Disponibilidad de Salones/Turnos**
- **Motivo:** Index público necesita mostrar disponibilidad real
- **Tiempo estimado:** 2-3 horas
- **Archivos a crear/modificar:**
  - `src/controllers/salonController.js` (nueva función)
  - `src/routes/salones.js` (nueva ruta)
  - `public/index-public.html` (modificar)
  - Script para frontend público

### **Prioridad BAJA (Funcionalidades extra):**

**4. Sistema de Recordatorios Automáticos (Cron)**
- **Motivo:** Funcionalidad extra, backend completo
- **Tiempo estimado:** 1 hora (solo configuración)
- **Archivos a crear:**
  - `scripts/send_reminders.js` (restaurar)
  - Documentación de configuración

**5. Registro de Clientes (Público)**
- **Motivo:** Funcionalidad extra del trabajo final
- **Tiempo estimado:** 2-3 horas
- **Archivos a crear/modificar:**
  - `src/controllers/authController.js` (nueva función)
  - `src/routes/auth.js` (nueva ruta)
  - `public/login.html` (modificar)
  - Formulario de registro (nuevo)

---

## 🎯 RESUMEN EJECUTIVO

### **✅ COMPLETADO:**
- Todos los requisitos principales del trabajo final están implementados
- Sistema funcional y probado
- Documentación Swagger completa
- Validaciones implementadas
- Manejo de errores apropiado

### **✅ COMPLETADO:**
- **Confirmación de Reservas**: Implementado completamente
  - Campo `estado` agregado a tabla `reservas`
  - Reservas se crean con estado `'pendiente'`
  - Endpoint `PATCH /api/reservas/:id/confirmar` para confirmar (solo admin)
  - Notificación especial cuando se confirma (`reserva_confirmada`)

### **🔄 MEJORAS SUGERIDAS:**
- UI de notificaciones visible en frontend
- Disponibilidad real de salones en index público
- Recordatorios automáticos configurados
- Registro público de clientes (funcionalidad extra)

---

## 📌 NOTAS IMPORTANTES

1. **El sistema está funcional y cumple con los requisitos técnicos del trabajo final**
2. **El único item que podría interpretarse como faltante es el estado "confirmada" de reservas**, aunque el sistema funciona correctamente sin él (las reservas se crean y están activas)
3. **Las mejoras sugeridas son opcionales y mejoran la experiencia del usuario**
4. **Todos los archivos están documentados en GUIA_DE_LA_APLICACION.md**

