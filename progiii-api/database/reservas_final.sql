-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 01-11-2025 a las 19:18:01
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `reservas`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_estadisticas_reservas` (IN `p_fecha_desde` DATE, IN `p_fecha_hasta` DATE)   BEGIN
        SELECT 
          COUNT(*) as total_reservas,
          SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as reservas_activas,
          SUM(CASE WHEN activo = 0 THEN 1 ELSE 0 END) as reservas_canceladas,
          SUM(importe_total) as importe_total,
          AVG(importe_total) as importe_promedio,
          MAX(importe_total) as importe_maximo,
          MIN(importe_total) as importe_minimo,
          COUNT(DISTINCT usuario_id) as total_clientes,
          COUNT(DISTINCT salon_id) as total_salones_utilizados,
          COUNT(DISTINCT turno_id) as total_turnos_utilizados
        FROM reservas
        WHERE fecha_reserva BETWEEN IFNULL(p_fecha_desde, '1900-01-01') AND IFNULL(p_fecha_hasta, '9999-12-31');
      END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_estadisticas_salones` ()   BEGIN
        SELECT 
          COUNT(*) as total_salones,
          SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as salones_activos,
          SUM(CASE WHEN activo = 0 THEN 1 ELSE 0 END) as salones_inactivos,
          SUM(capacidad) as capacidad_total,
          AVG(capacidad) as capacidad_promedio,
          MAX(capacidad) as capacidad_maxima,
          MIN(capacidad) as capacidad_minima,
          SUM(importe) as importe_total,
          AVG(importe) as importe_promedio,
          MAX(importe) as importe_maximo,
          MIN(importe) as importe_minimo
        FROM salones;
      END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_estadisticas_usuarios` ()   BEGIN
        SELECT 
          COUNT(*) as total_usuarios,
          SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as usuarios_activos,
          SUM(CASE WHEN activo = 0 THEN 1 ELSE 0 END) as usuarios_inactivos,
          SUM(CASE WHEN tipo_usuario = 1 THEN 1 ELSE 0 END) as total_clientes,
          SUM(CASE WHEN tipo_usuario = 2 THEN 1 ELSE 0 END) as total_empleados,
          SUM(CASE WHEN tipo_usuario = 3 THEN 1 ELSE 0 END) as total_administradores,
          SUM(CASE WHEN celular IS NOT NULL AND celular != '' THEN 1 ELSE 0 END) as usuarios_con_celular,
          SUM(CASE WHEN foto IS NOT NULL AND foto != '' THEN 1 ELSE 0 END) as usuarios_con_foto
        FROM usuarios;
      END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_reservas_detalladas` (IN `p_fecha_desde` DATE, IN `p_fecha_hasta` DATE)   BEGIN
        SELECT 
          r.reserva_id,
          r.fecha_reserva,
          r.tematica,
          r.importe_salon,
          r.importe_total,
          r.activo,
          r.estado,
          r.creado,
          s.titulo as salon_titulo,
          s.direccion as salon_direccion,
          u.nombre as cliente_nombre,
          u.apellido as cliente_apellido,
          u.nombre_usuario,
          u.celular as cliente_celular,
          t.hora_desde,
          t.hora_hasta,
          t.orden,
          GROUP_CONCAT(
            CONCAT(sev.descripcion, ' ($', rs.importe, ')')
            SEPARATOR ', '
          ) as servicios
        FROM reservas r
        INNER JOIN salones s ON r.salon_id = s.salon_id
        INNER JOIN usuarios u ON r.usuario_id = u.usuario_id
        INNER JOIN turnos t ON r.turno_id = t.turno_id
        LEFT JOIN reservas_servicios rs ON r.reserva_id = rs.reserva_id
        LEFT JOIN servicios sev ON rs.servicio_id = sev.servicio_id
        WHERE r.fecha_reserva BETWEEN IFNULL(p_fecha_desde, '1900-01-01') AND IFNULL(p_fecha_hasta, '9999-12-31')
        AND r.activo = 1
        GROUP BY r.reserva_id
        ORDER BY r.fecha_reserva DESC, t.orden ASC;
      END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_reservas_por_mes` (IN `p_anio` INT)   BEGIN
        SELECT 
          MONTH(fecha_reserva) as mes,
          COUNT(*) as total_reservas,
          SUM(importe_total) as importe_total,
          AVG(importe_total) as importe_promedio
        FROM reservas
        WHERE YEAR(fecha_reserva) = IFNULL(p_anio, YEAR(CURDATE()))
        AND activo = 1
        GROUP BY MONTH(fecha_reserva)
        ORDER BY mes ASC;
      END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `mensaje` text NOT NULL,
  `leida` tinyint(1) DEFAULT 0,
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `notificaciones`
--

INSERT INTO `notificaciones` (`id`, `usuario_id`, `tipo`, `titulo`, `mensaje`, `leida`, `fecha_creacion`) VALUES
(1, 4, 'reserva_creada', 'Reserva Creada', 'Su reserva en Secundario para el Thu Nov 13 2025 00:00:00 GMT-0300 (hora estándar de Argentina) de 12:00:00 a 14:00:00 ha sido creada. Estado: pendiente.', 0, '2025-11-01 18:56:53'),
(2, 2, 'nueva_reserva', 'Nueva Reserva', 'Se ha creado una nueva reserva en Secundario para el Thu Nov 13 2025 00:00:00 GMT-0300 (hora estándar de Argentina) por Oscar Ramirez.', 0, '2025-11-01 18:56:53'),
(3, 3, 'nueva_reserva', 'Nueva Reserva', 'Se ha creado una nueva reserva en Secundario para el Thu Nov 13 2025 00:00:00 GMT-0300 (hora estándar de Argentina) por Oscar Ramirez.', 0, '2025-11-01 18:56:53'),
(4, 6, 'nueva_reserva', 'Nueva Reserva', 'Se ha creado una nueva reserva en Secundario para el Thu Nov 13 2025 00:00:00 GMT-0300 (hora estándar de Argentina) por Oscar Ramirez.', 0, '2025-11-01 18:56:53'),
(5, 7, 'nueva_reserva', 'Nueva Reserva', 'Se ha creado una nueva reserva en Secundario para el Thu Nov 13 2025 00:00:00 GMT-0300 (hora estándar de Argentina) por Oscar Ramirez.', 0, '2025-11-01 18:56:53'),
(6, 4, 'reserva_actualizada', 'Reserva Actualizada', 'Su reserva en Secundario ha sido actualizada. fecha actualizada, salón actualizado, turno actualizado', 0, '2025-11-01 18:57:05'),
(7, 4, 'reserva_cancelada', 'Reserva Cancelada', 'Su reserva en Secundario para el Thu Nov 13 2025 00:00:00 GMT-0300 (hora estándar de Argentina) ha sido cancelada.', 0, '2025-11-01 18:57:14');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservas`
--

