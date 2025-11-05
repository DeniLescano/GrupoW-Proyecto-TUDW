ENUNCIADO

La empresa para la que usted trabaja ha inaugurado una nueva unidad de negocios llamada “PROGIII”. Dado su excelente desempeño en proyectos anteriores —en particular en el sistema de Gestión de Reservas de Casas de Cumpleaños— ha sido asignado como parte del equipo responsable de diseñar y desarrollar la API REST que se integrará con un cliente web previamente desarrollado. La misma deberá contemplar autenticación, autorización y validación de datos para la gestión de reservas de salones de cumpleaños.

FECHAS DE ENTREGA
	Primera entrega (avance funcional mínimo): 09/10/2025
	BREAD (Browse, Read, Edit, Add, Delete) completo de alguna entidad del API contemplando las mejores prácticas vistas en clase.
	Entrega final (versión completa): 06/11/2025
	Con todos los requerimientos completados.
	Recuperatorio de entrega final (versión completa): 18/11/2025
	Con todos los requerimientos completados.
REQUISITOS FUNCIONALES
Roles y permisos:
Cliente
	Iniciar sesión (autenticación).
	Limitado para:
	Reservas (crear, listar).
	Listado de:
	Salones.
	Servicios.
	Turnos.
	Recepción de notificaciones automáticas cuando se confirma una reserva.
Empleado
	Iniciar sesión (autenticación).
	Listado de:
	Reservas.
	Clientes.
	BREAD completo para:
	Salones, Servicios, Turnos.

Administrador
	Iniciar sesión (autenticación).
 
	BREAD completo para:
	Reservas, Salones, Servicios, Turnos, Usuarios.
	Generación de:
	Informes estadísticos (a través de procedimientos almacenados).
	Reportes de reservas en: PDF – CSV – otros (No JSON).
	Recepción de notificaciones automáticas cuando se realiza una reserva.
ASPECTOS TÉCNICOS REQUERIDOS
	Autenticación con JWT.
	Autorización por roles.
	Uso del framework Express.
	Persistencia de datos en MySQL.
	Buen manejo de errores y respuestas HTTP apropiadas.
	Documentación del API haciendo uso de Swagger.
	Validaciones utilizando middleware como express-validator.
RESTRICCIONES Y REGLAS DE NEGOCIO:
	Una reserva puede ser modificada únicamente por un administrador.
	Las estadísticas deben generarse exclusivamente mediante procedimientos almacenados (stored procedures).
	Los informes en PDF deben contener los datos de reservas con sus servicios, salón, turno y cliente.
	Los “delete” no serán borrados físicos, se utilizaran “soft delete”, es decir se utilizará el campo activo para indicar si el registro de la tabla esta borrado o no.
MODELO DE DATOS
•	salones: salon_id, titulo, direccion, latitud, longitud, capacidad, importe, creado, modificado, activo.
•	servicios: servicio_id, descripcion, importe, creado, modificado, activo.
•	turnos: turno_id, orden, hora_desde, hora_hasta, creado, modificado, activo.
•	reservas: reserva_id, fecha_reserva, salon_id, usuario_id, turno_id, foto_cumpleaniero, tematica, importe_salon, importe_total, creado, modificado, activo.
•	reservas_servicios:	reserva_servicio_id,	reserva_id,	servicio_id,	importe,	creado, modificado.
•	usuarios: usuario_id, nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto, creado, modificado, activo.
 
EXTRAS
Cada grupo podrá agregar una funcionalidad extra al desarrollo.

Lista de ejemplos:
	Sistema de encuestas: después de realizado el cumpleaños permitir al cliente completar una encuesta de satisfacción (agregar una tabla que se relacione con la reserva).
	Sistema de comentarios/observaciones: permitir a los empleados u administradores agregar comentarios/observaciones sobre las reservas (ej. “Pago 50% de la reserva”).
	Reinicio de contraseña para los usuarios.
	Dashboard de estadísticas simple: HTML, CSS, JS.
	Recordatorio al cliente 24hs antes de la reserva.
	Sistema de auditoría: historial de acciones por usuario básico y sencillo.
	Registro de usuario tipo “cliente”.
	Registro de invitados.
