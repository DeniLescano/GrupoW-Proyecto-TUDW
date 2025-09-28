# Guía del Proyecto: API de Reservas PROGIII

Este documento sirve como una guía central para la instalación, configuración, y desarrollo continuo de la API para el sistema de reservas de salones de cumpleaños.

## 1. Descripción General del Proyecto

Esta API REST, desarrollada en Node.js con el framework Express, gestiona las operaciones de un sistema de reservas de salones. Se conecta a una base de datos MySQL para persistir la información y expone una serie de endpoints para interactuar con los recursos de la aplicación.

## 2. Estructura del Proyecto

La estructura de la API (`progiii-api`) es la siguiente:

```
progiii-api/
├── 📁 database/
│   ├── 📁 migrations/
│   │   └── 001_initial_schema.sql   # Script SQL para crear todas las tablas
│   └── 📁 seeds/
│       └── initial_data.sql         # Script SQL para poblar la BD con datos de prueba
│
├── 📁 src/
│   ├── 📁 config/
│   │   └── database.js              # Configuración de la conexión a MySQL
│   │
│   ├── 📁 controllers/
│   │   └── salonController.js       # Lógica de negocio para la entidad 'salones'
│   │
│   ├── 📁 middlewares/              # (Vacío) Para futuros middlewares
│   │
│   ├── 📁 routes/
│   │   └── salones.js               # Define los endpoints para /api/salones
│   │
│   ├── 📁 utils/                    # (Vacío) Para futuras funciones auxiliares
│   │
│   └── app.js                       # Archivo principal de Express (configura middlewares y rutas)
│
├── .env                             # Variables de entorno (versionado para el equipo)
├── .gitignore                       # Archivo para ignorar dependencias (node_modules)
├── package.json                     # Dependencias y scripts del proyecto
└── server.js                        # Punto de entrada (inicia el servidor)
```

## 3. Cómo Instalar y Configurar el Entorno

Sigue estas instrucciones para tener un entorno de desarrollo funcional en tu máquina.

### 3.1. Prerrequisitos

Asegúrate de tener instalado el siguiente software:
- **Node.js**: (Versión 18 o superior)
- **npm**: (Generalmente se instala con Node.js)
- **Git**: Para clonar el repositorio.
- **Servidor de MySQL**: La base de datos del proyecto.
- **Cliente de API REST**: Se recomienda [Bruno](https://www.usebruno.com/) o Postman para probar los endpoints.

### 3.2. Pasos de Instalación

1.  **Clonar el Repositorio:**
    ```bash
    git clone https://github.com/DeniLescano/GrupoW-Proyecto-TUDW
    cd GrupoW-Proyecto-TUDW
    ```

2.  **Instalar Dependencias de Node.js:**
    Navega a la carpeta de la API e instala los paquetes de npm.
    ```bash
    cd progiii-api
    npm install
    ```

3.  **Configurar la Base de Datos MySQL:**
    - **Instala MySQL Server** en tu sistema (puedes seguir la guía para [Linux](https://dev.mysql.com/doc/mysql-apt-repo-quick-guide/en/) o usar [MySQL Installer para Windows](https://dev.mysql.com/downloads/installer/)).
    - Durante la instalación, asegúrate de guardar la **contraseña del usuario `root`**.
    - Una vez instalado, inicia sesión en MySQL como `root` (ej: `sudo mysql` en Linux o usando MySQL Workbench en Windows).
    - Ejecuta los siguientes comandos SQL para crear la base de datos y el usuario que usará la API:
    ```sql
    CREATE DATABASE reservas;
    CREATE USER 'progiii_user'@'localhost' IDENTIFIED BY 'prog123';
    GRANT ALL PRIVILEGES ON reservas.* TO 'progiii_user'@'localhost';
    FLUSH PRIVILEGES;
    EXIT;
    ```
    > **Nota:** La contraseña `'prog123'` coincide con la que está configurada en el archivo `.env` del proyecto. Si decides usar una contraseña diferente, recuerda actualizarla en el archivo `.env`.

### 3.3. Cargar Datos Iniciales

Para que la aplicación funcione con datos de prueba, necesitas crear la estructura de las tablas y luego poblarlas.

1.  **Crear la Estructura (Tablas):**
    El archivo `database/migrations/001_initial_schema.sql` contiene la estructura de todas las tablas. Ejecuta el siguiente comando desde el directorio `progiii-api`:
    ```bash
    mysql -u progiii_user -p reservas < database/migrations/001_initial_schema.sql
    ```
    *(Te pedirá la contraseña que configuraste: `prog123`)*.

2.  **Cargar los Datos (Semillas):**
    El siguiente comando limpia las tablas (para evitar duplicados) y luego inserta los datos de prueba desde `database/seeds/initial_data.sql`.
    ```bash
    mysql -u progiii_user -p reservas < database/seeds/initial_data.sql
    ```

### 3.4. Iniciar el Servidor

Una vez completados los pasos anteriores, puedes iniciar el servidor en modo de desarrollo:
```bash
npm run dev
```
El servidor estará corriendo en `http://localhost:3000`.

## 4. Funcionalidad Implementada

Actualmente, la API cuenta con un BREAD (Browse, Read, Edit, Add, Delete) completo para la entidad **Salones**.

### Endpoints de Salones (`/api/salones`)

-   **`GET /` (Browse):** Lista todos los salones activos.
-   **`GET /:id` (Read):** Muestra un salón específico por su ID.
-   **`POST /` (Add):** Crea un nuevo salón. Requiere un cuerpo JSON con `titulo`, `direccion`, `capacidad` e `importe`.
-   **`PUT /:id` (Edit):** Actualiza un salón existente. Requiere un cuerpo JSON con los campos a modificar.
-   **`DELETE /:id` (Delete):** Realiza un borrado lógico del salón (cambia el campo `activo` a `0`).

**Ejemplo de cuerpo JSON para `POST` y `PUT`:**
```json
{
    "titulo": "Nombre del Salón",
    "direccion": "Dirección del Salón",
    "capacidad": 100,
    "importe": 150000.00
}
```

## 5. Próximos Pasos y Mejoras

Para completar los requisitos del Trabajo Final, se deben abordar las siguientes funcionalidades:

**Prioridad Alta - Funcionalidad Central Faltante:**

1.  **Autenticación con JWT:** Implementar un endpoint `/api/auth/login` que genere un token para proteger las rutas.
2.  **Autorización por Roles:** Restringir el acceso a ciertos endpoints según el rol del usuario (Cliente, Empleado, Administrador).
3.  **Completar BREAD para todas las Entidades:** Crear la lógica de rutas y controladores para `usuarios`, `turnos`, `servicios` y `reservas`.

**Prioridad Media - Requisitos Técnicos Adicionales:**

4.  **Documentación con Swagger:** Integrar `swagger-ui-express` y `swagger-jsdoc` para generar documentación interactiva.
5.  **Validaciones con `express-validator`:** Reemplazar las validaciones manuales por middlewares de validación.

**Prioridad Baja - Funcionalidades Adicionales:**

6.  **Generación de Informes y Estadísticas:** Crear endpoints que ejecuten `stored procedures` para devolver datos procesados.