CREATE TABLE `reservas` (
  `reserva_id` int(11) NOT NULL,
  `fecha_reserva` date NOT NULL,
  `salon_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `turno_id` int(11) NOT NULL,
  `foto_cumpleaniero` varchar(255) DEFAULT NULL,
  `tematica` varchar(255) DEFAULT NULL,
  `importe_salon` decimal(10,2) DEFAULT NULL,
  `importe_total` decimal(10,2) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado` datetime NOT NULL DEFAULT current_timestamp(),
  `modificado` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `estado` varchar(20) DEFAULT 'pendiente'
) ;

--
-- Volcado de datos para la tabla `reservas`
--

INSERT INTO `reservas` (`reserva_id`, `fecha_reserva`, `salon_id`, `usuario_id`, `turno_id`, `foto_cumpleaniero`, `tematica`, `importe_salon`, `importe_total`, `activo`, `creado`, `modificado`, `estado`) VALUES
(1, '2025-10-08', 1, 1, 1, NULL, 'Plim plim', NULL, 200000.00, 1, '2025-08-19 22:02:33', '2025-08-19 22:02:33', 'pendiente'),
(2, '2025-10-08', 2, 1, 1, NULL, 'Messi', NULL, 100000.00, 1, '2025-08-19 22:03:45', '2025-08-19 22:03:45', 'pendiente'),
(3, '2025-10-08', 2, 2, 1, NULL, 'Palermo', NULL, 500000.00, 1, '2025-08-19 22:03:45', '2025-08-19 22:03:45', 'pendiente'),
(4, '2025-11-13', 2, 4, 1, NULL, NULL, 7000.00, 7000.00, 0, '2025-11-01 18:56:53', '2025-11-01 18:57:14', 'pendiente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservas_servicios`
--

CREATE TABLE `reservas_servicios` (
  `reserva_servicio_id` int(11) NOT NULL,
  `reserva_id` int(11) NOT NULL,
  `servicio_id` int(11) NOT NULL,
  `importe` decimal(10,2) NOT NULL,
  `creado` datetime NOT NULL DEFAULT current_timestamp(),
  `modificado` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `reservas_servicios`
--

INSERT INTO `reservas_servicios` (`reserva_servicio_id`, `reserva_id`, `servicio_id`, `importe`, `creado`, `modificado`) VALUES
(1, 1, 1, 50000.00, '2025-08-19 22:07:31', '2025-08-19 22:07:31'),
(2, 1, 2, 50000.00, '2025-08-19 22:07:31', '2025-08-19 22:07:31'),
(3, 1, 3, 50000.00, '2025-08-19 22:07:31', '2025-08-19 22:07:31'),
(4, 1, 4, 50000.00, '2025-08-19 22:07:31', '2025-08-19 22:07:31'),
(5, 2, 1, 50000.00, '2025-08-19 22:08:08', '2025-08-19 22:08:08'),
(6, 2, 2, 50000.00, '2025-08-19 22:08:08', '2025-08-19 22:08:08'),
(7, 3, 1, 100000.00, '2025-08-19 22:09:17', '2025-08-19 22:09:17'),
(8, 3, 2, 100000.00, '2025-08-19 22:09:17', '2025-08-19 22:09:17'),
(9, 3, 3, 100000.00, '2025-08-19 22:09:17', '2025-08-19 22:09:17'),
(10, 3, 4, 200000.00, '2025-08-19 22:09:17', '2025-08-19 22:09:17'),
(13, 4, 1, 150400.00, '2025-11-01 18:57:05', '2025-11-01 18:57:05'),
(14, 4, 2, 25000.00, '2025-11-01 18:57:05', '2025-11-01 18:57:05'),
(15, 4, 3, 5000.00, '2025-11-01 18:57:05', '2025-11-01 18:57:05');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `salones`
--

CREATE TABLE `salones` (
  `salon_id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `latitud` decimal(10,8) DEFAULT NULL,
  `longitud` decimal(11,8) DEFAULT NULL,
  `capacidad` int(11) DEFAULT NULL,
  `importe` decimal(10,2) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `creado` datetime NOT NULL DEFAULT current_timestamp(),
  `modificado` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `salones`
--

INSERT INTO `salones` (`salon_id`, `titulo`, `direccion`, `latitud`, `longitud`, `capacidad`, `importe`, `activo`, `creado`, `modificado`) VALUES
(1, 'Principal', 'San Lorenzo 1000', NULL, NULL, 250, 95000.00, 1, '2025-08-19 21:51:22', '2025-11-01 18:39:50'),
(2, 'Secundario', 'San Lorenzo 1000', NULL, NULL, 70, 7000.00, 1, '2025-08-19 21:51:22', '2025-08-19 21:51:22'),
(3, 'Cancha Fútbol 5', 'Alberdi 300', NULL, NULL, 50, 150000.00, 1, '2025-08-19 21:51:22', '2025-08-19 21:51:22'),
(4, 'Maquina de Jugar', 'Peru 50', NULL, NULL, 100, 95000.00, 1, '2025-08-19 21:51:22', '2025-08-19 21:51:22'),
(5, 'Trampolín Play', 'Belgrano 100', NULL, NULL, 70, 200000.00, 1, '2025-08-19 21:51:22', '2025-08-19 21:51:22'),
(6, 'Villa Tranquila', 'los jacarandaes', NULL, NULL, 300, 500000.00, 1, '2025-11-01 18:51:40', '2025-11-01 18:52:15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicios`
--

CREATE TABLE `servicios` (
  `servicio_id` int(11) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `importe` decimal(10,2) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado` datetime NOT NULL DEFAULT current_timestamp(),
  `modificado` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `servicios`
--

INSERT INTO `servicios` (`servicio_id`, `descripcion`, `importe`, `activo`, `creado`, `modificado`) VALUES
(1, 'Sonido', 150400.00, 1, '2025-08-19 21:47:55', '2025-11-01 18:40:57'),
(2, 'Mesa dulce', 25000.00, 1, '2025-08-19 21:47:55', '2025-08-19 21:47:55'),
(3, 'Tarjetas de invitación', 5000.00, 1, '2025-08-19 21:47:55', '2025-08-19 21:47:55'),
(4, 'Mozos', 15000.00, 1, '2025-08-19 21:47:55', '2025-08-19 21:47:55'),
(5, 'Sala de video juegos', 15000.00, 1, '2025-08-19 21:47:55', '2025-08-19 21:47:55'),
(6, 'Mago', 25000.00, 1, '2025-08-20 21:31:00', '2025-08-20 21:31:00'),
(7, 'Cabezones', 80000.00, 1, '2025-08-20 21:31:00', '2025-08-20 21:31:00'),
(8, 'Maquillaje infantil', 1000.00, 1, '2025-08-20 21:31:00', '2025-08-20 21:31:00'),
(9, 'dj', 23000.00, 1, '2025-11-01 18:54:32', '2025-11-01 18:54:32');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `turnos`
--

CREATE TABLE `turnos` (
  `turno_id` int(11) NOT NULL,
  `orden` int(11) NOT NULL,
  `hora_desde` time NOT NULL,
  `hora_hasta` time NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado` datetime NOT NULL DEFAULT current_timestamp(),
  `modificado` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `turnos`
--

INSERT INTO `turnos` (`turno_id`, `orden`, `hora_desde`, `hora_hasta`, `activo`, `creado`, `modificado`) VALUES
(1, 1, '12:00:00', '14:00:00', 1, '2025-08-19 21:44:19', '2025-08-19 21:44:19'),
(2, 2, '14:00:00', '17:00:00', 1, '2025-08-19 21:46:08', '2025-11-01 16:58:38'),
(3, 7, '18:00:00', '20:00:00', 0, '2025-08-19 21:46:08', '2025-11-01 19:04:52'),
(4, 4, '20:05:00', '23:08:00', 1, '2025-11-01 19:04:35', '2025-11-01 19:04:35');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `usuario_id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `nombre_usuario` varchar(50) NOT NULL,
  `contrasenia` varchar(255) NOT NULL,
  `tipo_usuario` tinyint(4) NOT NULL,
  `celular` varchar(20) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado` datetime NOT NULL DEFAULT current_timestamp(),
  `modificado` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`usuario_id`, `nombre`, `apellido`, `nombre_usuario`, `contrasenia`, `tipo_usuario`, `celular`, `foto`, `activo`, `creado`, `modificado`) VALUES
(1, 'Alberto', 'López', 'alblop@correo.com', '$2b$10$LMVepzNflweafRVCefqIUu3QuHXSL9AkHRGP7kOfWDLuuAtMzaJ5K', 3, NULL, NULL, 0, '2025-08-19 21:37:51', '2025-11-01 13:57:34'),
(2, 'Pamela', 'Gómez', 'pamgom@correo.com', '$2b$10$LMVepzNflweafRVCefqIUu3QuHXSL9AkHRGP7kOfWDLuuAtMzaJ5K', 3, NULL, NULL, 1, '2025-08-19 21:39:45', '2025-10-31 22:07:38'),
(3, 'Esteban', 'Ciro', 'estcir@correo.com', '$2b$10$LMVepzNflweafRVCefqIUu3QuHXSL9AkHRGP7kOfWDLuuAtMzaJ5K', 3, NULL, NULL, 1, '2025-08-19 21:41:50', '2025-10-31 22:07:38'),
(4, 'Oscar', 'Ramirez', 'oscram@correo.com', '$2b$10$LMVepzNflweafRVCefqIUu3QuHXSL9AkHRGP7kOfWDLuuAtMzaJ5K', 1, NULL, NULL, 1, '2025-08-19 21:41:50', '2025-10-31 22:07:38'),
(5, 'Claudia', 'Juárez', 'clajua@correo.com', '$2b$10$LMVepzNflweafRVCefqIUu3QuHXSL9AkHRGP7kOfWDLuuAtMzaJ5K', 1, NULL, NULL, 0, '2025-08-19 21:41:50', '2025-10-31 22:07:38'),
(6, 'William', 'Corbalán', 'wilcor@correo.com', '$2b$10$LMVepzNflweafRVCefqIUu3QuHXSL9AkHRGP7kOfWDLuuAtMzaJ5K', 2, NULL, NULL, 1, '2025-08-19 21:41:50', '2025-10-31 22:07:38'),
(7, 'Anahí', 'Flores', 'anaflo@correo.com', '$2b$10$LMVepzNflweafRVCefqIUu3QuHXSL9AkHRGP7kOfWDLuuAtMzaJ5K', 2, NULL, NULL, 1, '2025-08-19 21:41:50', '2025-10-31 22:07:38'),
(8, 'javier', 'acosta', 'profesorjaviertecnologia@gmail.com', '$2b$10$m5bReYMXtPPZ8SFLBr8dMuEbJyV9Ee7S3uZQHKRIK0jlt0OdRSm5y', 1, NULL, NULL, 1, '2025-11-01 15:01:50', '2025-11-01 15:01:50');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario` (`usuario_id`),
  ADD KEY `idx_leida` (`leida`),
  ADD KEY `idx_fecha_creacion` (`fecha_creacion`),
  ADD KEY `idx_tipo` (`tipo`);

--
-- Indices de la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD PRIMARY KEY (`reserva_id`),
  ADD KEY `reservas_fk2` (`salon_id`),
  ADD KEY `reservas_fk3` (`usuario_id`),
  ADD KEY `reservas_fk4` (`turno_id`);

--
-- Indices de la tabla `reservas_servicios`
--
ALTER TABLE `reservas_servicios`
  ADD PRIMARY KEY (`reserva_servicio_id`),
  ADD KEY `reservas_servicios_fk1` (`reserva_id`),
  ADD KEY `reservas_servicios_fk2` (`servicio_id`);

--
-- Indices de la tabla `salones`
--
ALTER TABLE `salones`
  ADD PRIMARY KEY (`salon_id`);

--
-- Indices de la tabla `servicios`
--
ALTER TABLE `servicios`
  ADD PRIMARY KEY (`servicio_id`);

--
-- Indices de la tabla `turnos`
--
ALTER TABLE `turnos`
  ADD PRIMARY KEY (`turno_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`usuario_id`),
  ADD UNIQUE KEY `nombre_usuario` (`nombre_usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `reservas`
--
ALTER TABLE `reservas`
  MODIFY `reserva_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `reservas_servicios`
--
ALTER TABLE `reservas_servicios`
  MODIFY `reserva_servicio_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `salones`
--
ALTER TABLE `salones`
  MODIFY `salon_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `servicios`
--
ALTER TABLE `servicios`
  MODIFY `servicio_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `turnos`
--
ALTER TABLE `turnos`
  MODIFY `turno_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `usuario_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD CONSTRAINT `reservas_fk2` FOREIGN KEY (`salon_id`) REFERENCES `salones` (`salon_id`),
  ADD CONSTRAINT `reservas_fk3` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`),
  ADD CONSTRAINT `reservas_fk4` FOREIGN KEY (`turno_id`) REFERENCES `turnos` (`turno_id`);

--
-- Filtros para la tabla `reservas_servicios`
--
ALTER TABLE `reservas_servicios`
  ADD CONSTRAINT `reservas_servicios_fk1` FOREIGN KEY (`reserva_id`) REFERENCES `reservas` (`reserva_id`),
  ADD CONSTRAINT `reservas_servicios_fk2` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`servicio_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
