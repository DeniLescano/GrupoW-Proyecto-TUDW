CREATE DATABASE IF NOT EXISTS `reservas` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `reservas`;

--
-- Estructura de tabla para la tabla `usuarios`
--
CREATE TABLE `usuarios` (
  `usuario_id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `nombre_usuario` varchar(50) NOT NULL,
  `contrasenia` varchar(255) NOT NULL,
  `tipo_usuario` tinyint(4) NOT NULL,
  `celular` varchar(20) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modificado` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`usuario_id`),
  UNIQUE KEY `nombre_usuario` (`nombre_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Estructura de tabla para la tabla `turnos`
--
CREATE TABLE `turnos` (
  `turno_id` int(11) NOT NULL AUTO_INCREMENT,
  `orden` int(11) NOT NULL,
  `hora_desde` time NOT NULL,
  `hora_hasta` time NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modificado` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`turno_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Estructura de tabla para la tabla `servicios`
--
CREATE TABLE `servicios` (
  `servicio_id` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(255) NOT NULL,
  `importe` decimal(10,2) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modificado` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`servicio_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Estructura de tabla para la tabla `salones`
--
CREATE TABLE `salones` (
  `salon_id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `latitud` decimal(10,8) DEFAULT NULL,
  `longitud` decimal(11,8) DEFAULT NULL,
  `capacidad` int(11) DEFAULT NULL,
  `importe` decimal(10,2) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `creado` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modificado` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`salon_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Estructura de tabla para la tabla `reservas`
--
CREATE TABLE `reservas` (
  `reserva_id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_reserva` date NOT NULL,
  `salon_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `turno_id` int(11) NOT NULL,
  `foto_cumpleaniero` varchar(255) DEFAULT NULL,
  `tematica` varchar(255) DEFAULT NULL,
  `importe_salon` decimal(10,2) DEFAULT NULL,
  `importe_total` decimal(10,2) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modificado` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`reserva_id`),
  KEY `reservas_fk2` (`salon_id`),
  KEY `reservas_fk3` (`usuario_id`),
  KEY `reservas_fk4` (`turno_id`),
  CONSTRAINT `reservas_fk2` FOREIGN KEY (`salon_id`) REFERENCES `salones` (`salon_id`),
  CONSTRAINT `reservas_fk3` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`),
  CONSTRAINT `reservas_fk4` FOREIGN KEY (`turno_id`) REFERENCES `turnos` (`turno_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Estructura de tabla para la tabla `reservas_servicios`
--
CREATE TABLE `reservas_servicios` (
  `reserva_servicio_id` int(11) NOT NULL AUTO_INCREMENT,
  `reserva_id` int(11) NOT NULL,
  `servicio_id` int(11) NOT NULL,
  `importe` decimal(10,2) NOT NULL,
  `creado` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modificado` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`reserva_servicio_id`),
  KEY `reservas_servicios_fk1` (`reserva_id`),
  KEY `reservas_servicios_fk2` (`servicio_id`),
  CONSTRAINT `reservas_servicios_fk1` FOREIGN KEY (`reserva_id`) REFERENCES `reservas` (`reserva_id`),
  CONSTRAINT `reservas_servicios_fk2` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`servicio_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
