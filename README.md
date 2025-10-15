# API de Reservas de Salones - PROGIII

## 1. Introducción

Bienvenido a la API de Reservas de Salones, el backend para el sistema de gestión de cumpleaños "PROGIII". Esta API REST ha sido desarrollada en **Node.js** utilizando el framework **Express.js** y se conecta a una base de datos **MySQL** para la persistencia de datos. 

El sistema está diseñado con una arquitectura robusta que incluye autenticación por tokens **JWT**, un sistema de autorización basado en roles, validación de datos de entrada y un manejo de errores centralizado, siguiendo las mejores prácticas de desarrollo de software.

## 2. Arquitectura y Tecnologías

- **Framework:** Express.js
- **Base de Datos:** MySQL
- **Autenticación:** JSON Web Tokens (JWT)
- **Validación:** `express-validator`
- **Documentación:** `swagger-jsdoc` y `swagger-ui-express`
- **Entorno de Desarrollo:** `nodemon` para recarga automática y `.env` para variables de entorno.

La lógica de la aplicación está organizada de la siguiente manera:

- **`src/config`**: Contiene la configuración de la base de datos y Swagger.
- **`src/controllers`**: Separa la lógica de negocio para cada entidad (Usuarios, Salones, Reservas, etc.).
- **`src/middlewares`**: Contiene los middlewares para autenticación, autorización por roles, validación y manejo de errores.
- **`src/routes`**: Define los endpoints de la API para cada recurso.
- **`src/utils`**: Utilidades para simplificar el código, como el manejador de funciones asíncronas.

## 3. Guía de Pruebas

### 3.1. Probar con Swagger (Recomendado)

La forma más sencilla de explorar y probar la API es a través de su documentación interactiva generada con Swagger.

