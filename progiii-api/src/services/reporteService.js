const estadisticasRepository = require('../repositories/estadisticasRepository');
const PDFDocument = require('pdfkit');

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

  /**
   * Generar PDF de reservas
   * @param {Array} reservas - Array de reservas detalladas
   * @returns {Promise<Buffer>} Buffer del PDF generado
   */
  async generarPDF(reservas) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          size: 'A4', 
          margin: 50,
          layout: 'landscape' // Modo horizontal para tablas
        });

        const chunks = [];
        
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Encabezado
        doc.fontSize(20)
           .fillColor('#1e3c72')
           .text('Reporte de Reservas', { align: 'center' })
           .moveDown();

        doc.fontSize(10)
           .fillColor('#666')
           .text(`Generado: ${new Date().toLocaleString('es-AR')}`, { align: 'center' })
           .moveDown(2);

        // Tabla de reservas
        const tableTop = doc.y;
        const rowHeight = 25;
        const fontSize = 8;
        const colWidths = [40, 60, 80, 70, 80, 60, 50, 60, 70, 50]; // Anchos de columnas

        // Encabezados de tabla
        doc.fontSize(fontSize)
           .fillColor('#ffffff')
           .font('Helvetica-Bold')
           .rect(50, tableTop, doc.page.width - 100, rowHeight)
           .fill('#1e3c72')
           .text('ID', 55, tableTop + 8, { width: colWidths[0] })
           .text('Fecha', 55 + colWidths[0], tableTop + 8, { width: colWidths[1] })
           .text('Cliente', 55 + colWidths[0] + colWidths[1], tableTop + 8, { width: colWidths[2] })
           .text('Salón', 55 + colWidths[0] + colWidths[1] + colWidths[2], tableTop + 8, { width: colWidths[3] })
           .text('Turno', 55 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableTop + 8, { width: colWidths[4] })
           .text('Temática', 55 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], tableTop + 8, { width: colWidths[5] })
           .text('Servicios', 55 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5], tableTop + 8, { width: colWidths[6] })
           .text('Importe', 55 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6], tableTop + 8, { width: colWidths[7] })
           .text('Estado', 55 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6] + colWidths[7], tableTop + 8, { width: colWidths[8] });

        let currentY = tableTop + rowHeight;
        let rowIndex = 0;

        reservas.forEach((reserva, index) => {
          // Verificar si necesitamos nueva página
          if (currentY + rowHeight > doc.page.height - 50) {
            doc.addPage();
            currentY = 50;
            
            // Repetir encabezados en nueva página
            doc.fontSize(fontSize)
               .fillColor('#ffffff')
               .font('Helvetica-Bold')
               .rect(50, currentY, doc.page.width - 100, rowHeight)
               .fill('#1e3c72')
               .text('ID', 55, currentY + 8, { width: colWidths[0] })
               .text('Fecha', 55 + colWidths[0], currentY + 8, { width: colWidths[1] })
               .text('Cliente', 55 + colWidths[0] + colWidths[1], currentY + 8, { width: colWidths[2] })
               .text('Salón', 55 + colWidths[0] + colWidths[1] + colWidths[2], currentY + 8, { width: colWidths[3] })
               .text('Turno', 55 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], currentY + 8, { width: colWidths[4] })
               .text('Temática', 55 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], currentY + 8, { width: colWidths[5] })
               .text('Servicios', 55 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5], currentY + 8, { width: colWidths[6] })
               .text('Importe', 55 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6], currentY + 8, { width: colWidths[7] })
               .text('Estado', 55 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6] + colWidths[7], currentY + 8, { width: colWidths[8] });
            currentY += rowHeight;
          }

          // Fila de datos
          const isEven = rowIndex % 2 === 0;
          doc.fillColor(isEven ? '#ffffff' : '#f8f9fa')
             .rect(50, currentY, doc.page.width - 100, rowHeight)
             .fill();

          doc.fontSize(fontSize)
             .fillColor('#000000')
             .font('Helvetica')
             .text(String(reserva.reserva_id || ''), 55, currentY + 8, { width: colWidths[0] })
             .text(reserva.fecha_reserva ? new Date(reserva.fecha_reserva).toLocaleDateString('es-AR') : '', 55 + colWidths[0], currentY + 8, { width: colWidths[1] })
             .text(`${(reserva.cliente_nombre || '').trim()} ${(reserva.cliente_apellido || '').trim()}`.trim(), 55 + colWidths[0] + colWidths[1], currentY + 8, { width: colWidths[2] })
             .text(reserva.salon_titulo || '', 55 + colWidths[0] + colWidths[1] + colWidths[2], currentY + 8, { width: colWidths[3] })
             .text(reserva.hora_desde ? `${reserva.hora_desde.substring(0, 5)} - ${reserva.hora_hasta.substring(0, 5)}` : '', 55 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], currentY + 8, { width: colWidths[4] })
             .text(reserva.tematica || '-', 55 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], currentY + 8, { width: colWidths[5] })
             .text(reserva.servicios ? (Array.isArray(reserva.servicios) ? reserva.servicios.map(s => s.descripcion || s).join(', ') : reserva.servicios) : '-', 55 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5], currentY + 8, { width: colWidths[6] })
             .text(`$${parseFloat(reserva.importe_total || 0).toFixed(2)}`, 55 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6], currentY + 8, { width: colWidths[7] })
             .text(reserva.activo === 1 ? 'Activa' : 'Cancelada', 55 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6] + colWidths[7], currentY + 8, { width: colWidths[8] });

          currentY += rowHeight;
          rowIndex++;
        });

        // Pie de página
        doc.fontSize(10)
           .fillColor('#666')
           .text(`Total de reservas: ${reservas.length}`, 50, doc.page.height - 50, { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new ReporteService();

