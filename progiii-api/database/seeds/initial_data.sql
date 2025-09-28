INSERT INTO `usuarios` (`usuario_id`, `nombre`, `apellido`, `nombre_usuario`, `contrasenia`, `tipo_usuario`, `celular`, `foto`, `activo`, `creado`, `modificado`) VALUES
(1, 'Alberto', 'López', 'alblop@correo.com', 'cf584badd07d42dcb8506f8bae32aa96', 3, NULL, NULL, 1, '2025-08-19 21:37:51', '2025-08-19 21:37:51'),
(2, 'Pamela', 'Gómez', 'pamgom@correo.com', '709ee61c97fc261d35aa2295e109b3fb', 3, NULL, NULL, 1, '2025-08-19 21:39:45', '2025-08-19 21:39:45'),
(3, 'Esteban', 'Ciro', 'estcir@correo.com', 'da6541938e9afdcd420d1ccfc7cac2c7', 3, NULL, NULL, 1, '2025-08-19 21:41:50', '2025-08-19 21:41:50'),
(4, 'Oscar', 'Ramirez', 'oscram@correo.com', '0ac879e8785ea5b3da6ff1333d8b0cf2', 1, NULL, NULL, 1, '2025-08-19 21:41:50', '2025-08-19 21:41:50'),
(5, 'Claudia', 'Juárez', 'clajua@correo.com', '4f9dbdcf9259db3fa6a3f6164dd285de', 1, NULL, NULL, 1, '2025-08-19 21:41:50', '2025-08-19 21:41:50'),
(6, 'William', 'Corbalán', 'wilcor@correo.com', 'f68087e72fbdf81b4174fec3676c1790', 2, NULL, NULL, 1, '2025-08-19 21:41:50', '2025-08-19 21:41:50'),
(7, 'Anahí', 'Flores', 'anaflo@correo.com', 'd4e767c916b51b8cc5c909f5435119b1', 2, NULL, NULL, 1, '2025-08-19 21:41:50', '2025-08-19 21:41:50');

INSERT INTO `turnos` (`turno_id`, `orden`, `hora_desde`, `hora_hasta`, `activo`, `creado`, `modificado`) VALUES
(1, 1, '12:00:00', '14:00:00', 1, '2025-08-19 21:44:19', '2025-08-19 21:44:19'),
(2, 2, '15:00:00', '17:00:00', 1, '2025-08-19 21:46:08', '2025-08-19 21:46:08'),
(3, 3, '18:00:00', '20:00:00', 1, '2025-08-19 21:46:08', '2025-08-19 21:46:08');

INSERT INTO `servicios` (`servicio_id`, `descripcion`, `importe`, `activo`, `creado`, `modificado`) VALUES
(1, 'Sonido', 15000.00, 1, '2025-08-19 21:47:55', '2025-08-19 21:47:55'),
(2, 'Mesa dulce', 25000.00, 1, '2025-08-19 21:47:55', '2025-08-19 21:47:55'),
(3, 'Tarjetas de invitación', 5000.00, 1, '2025-08-19 21:47:55', '2025-08-19 21:47:55'),
(4, 'Mozos', 15000.00, 1, '2025-08-19 21:47:55', '2025-08-19 21:47:55'),
(5, 'Sala de video juegos', 15000.00, 1, '2025-08-19 21:47:55', '2025-08-19 21:47:55'),
(6, 'Mago', 25000.00, 1, '2025-08-20 21:31:00', '2025-08-20 21:31:00'),
(7, 'Cabezones', 80000.00, 1, '2025-08-20 21:31:00', '2025-08-20 21:31:00'),
(8, 'Maquillaje infantil', 1000.00, 1, '2025-08-20 21:31:00', '2025-08-20 21:31:00');

INSERT INTO `salones` (`salon_id`, `titulo`, `direccion`, `latitud`, `longitud`, `capacidad`, `importe`, `activo`, `creado`, `modificado`) VALUES
(1, 'Principal', 'San Lorenzo 1000', NULL, NULL, 200, 95000.00, 1, '2025-08-19 21:51:22', '2025-08-19 21:51:22'),
(2, 'Secundario', 'San Lorenzo 1000', NULL, NULL, 70, 7000.00, 1, '2025-08-19 21:51:22', '2025-08-19 21:51:22'),
(3, 'Cancha Fútbol 5', 'Alberdi 300', NULL, NULL, 50, 150000.00, 1, '2025-08-19 21:51:22', '2025-08-19 21:51:22'),
(4, 'Maquina de Jugar', 'Peru 50', NULL, NULL, 100, 95000.00, 1, '2025-08-19 21:51:22', '2025-08-19 21:51:22'),
(5, 'Trampolín Play', 'Belgrano 100', NULL, NULL, 70, 200000.00, 1, '2025-08-19 21:51:22', '2025-08-19 21:51:22');

INSERT INTO `reservas` (`reserva_id`, `fecha_reserva`, `salon_id`, `usuario_id`, `turno_id`, `foto_cumpleaniero`, `tematica`, `importe_salon`, `importe_total`, `activo`, `creado`, `modificado`) VALUES
(1, '2025-10-08', 1, 1, 1, NULL, 'Plim plim', NULL, 200000.00, 1, '2025-08-19 22:02:33', '2025-08-19 22:02:33'),
(2, '2025-10-08', 2, 1, 1, NULL, 'Messi', NULL, 100000.00, 1, '2025-08-19 22:03:45', '2025-08-19 22:03:45'),
(3, '2025-10-08', 2, 2, 1, NULL, 'Palermo', NULL, 500000.00, 1, '2025-08-19 22:03:45', '2025-08-19 22:03:45');

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
(10, 3, 4, 200000.00, '2025-08-19 22:09:17', '2025-08-19 22:09:17');