1.  **Inicia el servidor:** `npm run dev`
2.  **Abre el navegador:** Ve a [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

Desde esta interfaz podrás ver todos los endpoints, sus parámetros, y ejecutar peticiones directamente. Para las rutas protegidas, sigue las instrucciones en la misma página para autenticarte usando un token JWT.

### 3.2. Probar con cURL (Línea de Comandos)

Si prefieres usar la terminal, puedes utilizar `cURL`.

**1. Listar Salones (Público):**
```bash
curl http://localhost:3000/api/salones
```

**2. Listar Servicios (Público):**
```bash
curl http://localhost:3000/api/servicios
```

**3. Listar Turnos (Público):**
```bash
curl http://localhost:3000/api/turnos
```

**4. Registrar un nuevo Cliente:**
```bash
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d \
'{ 
  "nombre": "Carlos",
  "apellido": "Santana",
  "nombre_usuario": "carlos.santana@correo.com",
  "contrasenia": "guitarra123"
}'
```

**5. Iniciar Sesión y Capturar el Token:**
```bash
# Ejecuta este comando y copia el "accessToken" de la respuesta.
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d \
'{ 
  "nombre_usuario": "carlos.santana@correo.com",
  "contrasenia": "guitarra123"
}' | grep -o '"accessToken":"[^"]*' | cut -d '"' -f 4)

echo "Token capturado: $TOKEN"
```

**6. Crear una Reserva (como Cliente):**
```bash
curl -X POST http://localhost:3000/api/reservas \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d \
'{ 
  "salon_id": 1,
  "turno_id": 2,
  "fecha_reserva": "2025-12-31",
  "tematica": "Fiesta de Fin de Año",
  "servicios": [ { "servicio_id": 1 }, { "servicio_id": 4 } ]
}'
```

**7. Listar Usuarios (como Administrador):**
*(Primero inicia sesión con un usuario admin, como `oscram@correo.com`, para obtener un TOKEN de administrador)*
```bash
curl -X GET http://localhost:3000/api/usuarios -H "Authorization: Bearer $TOKEN_ADMIN"
```

### 3.3. Probar con cURL (PowerShell)

Si estás en Windows, `curl` es un alias de `Invoke-WebRequest` y la sintaxis para el cuerpo de la petición cambia.

**1. Listar Salones (Público):**
```powershell
curl http://localhost:3000/api/salones
```

**2. Listar Servicios (Público):**
```powershell
curl http://localhost:3000/api/servicios
```

**3. Listar Turnos (Público):**
```powershell
curl http://localhost:3000/api/turnos
```

**4. Registrar un nuevo Cliente:**
```powershell
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -Body '{ "nombre": "Test", "apellido": "User", "nombre_usuario": "test.user@correo.com", "contrasenia": "password123" }'
```

**5. Iniciar Sesión y Capturar el Token:**
```powershell
$response = curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -Body '{ "nombre_usuario": "test.user@correo.com", "contrasenia": "password123" }' | ConvertFrom-Json
$TOKEN = $response.accessToken
echo "Token capturado: $TOKEN"
```

**6. Crear una Reserva (como Cliente):**
```powershell
$body = '{ "salon_id": 1, "turno_id": 2, "fecha_reserva": "2025-12-31", "tematica": "Fiesta de Fin de Año", "servicios": [ { "servicio_id": 1 }, { "servicio_id": 4 } ] }'
curl -X POST http://localhost:3000/api/reservas -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -Body $body
```

## 4. Instalación

1.  **Clonar Repositorio:** `git clone <URL_DEL_REPO>`
2.  **Instalar Dependencias:** `cd progiii-api && npm install`
3.  **Configurar `.env`:** Crea un archivo `.env` en la raíz de `progiii-api/` y configúralo con tus credenciales de MySQL:
    ```
    DB_HOST=localhost
    DB_USER=tu_usuario_mysql
    DB_PASSWORD=tu_contraseña_mysql
    DB_DATABASE=reservas
    JWT_SECRET=un_secreto_muy_largo_y_dificil_de_adivinar
    ```
4.  **Base de Datos:** Asegúrate de que el servidor MySQL esté activo y ejecuta los scripts de la carpeta `database/` para crear el esquema y poblar los datos.
    ```bash
    # Usando el script oficial del proyecto
    mysql -u tu_usuario -p reservas < database/migrations/001_initial_schema.sql
    mysql -u tu_usuario -p reservas < database/seeds/initial_data.sql
    ```
5.  **Iniciar Servidor:**
    ```bash
    npm run dev
    ```

## 5. Despliegue Local

Para desplegar la aplicación en tu máquina local, sigue estos pasos:

1.  **Instala MySQL:** Descarga e instala MySQL Community Server desde el [sitio web oficial](https://dev.mysql.com/downloads/mysql/).
2.  **Crea la base de datos:**
    *   Abre una terminal de MySQL o un cliente como MySQL Workbench.
    *   Crea un usuario y una base de datos para el proyecto.
        ```sql
        CREATE DATABASE reservas;
        CREATE USER 'user'@'localhost' IDENTIFIED BY 'password';
        GRANT ALL PRIVILEGES ON reservas.* TO 'user'@'localhost';
        FLUSH PRIVILEGES;
        ```
3.  **Configura el archivo `.env`:**
    *   En el directorio `progiii-api`, renombra o copia `.env.example` a `.env` (si existe) o crea el archivo.
    *   Modifica el archivo `.env` con las credenciales que creaste en el paso anterior.
        ```
        DB_HOST=localhost
        DB_USER=user
        DB_PASSWORD=password
        DB_DATABASE=reservas
        JWT_SECRET=un_secreto_muy_largo_y_dificil_de_adivinar
        ```
4.  **Carga el esquema y los datos iniciales:**
    *   Desde la carpeta raíz del proyecto, ejecuta los siguientes comandos:
        ```bash
        mysql -u user -p reservas < progiii-api/database/migrations/001_initial_schema.sql
        mysql -u user -p reservas < progiii-api/database/seeds/initial_data.sql
        ```
5.  **Instala las dependencias y ejecuta la aplicación:**
    *   Navega a la carpeta `progiii-api` y ejecuta:
        ```bash
        npm install
        npm run dev
        ```
6.  **Verifica la aplicación:**
    *   La API debería estar corriendo en `http://localhost:3000`.
    *   Puedes verificar la documentación de la API en `http://localhost:3000/api-docs`.