# 📧 Sistema de Envío de Emails

## ¿Cómo Funciona?

El sistema de emails se activa automáticamente cuando ocurren ciertos eventos relacionados con reservas:

### 1. **Confirmación de Reserva**
- **Cuándo se envía:** Cuando un administrador confirma una reserva (cambia el estado a "confirmada")
- **A quién:** Al email del cliente que hizo la reserva
- **Contenido:** Detalles de la reserva confirmada (fecha, salón, horario, servicios, importe total)

### 2. **Cancelación de Reserva**
- **Cuándo se envía:** 
  - Cuando un cliente cancela su propia reserva (usando el botón "Cancelar Reserva" en "Mis Reservas")
  - Cuando un administrador desactiva/cancela una reserva
- **A quién:** Al email del cliente que hizo la reserva
- **Contenido:** Detalles de la reserva cancelada (fecha, salón, horario, importe)

## ¿Dónde Ver los Emails?

### Modo Desarrollo (Ethereal)
Cuando no hay credenciales SMTP configuradas, el sistema usa **Ethereal Email** (servicio de prueba):

1. **En la consola del servidor:** Cuando se envía un email, verás en la terminal:
   ```
   📧 Email de prueba enviado. Preview URL: https://ethereal.email/message/...
   ```

2. **En las notificaciones del frontend:** Cuando se cancela o confirma una reserva, aparecerá un alert que incluye:
   - Confirmación de envío del email
   - Email destino
   - **Preview URL** (enlace para ver el email en Ethereal)

3. **Copiar y abrir el Preview URL:** 
   - Copia la URL que aparece en el alert o en la consola
   - Ábrela en tu navegador
   - Verás el email completo tal como se enviaría

### Modo Producción (SMTP)
Si configuras credenciales SMTP en el archivo `.env`, los emails se enviarán realmente:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password
SMTP_FROM="Sistema de Reservas" <tu_email@gmail.com>
```

En este caso, los emails llegarán al buzón real del cliente.

## ¿Cuándo Verás las Notificaciones?

### Desde el Panel de Administrador:
1. **Al confirmar una reserva:**
   - Ve a "Gestión de Reservas"
   - Abre una reserva y cambia el estado a "confirmada"
   - Al guardar, verás un alert con:
     - ✅ Confirmación de actualización
     - 📧 Email de confirmación enviado a: [email del cliente]
     - 🔗 Preview URL (si está en modo desarrollo)

2. **Al cancelar/desactivar una reserva:**
   - Ve a "Gestión de Reservas"
   - Abre una reserva y haz clic en "Desactivar Reserva"
   - Verás un alert con:
     - ✅ Confirmación de cancelación
     - 📧 Email de cancelación enviado a: [email del cliente]
     - 🔗 Preview URL (si está en modo desarrollo)

### Desde el Panel de Cliente:
1. **Al cancelar tu propia reserva:**
   - Ve a "Mis Reservas"
   - Abre una reserva activa
   - Haz clic en "Cancelar Reserva"
   - Ingresa el motivo de cancelación
   - Verás un alert con:
     - ✅ Confirmación de cancelación
     - 📧 Email de cancelación enviado a: [tu email]
     - 🔗 Preview URL (si está en modo desarrollo)

## Ejemplo de Notificación

Cuando se envía un email, verás algo como esto:

```
Reserva confirmada exitosamente!

📧 Email de confirmación enviado a: cliente@ejemplo.com

🔗 Preview URL (modo desarrollo):
https://ethereal.email/message/wafls3e7q6k5i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0
```

**Para ver el email:**
1. Copia la URL completa
2. Ábrela en tu navegador
3. Verás el email con todos los detalles formateados

## Configuración Actual

El sistema está configurado para usar **Ethereal Email** (modo desarrollo) porque no hay credenciales SMTP configuradas. Esto significa que:

- ✅ Los emails se "envían" correctamente
- ✅ Puedes ver el contenido completo usando el Preview URL
- ❌ No se envían emails reales al cliente (solo en desarrollo)

Para enviar emails reales en producción, configura las variables de entorno SMTP en el archivo `.env`.

## Archivos Relacionados

- `src/services/emailService.js` - Lógica de envío de emails
- `src/controllers/reservaController.js` - Controlador que dispara los emails
- Variables de entorno: `.env` (SMTP_HOST, SMTP_USER, SMTP_PASS, etc.)

