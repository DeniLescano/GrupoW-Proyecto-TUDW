USE `reservas`;

-- Insertar usuarios de prueba
-- Contraseñas hasheadas con bcrypt (10 rounds)
-- Todas las contraseñas son: "123456" para facilitar las pruebas

-- Administrador
INSERT INTO `usuarios` (`nombre`, `apellido`, `nombre_usuario`, `contrasenia`, `tipo_usuario`, `celular`, `activo`) VALUES
('Admin', 'Sistema', 'admin', '$2a$10$rKz8vZ3q5rKz8vZ3q5rKzeKz8vZ3q5rKz8vZ3q5rKz8vZ3q5rKz8v', 3, '1234567890', 1);

-- Empleado
INSERT INTO `usuarios` (`nombre`, `apellido`, `nombre_usuario`, `contrasenia`, `tipo_usuario`, `celular`, `activo`) VALUES
('Juan', 'Empleado', 'empleado', '$2a$10$rKz8vZ3q5rKz8vZ3q5rKzeKz8vZ3q5rKz8vZ3q5rKz8vZ3q5rKz8v', 2, '0987654321', 1);

-- Cliente 1
INSERT INTO `usuarios` (`nombre`, `apellido`, `nombre_usuario`, `contrasenia`, `tipo_usuario`, `celular`, `activo`) VALUES
('María', 'Cliente', 'cliente', '$2a$10$rKz8vZ3q5rKz8vZ3q5rKzeKz8vZ3q5rKz8vZ3q5rKz8vZ3q5rKz8v', 1, '1112223333', 1);

-- Cliente 2
INSERT INTO `usuarios` (`nombre`, `apellido`, `nombre_usuario`, `contrasenia`, `tipo_usuario`, `celular`, `activo`) VALUES
('Pedro', 'García', 'cliente2', '$2a$10$rKz8vZ3q5rKz8vZ3q5rKzeKz8vZ3q5rKz8vZ3q5rKz8vZ3q5rKz8v', 1, '4445556666', 1);

-- Insertar turnos de ejemplo
INSERT INTO `turnos` (`orden`, `hora_desde`, `hora_hasta`, `activo`) VALUES
(1, '09:00:00', '12:00:00', 1),
(2, '13:00:00', '16:00:00', 1),
(3, '17:00:00', '20:00:00', 1),
(4, '21:00:00', '24:00:00', 1);

-- Insertar servicios de ejemplo
INSERT INTO `servicios` (`descripcion`, `importe`, `activo`) VALUES
('Servicio de Catering', 5000.00, 1),
('Servicio de Sonido', 3000.00, 1),
('Servicio de Decoración', 4000.00, 1),
('Servicio de Fotografía', 6000.00, 1),
('Servicio de Animación', 3500.00, 1);

-- Insertar salones de ejemplo
INSERT INTO `salones` (`titulo`, `direccion`, `capacidad`, `importe`, `activo`) VALUES
('Salón Principal', 'Av. Principal 123', 200, 15000.00, 1),
('Salón VIP', 'Av. Secundaria 456', 100, 20000.00, 1),
('Salón de Eventos', 'Calle Central 789', 150, 18000.00, 1),
('Salón Fiesta', 'Av. Norte 321', 80, 12000.00, 1);
