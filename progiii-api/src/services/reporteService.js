const estadisticasRepository = require('../repositories/estadisticasRepository');

/**
 * Servicio para lógica de negocio de Reportes
 * Contiene toda la lógica de negocio para generar reportes, usa repositories para acceso a datos
 */
class ReporteService {
  /**
   * Obtener reservas detalladas para reportes
   * @param {string|null} fechaDesde - Fecha desde (YYYY-MM-DD)
   * @param {string|null} fechaHasta - Fecha hasta (YYYY-MM-DD)
   * @returns {Promise<Array>} Array de reservas detalladas con datos relacionados
   */
  async getReservasDetalladas(fechaDesde = null, fechaHasta = null) {
    // Validar formato de fechas si se proporcionan
    if (fechaDesde) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(fechaDesde)) {
        throw new Error('La fecha desde debe estar en formato YYYY-MM-DD');
      }
    }
    
    if (fechaHasta) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(fechaHasta)) {
        throw new Error('La fecha hasta debe estar en formato YYYY-MM-DD');
      }
    }
    
    // Validar que fechaDesde <= fechaHasta
    if (fechaDesde && fechaHasta) {
      const desde = new Date(fechaDesde);
      const hasta = new Date(fechaHasta);
      
      if (desde > hasta) {
        throw new Error('La fecha desde debe ser anterior o igual a la fecha hasta');
      }
    }
    
    // Obtener reservas detalladas con datos relacionados (JOINs en stored procedure)
    // El stored procedure hace JOINs con: servicios, salones, turnos, usuarios/clientes
    return await estadisticasRepository.getReservasDetalladas(fechaDesde, fechaHasta);
  }

  /**
   * Generar CSV de reservas
   * @param {Array} reservas - Array de reservas detalladas
   * @returns {string} Cadena CSV formateada
   */
  generarCSV(reservas) {
    // Encabezado CSV con BOM UTF-8 para Excel
    let csv = '\uFEFFID Reserva,Fecha,Cliente,Usuario,Salón,Dirección,Turno,Temática,Importe Salón,Servicios,Importe Total,Estado,Creado\n';
    
    reservas.forEach(reserva => {
      const fecha = reserva.fecha_reserva ? new Date(reserva.fecha_reserva).toLocaleDateString('es-AR') : '';
      const creado = reserva.creado ? new Date(reserva.creado).toLocaleDateString('es-AR') : '';
      const cliente = `"${(reserva.cliente_nombre || '').trim()} ${(reserva.cliente_apellido || '').trim()}"`.trim();
      const turno = reserva.hora_desde ? `${reserva.hora_desde.substring(0, 5)} - ${reserva.hora_hasta.substring(0, 5)}` : '';
      
      // Escapar comillas dobles en valores
      const escapeCSV = (value) => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        return stringValue.replace(/"/g, '""');
      };
      
      const servicios = escapeCSV(reserva.servicios || 'Sin servicios');
      const salonTitulo = escapeCSV(reserva.salon_titulo || '');
      const salonDireccion = escapeCSV(reserva.salon_direccion || '');
      const tematica = escapeCSV(reserva.tematica || '');
      const nombreUsuario = escapeCSV(reserva.nombre_usuario || '');
      
      csv += `${reserva.reserva_id},"${fecha}",${cliente},"${nombreUsuario}","${salonTitulo}","${salonDireccion}","${turno}","${tematica}","${reserva.importe_salon || 0}","${servicios}","${reserva.importe_total || 0}","${reserva.activo === 1 ? 'Activa' : 'Cancelada'}","${creado}"\n`;
    });
    
    return csv;
  }
}

module.exports = new ReporteService();

