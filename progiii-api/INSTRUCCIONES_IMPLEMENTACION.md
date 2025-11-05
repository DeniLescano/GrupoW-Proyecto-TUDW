# Instrucciones de Implementación - Funcionalidades Nuevas

## 📋 Funcionalidades Implementadas

### 1. ✅ Registro de Usuarios Clientes
- **Backend**: Endpoint `POST /api/v1/auth/register`
- **Frontend**: Página `public/registro.html`
- **Validaciones**: express-validator con validación de campos requeridos
- **Características**: 
  - Registro automático como cliente (tipo_usuario = 1)
  - Hash de contraseña con bcrypt
  - Generación automática de token JWT
  - Redirección automática al panel de cliente

### 2. ✅ Generación de PDF en Backend
- **Librería**: `pdfkit` (agregada a package.json)
- **Endpoint**: `GET /api/v1/reportes/reservas?formato=PDF`
- **Características**:
  - Modo horizontal (landscape) para mejor visualización de tablas
  - Incluye todos los datos de reservas (servicios, salón, turno, cliente)
  - Encabezados repetidos en nuevas páginas
  - Formato profesional con colores y estilos

### 3. ✅ Envío de Emails
- **Librería**: `nodemailer` (agregada a package.json)
- **Servicio**: `src/services/emailService.js`
- **Funcionalidades**:
  - Email de confirmación cuando se confirma una reserva
  - Email de cancelación cuando se cancela una reserva (soft delete)
  - Envío automático al email del cliente (nombre_usuario)
  - HTML templates profesionales con estilos
  - Soporte para ethereal (desarrollo) y SMTP (producción)

**Configuración de Email:**
- En desarrollo: usa nodemailer con ethereal (emails de prueba)
- En producción: configurar variables de entorno:
  ```
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=tu_email@gmail.com
  SMTP_PASS=tu_password
  SMTP_FROM="Sistema de Reservas <tu_email@gmail.com>"
  ```

### 4. ✅ Sistema de Comentarios/Observaciones
- **Backend**: 
  - Repository: `src/repositories/comentarioRepository.js`
  - Service: `src/services/comentarioService.js`
  - Controller: `src/controllers/comentarioController.js`
  - Routes: `src/routes/comentarios.js`
- **Base de Datos**: Tabla `comentarios_reservas` (crear con script SQL)
- **Endpoints**:
  - `GET /api/v1/reservas/:reservaId/comentarios` - Obtener comentarios
  - `POST /api/v1/reservas/:reservaId/comentarios` - Crear comentario (solo administradores)
  - `PUT /api/v1/comentarios/:id` - Actualizar comentario (solo el autor)
  - `DELETE /api/v1/comentarios/:id` - Eliminar comentario (solo el autor)
- **Frontend**: 
  - Sección de comentarios en modal de detalles de reserva
  - Agregar comentarios desde el modal
  - Visualización de comentarios con información del autor y fecha

## 🚀 Pasos para Instalar y Configurar

### 1. Instalar Dependencias NPM
```bash
cd progiii-api
npm install
```

Esto instalará las nuevas dependencias:
- `nodemailer`: Para envío de emails
- `pdfkit`: Para generación de PDFs en backend

### 2. Crear Tabla de Comentarios
Ejecutar el script SQL para crear la tabla de comentarios:

```bash
mysql -u tu_usuario -p tu_base_de_datos < scripts/create_comentarios_table.sql
```

O ejecutar manualmente el SQL contenido en `scripts/create_comentarios_table.sql`:
```sql
CREATE TABLE IF NOT EXISTS comentarios_reservas (
  comentario_id INT AUTO_INCREMENT PRIMARY KEY,
  reserva_id INT NOT NULL,
  usuario_id INT NOT NULL,
  comentario TEXT NOT NULL,
  creado DATETIME DEFAULT CURRENT_TIMESTAMP,
  modificado DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (reserva_id) REFERENCES reservas(reserva_id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
  INDEX idx_reserva_id (reserva_id),
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_creado (creado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. Configurar Variables de Entorno (Opcional para Producción)
Crear o actualizar `.env` con configuración de email (solo para producción):
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password_app
SMTP_FROM="Sistema de Reservas <tu_email@gmail.com>"
```

**Nota**: En desarrollo, el sistema usará automáticamente ethereal para emails de prueba.

### 4. Reiniciar el Servidor
```bash
npm start
# o
npm run dev
```

## 📝 Archivos Modificados/Creados

### Nuevos Archivos:
- `src/services/emailService.js` - Servicio de envío de emails
- `src/repositories/comentarioRepository.js` - Repository de comentarios
- `src/services/comentarioService.js` - Service de comentarios
- `src/controllers/comentarioController.js` - Controller de comentarios
- `src/routes/comentarios.js` - Rutas de comentarios
- `public/registro.html` - Página de registro de clientes
- `scripts/create_comentarios_table.sql` - Script SQL para tabla de comentarios
- `INSTRUCCIONES_IMPLEMENTACION.md` - Este archivo

### Archivos Modificados:
- `src/validators/authValidator.js` - Agregado `registerValidator`
- `src/services/authService.js` - Agregado método `register`
- `src/controllers/authController.js` - Agregado método `register`
- `src/routes/auth.js` - Agregada ruta `/register`
- `src/services/reporteService.js` - Agregado método `generarPDF`
- `src/controllers/reportesController.js` - Actualizado para generar PDF en backend
- `src/controllers/reservaController.js` - Integrado envío de emails en confirmar/cancelar
- `src/services/reservaService.js` - Actualizado `getReservaById` para aceptar `includeInactive`
- `src/repositories/reservaRepository.js` - Actualizado `findById` para aceptar `includeInactive`
- `public/login.html` - Agregado enlace a registro
- `public/administrador/reservas.html` - Agregada sección de comentarios
- `public/scripts/administrador-reservas.js` - Agregadas funciones para comentarios
- `src/app.js` - Agregadas rutas de comentarios
- `package.json` - Agregadas dependencias `nodemailer` y `pdfkit`

## ✅ Verificación

### Verificar Registro de Clientes:
1. Ir a `http://localhost:3007/registro.html`
2. Completar el formulario de registro
3. Verificar que se crea el usuario y se redirige al panel de cliente

### Verificar Generación de PDF:
1. Como administrador, ir a "Informe de Reservas"
2. Seleccionar formato "PDF"
3. Verificar que se descarga un PDF con todos los datos

### Verificar Envío de Emails:
1. Confirmar una reserva (como administrador)
2. Verificar en consola del servidor el mensaje de email enviado
3. Si usa ethereal, copiar la URL de preview del email
4. Cancelar una reserva y verificar envío de email de cancelación

### Verificar Comentarios:
1. Como administrador, abrir detalles de una reserva
2. Ver sección de comentarios al final del modal
3. Agregar un comentario
4. Verificar que aparece en la lista de comentarios

## 🔧 Solución de Problemas

### Error: "Cannot find module 'pdfkit'"
**Solución**: Ejecutar `npm install` para instalar las dependencias

### Error: "Cannot find module 'nodemailer'"
**Solución**: Ejecutar `npm install` para instalar las dependencias

### Error: "Table 'comentarios_reservas' doesn't exist"
**Solución**: Ejecutar el script SQL para crear la tabla

### Los emails no se envían:
- En desarrollo, verificar en consola la URL de preview de ethereal
- En producción, verificar variables de entorno SMTP
- Verificar que el email del cliente (nombre_usuario) sea válido

### Los PDFs no se generan:
- Verificar que `pdfkit` esté instalado
- Verificar permisos de escritura en el servidor
- Revisar logs del servidor para errores

