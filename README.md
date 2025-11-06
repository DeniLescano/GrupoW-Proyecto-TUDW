# 🎂 API de Reservas PROGIII 🎂

![Node.js](https://img.shields.io/badge/Node.js-14%2B-blue?style=for-the-badge&logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-4.x-green?style=for-the-badge&logo=express)
![MySQL](https://img.shields.io/badge/MySQL-5.7%2B-orange?style=for-the-badge&logo=mysql)

> 📌 **Nota Importante:** Este documento es una guía de inicio rápido. Para una documentación exhaustiva y detallada de todas las funcionalidades, por favor consulta el archivo **[GUIA_DE_LA_APLICACION.md](GUIA_DE_LA_APLICACION.md)**.

## 📖 Descripción General

Esta API REST, desarrollada en **Node.js** con el framework **Express**, es el backend para un sistema de gestión de reservas de salones de cumpleaños. Se conecta a una base de datos **MySQL** para persistir la información y expone una serie de endpoints para interactuar con los recursos de la aplicación.

## ✨ Características Principales

*   🔐 **Autenticación y Autorización:** Sistema completo basado en **JWT** con roles (`Cliente`, `Empleado`, `Administrador`).
*   🗂️ **Gestión de Entidades (BREAD):** BREAD (Browse, Read, Edit, Add, Delete) completo para `Usuarios`, `Salones`, `Servicios`, `Turnos` y `Reservas`.
*   📊 **Informes y Estadísticas:** Generación de estadísticas mediante **Stored Procedures** y exportación de reportes en formato **PDF** y **CSV**.
*   📧 **Notificaciones y Emails:** Envío de notificaciones automáticas y correos electrónicos para eventos clave (creación, confirmación y cancelación de reservas).
*   ⭐ **Funcionalidades Extra:** Sistema de comentarios en reservas, registro público de clientes, y gestión de "soft delete".

## 📂 Estructura del Proyecto

La estructura principal de la API (`progiii-api`) es la siguiente:

```
progiii-api/
├── database/         # Migraciones y seeds
├── public/           # Archivos del frontend
├── src/              # Código fuente de la API
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── validators/
├── .env.example      # Ejemplo de variables de entorno
├── .gitignore
├── package.json
└── server.js         # Punto de entrada de la aplicación
```

## 🚀 Puesta en Marcha

### 4.1. Prerrequisitos

*   Node.js (v14 o superior)
*   npm
*   Git
*   Servidor de MySQL

### 4.2. Pasos de Instalación

1.  **Clonar el Repositorio:**
    ```bash
    git clone https://github.com/DeniLescano/GrupoW-Proyecto-TUDW
    cd GrupoW-Proyecto-TUDW/progiii-api
    ```

2.  **Instalar Dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Base de Datos:**
    - Inicia sesión en MySQL como `root`.
    - Crea la base de datos y el usuario dedicado:
    ```sql
    CREATE DATABASE reservas;
    CREATE USER 'progiii_user'@'localhost' IDENTIFIED BY 'prog123';
    GRANT ALL PRIVILEGES ON reservas.* TO 'progiii_user'@'localhost';
    FLUSH PRIVILEGES;
    EXIT;
    ```

4.  **Configurar Variables de Entorno:**
    - Renombra el archivo `.env.example` a `.env`.
    > Las credenciales por defecto en `.env.example` coinciden con las del paso anterior, por lo que no se necesitan cambios.

5.  **Ejecutar Migraciones y Seeds:**
    Ejecuta los siguientes scripts **en orden**. Se utilizará la contraseña `prog123`.
    ```bash
    # 1. Estructura de tablas
    mysql -u progiii_user -p'prog123' reservas < database/migrations/001_initial_schema.sql

    # 2. Stored Procedures
    mysql -u progiii_user -p'prog123' reservas < database/migrations/002_stored_procedures.sql

    # 3. Tabla de Notificaciones
    mysql -u progiii_user -p'prog123' reservas < src/database/create_notifications_table.sql

    # 4. Tabla de Comentarios
    mysql -u progiii_user -p'prog123' reservas < scripts/create_comentarios_table.sql

    # 5. (Opcional) Cargar datos de prueba
    mysql -u progiii_user -p'prog123' reservas < database/seeds/initial_data.sql
    mysql -u progiii_user -p'prog123' reservas < database/seeds/usuarios_prueba.sql
    ```

6.  **Iniciar el Servidor:**
    ```bash
    npm run dev
    ```
    🎉 ¡El servidor estará corriendo en `http://localhost:3007`!

## 📚 Documentación Detallada

Para una guía completa sobre cada endpoint, la lógica de negocio, y todas las funcionalidades en detalle, por favor consulta el archivo **[GUIA_DE_LA_APLICACION.md](GUIA_DE_LA_APLICACION.md)**.