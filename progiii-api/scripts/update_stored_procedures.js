// Script para actualizar stored procedure sp_reservas_detalladas con campo estado
require('dotenv').config();
const db = require('../src/config/database');

async function updateStoredProcedure() {
  try {
    console.log('🔄 Actualizando stored procedure sp_reservas_detalladas...');

    // Eliminar y recrear el procedure con campo estado
    await db.query(`DROP PROCEDURE IF EXISTS sp_reservas_detalladas`);

    await db.query(`
      CREATE PROCEDURE sp_reservas_detalladas(
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
      END
    `);

    console.log('✅ Stored procedure actualizado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al actualizar stored procedure:', error.message);
    process.exit(1);
  }
}

updateStoredProcedure();

