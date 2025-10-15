# Plan de Pruebas Robustas para la API PROGIII

Este documento contiene una serie de pruebas utilizando `cURL` para verificar la robustez, seguridad y correcta funcionalidad de la API. Se recomienda ejecutar estos comandos en una terminal como Git Bash o WSL para una mejor experiencia.

## 1. Pruebas de Autenticación (`/api/auth`)

### 1.1. Registro de Usuario

**Caso 1: Registro Exitoso**
```bash
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d 
'{ "nombre": "Test", "apellido": "User", "nombre_usuario": "test.user@correo.com", "contrasenia": "password123" }'
# Esperado: HTTP 201 Created
```

**Caso 2: Intento de Registro Duplicado**
```bash
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d 
'{ "nombre": "Test", "apellido": "User", "nombre_usuario": "test.user@correo.com", "contrasenia": "password123" }'
# Esperado: HTTP 409 Conflict - { "message": "El nombre de usuario ya existe." }
```

**Caso 3: Registro con Datos Inválidos (Email incorrecto)**
```bash
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d 
'{ "nombre": "Test", "apellido": "User", "nombre_usuario": "esto-no-es-un-email", "contrasenia": "password123" }'
# Esperado: HTTP 400 Bad Request - con un array de errores de validación.
```

### 1.2. Login de Usuario

**Caso 1: Login Exitoso**
```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d 
'{ "nombre_usuario": "test.user@correo.com", "contrasenia": "password123" }'
# Esperado: HTTP 200 OK - con un "accessToken".
```

**Caso 2: Login con Contraseña Incorrecta**
```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d 
'{ "nombre_usuario": "test.user@correo.com", "contrasenia": "password_incorrecto" }'
# Esperado: HTTP 401 Unauthorized - { "message": "Email o contraseña incorrectos." }
```

## 2. Pruebas de Autorización (Roles)

*Para estas pruebas, primero obtén un token de **Cliente** (ej. `test.user@correo.com`) y un token de **Administrador** (ej. `oscram@correo.com`).*

```bash
# Exporta tus tokens a variables de entorno para facilitar las pruebas
export CLIENT_TOKEN="tu_token_de_cliente"
export ADMIN_TOKEN="tu_token_de_admin"
```

**Caso 1: Cliente intenta listar todos los usuarios**
```bash
curl -X GET http://localhost:3000/api/usuarios -H "Authorization: Bearer $CLIENT_TOKEN"
# Esperado: HTTP 403 Forbidden - { "message": "Forbidden: No tienes permiso para realizar esta acción" }
```

**Caso 2: Petición sin Token de Autenticación**
```bash
curl -X GET http://localhost:3000/api/usuarios
# Esperado: HTTP 401 Unauthorized
```

**Caso 3: Administrador puede listar todos los usuarios**
```bash
curl -X GET http://localhost:3000/api/usuarios -H "Authorization: Bearer $ADMIN_TOKEN"
# Esperado: HTTP 200 OK - con una lista de usuarios.
```

## 3. Pruebas de Lógica de Negocio (`/api/reservas`)

**Caso 1: Cliente crea una reserva (Éxito)**
```bash
curl -X POST http://localhost:3000/api/reservas \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $CLIENT_TOKEN" \
-d 
'{ "salon_id": 2, "turno_id": 3, "fecha_reserva": "2025-11-20", "tematica": "Superhéroes", "servicios": [ { "servicio_id": 5 }, { "servicio_id": 6 } ] }'
# Esperado: HTTP 201 Created - con el ID y el importe total de la nueva reserva.
```

**Caso 2: Cliente intenta crear una reserva con datos inválidos (fecha incorrecta)**
```bash
curl -X POST http://localhost:3000/api/reservas \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $CLIENT_TOKEN" \
-d 
'{ "salon_id": 2, "turno_id": 3, "fecha_reserva": "esto-no-es-una-fecha" }'
# Esperado: HTTP 400 Bad Request - con un array de errores de validación.
```

**Caso 3: Cliente intenta ver una reserva que no es suya**
*(Suponiendo que la reserva con ID 1 pertenece a otro usuario)*
```bash
curl -X GET http://localhost:3000/api/reservas/1 -H "Authorization: Bearer $CLIENT_TOKEN"
# Esperado: HTTP 403 Forbidden - { "message": "Forbidden: No tienes permiso para ver esta reserva" }
```
