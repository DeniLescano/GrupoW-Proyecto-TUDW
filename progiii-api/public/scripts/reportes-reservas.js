document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/reportes/reservas';
    const reservasBody = document.getElementById('reservas-body');
    const buscarBtn = document.getElementById('buscar-btn');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const noResults = document.getElementById('no-results');
    
    let reservasData = [];

    function formatCurrency(amount) {
        if (!amount) return '$0.00';
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(amount);
    }

    function formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR');
    }

    async function fetchReservas() {
        const fechaDesde = document.getElementById('fecha-desde').value;
        const fechaHasta = document.getElementById('fecha-hasta').value;
        
        let url = API_URL;
        const params = [];
        if (fechaDesde) params.push(`fecha_desde=${fechaDesde}`);
        if (fechaHasta) params.push(`fecha_hasta=${fechaHasta}`);
        if (params.length > 0) url += '?' + params.join('&');

        try {
            const response = await window.auth.fetchWithAuth(url);
            if (!response.ok) {
                throw new Error('Error al cargar las reservas');
            }
            const data = await response.json();
            // Manejar respuesta estandarizada { success: true, data: [...] }
            reservasData = (data.success && data.data) ? data.data : data;
            renderReservas(reservasData);
        } catch (error) {
            console.error('Error:', error);
            reservasBody.innerHTML = `<tr><td colspan="8" style="color: red; text-align: center;">Error: ${error.message}</td></tr>`;
        }
    }

    function renderReservas(reservas) {
        reservasBody.innerHTML = '';
        
        if (reservas.length === 0) {
            noResults.style.display = 'block';
            return;
        }
        
        noResults.style.display = 'none';

        reservas.forEach(reserva => {
            const row = reservasBody.insertRow();
            
            if (reserva.activo === 0 || reserva.activo === false) {
                row.classList.add('user-inactive-row');
            }

            row.insertCell().textContent = reserva.reserva_id;
            row.insertCell().textContent = formatDate(reserva.fecha_reserva);
            row.insertCell().textContent = `${reserva.cliente_nombre || ''} ${reserva.cliente_apellido || ''}`.trim() || reserva.nombre_usuario || '-';
            row.insertCell().textContent = reserva.salon_titulo || '-';
            
            const turnoCell = row.insertCell();
            const turno = reserva.hora_desde ? `${reserva.hora_desde.substring(0, 5)} - ${reserva.hora_hasta.substring(0, 5)}` : '-';
            turnoCell.textContent = turno;
            
            row.insertCell().textContent = reserva.servicios || 'Sin servicios';
            row.insertCell().textContent = formatCurrency(reserva.importe_total);
            row.insertCell().textContent = (reserva.activo === 1 || reserva.activo === true) ? 'Activa' : 'Cancelada';
        });
    }

    buscarBtn.addEventListener('click', fetchReservas);

    exportCsvBtn.addEventListener('click', async () => {
        const fechaDesde = document.getElementById('fecha-desde').value;
        const fechaHasta = document.getElementById('fecha-hasta').value;
        
        let url = '/reportes/reservas/csv';
        const params = [];
        if (fechaDesde) params.push(`fecha_desde=${fechaDesde}`);
        if (fechaHasta) params.push(`fecha_hasta=${fechaHasta}`);
        if (params.length > 0) url += '?' + params.join('&');

        try {
            const response = await window.auth.fetchWithAuth(url);
            if (!response.ok) throw new Error('Error al generar CSV');
            
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `reporte_reservas_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            alert(`Error al exportar CSV: ${error.message}`);
        }
    });

    exportPdfBtn.addEventListener('click', async () => {
        if (reservasData.length === 0) {
            alert('No hay reservas para exportar. Realiza una búsqueda primero.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4'); // 'p' = portrait (vertical)
        
        let yPos = 20;
        const margin = 15;

        // Título
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('Reporte de Reservas', margin, yPos);
        yPos += 10;

        // Fecha de generación
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const fecha = new Date().toLocaleDateString('es-AR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        doc.text(`Generado el: ${fecha}`, margin, yPos);
        yPos += 8;

        // Filtros aplicados
        const fechaDesde = document.getElementById('fecha-desde').value;
        const fechaHasta = document.getElementById('fecha-hasta').value;
        if (fechaDesde || fechaHasta) {
            doc.text(`Período: ${fechaDesde || 'Inicio'} - ${fechaHasta || 'Fin'}`, margin, yPos);
            yPos += 6;
        }

        yPos += 5;

        // Tabla de reservas con todos los datos requeridos
        const tableData = reservasData.map(reserva => {
            const cliente = `${reserva.cliente_nombre || ''} ${reserva.cliente_apellido || ''}`.trim() || reserva.nombre_usuario || '-';
            const turno = reserva.hora_desde ? `${reserva.hora_desde.substring(0, 5)} - ${reserva.hora_hasta.substring(0, 5)}` : '-';
            const salonInfo = `${reserva.salon_titulo || '-'}\n${reserva.salon_direccion || ''}`;
            const serviciosInfo = reserva.servicios || 'Sin servicios adicionales';
            
            return [
                reserva.reserva_id,
                formatDate(reserva.fecha_reserva),
                cliente + '\n' + (reserva.nombre_usuario || ''),
                salonInfo,
                turno,
                serviciosInfo,
                formatCurrency(reserva.importe_total),
                (reserva.activo === 1 || reserva.activo === true) ? 'Activa' : 'Cancelada'
            ];
        });

        doc.autoTable({
            startY: yPos,
            head: [['ID', 'Fecha', 'Cliente\nUsuario', 'Salón\nDirección', 'Turno', 'Servicios', 'Importe Total', 'Estado']],
            body: tableData,
            margin: { left: 10, right: 10, top: 15, bottom: 15 },
            styles: { 
                fontSize: 5, 
                cellPadding: 1.5,
                overflow: 'linebreak',
                cellWidth: 'wrap'
            },
            headStyles: { 
                fillColor: [0, 123, 255], 
                textColor: [255, 255, 255], 
                fontStyle: 'bold', 
                fontSize: 5 
            },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            columnStyles: {
                0: { cellWidth: 12 },
                1: { cellWidth: 22 },
                2: { cellWidth: 30 },
                3: { cellWidth: 35 },
                4: { cellWidth: 20 },
                5: { cellWidth: 38 },
                6: { cellWidth: 22 },
                7: { cellWidth: 18 }
            },
            tableWidth: 190,
            showHead: 'everyPage',
            pageBreak: 'auto',
            horizontalPageBreak: false
        });

        // Guardar PDF
        const filename = `Reporte_Reservas_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
    });

    // Cargar reservas por defecto (todas)
    fetchReservas();
});

