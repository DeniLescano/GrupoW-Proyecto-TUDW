USE `reservas`;

-- Actualizar contraseñas de usuarios existentes a bcrypt
-- Contraseña para todos: "123456"
-- Hash generado con bcrypt: $2b$10$z4Db8oyGfm6aI4HWvJwCj.zBndQ8FdSC1jpzlEpkBtHfy68Pa4bbm

-- Actualizar contraseñas de administradores
UPDATE `usuarios` SET `contrasenia` = '$2b$10$z4Db8oyGfm6aI4HWvJwCj.zBndQ8FdSC1jpzlEpkBtHfy68Pa4bbm' WHERE `tipo_usuario` = 3;

-- Actualizar contraseñas de empleados
UPDATE `usuarios` SET `contrasenia` = '$2b$10$z4Db8oyGfm6aI4HWvJwCj.zBndQ8FdSC1jpzlEpkBtHfy68Pa4bbm' WHERE `tipo_usuario` = 2;

-- Actualizar contraseñas de clientes
UPDATE `usuarios` SET `contrasenia` = '$2b$10$z4Db8oyGfm6aI4HWvJwCj.zBndQ8FdSC1jpzlEpkBtHfy68Pa4bbm' WHERE `tipo_usuario` = 1;

