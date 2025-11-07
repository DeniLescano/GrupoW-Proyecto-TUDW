USE `reservas`;

-- Procedimiento almacenado para estadísticas de reservas
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS `sp_estadisticas_reservas`(
    IN p_fecha_desde DATE,
    IN p_fecha_hasta DATE
)
BEGIN
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
END //

DELIMITER ;

-- Procedimiento almacenado para estadísticas de salones
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS `sp_estadisticas_salones`()
BEGIN
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
END //

DELIMITER ;

-- Procedimiento almacenado para estadísticas de usuarios
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS `sp_estadisticas_usuarios`()
BEGIN
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
END //

DELIMITER ;

-- Procedimiento almacenado para estadísticas de reservas por mes
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS `sp_reservas_por_mes`(
    IN p_anio INT
)
BEGIN
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
END //

DELIMITER ;

-- Procedimiento almacenado para reservas con servicios (para informes)
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS `sp_reservas_detalladas`(
    IN p_fecha_desde DATE,
    IN p_fecha_hasta DATE
)
BEGIN
    SELECT 
        r.reserva_id,
        r.fecha_reserva,
        r.tematica,
        r.importe_salon,
        r.importe_total,
        r.activo,
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
END //

DELIMITER ;

