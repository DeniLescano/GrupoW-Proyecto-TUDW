# Credenciales para Acceder a la Aplicación

## Importante: Actualizar contraseñas en la base de datos

Primero, ejecuta el script SQL para actualizar las contraseñas:

```bash
mysql -u root -p reservas < database/seeds/usuarios_prueba.sql
```

O ejecuta el SQL directamente en MySQL.

## Credenciales de Acceso

**Contraseña para TODOS los usuarios: `123456`**

### Administradores (tipo_usuario = 3)

1. **Alberto López**
   - Usuario: `alblop@correo.com`
   - Contraseña: `123456`

2. **Pamela Gómez**
   - Usuario: `pamgom@correo.com`
   - Contraseña: `123456`

3. **Esteban Ciro**
   - Usuario: `estcir@correo.com`
   - Contraseña: `123456`

### Empleados (tipo_usuario = 2)

1. **William Corbalán**
   - Usuario: `wilcor@correo.com`
   - Contraseña: `123456`

2. **Anahí Flores**
   - Usuario: `anaflo@correo.com`
   - Contraseña: `123456`

### Clientes (tipo_usuario = 1)

1. **Oscar Ramirez**
   - Usuario: `oscram@correo.com`
   - Contraseña: `123456`

2. **Claudia Juárez**
   - Usuario: `clajua@correo.com`
   - Contraseña: `123456`

## Acceso por Rol

- **Administradores**: Acceso completo al sistema (index.html)
- **Empleados**: Gestión de servicios, turnos, ver reservas y clientes (empleado/index.html)
- **Clientes**: Ver y crear reservas, ver salones/servicios/turnos (cliente/index.html)

## URL de la Aplicación

Frontend: `http://localhost:5500` o `http://127.0.0.1:5500`
Backend API: `http://localhost:3007`

## Nota

Si las contraseñas no funcionan después de ejecutar el script SQL, asegúrate de que:
1. El servidor backend esté corriendo
2. La base de datos `reservas` esté creada
3. Las tablas estén creadas correctamente
4. El script SQL se haya ejecutado sin errores

