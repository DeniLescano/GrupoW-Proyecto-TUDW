document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/salones';
    
    // Verificar autenticación
    if (!window.auth || !window.auth.isAuthenticated() || !window.auth.isAdmin()) {
        window.location.href = '../login.html';
    }
    
    const loadingMessage = document.getElementById('loading-message');
    const errorMessage = document.getElementById('error-message');
    const informesContainer = document.querySelector('.informes-container');
    const salonesDetailBody = document.getElementById('salones-detail-body');
    
    let allSalonesData = [];
    let statsData = {};

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
        return date.toLocaleDateString('es-AR') + ' ' + date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    }

    async function fetchAllSalones() {
        try {
            loadingMessage.style.display = 'block';
            errorMessage.style.display = 'none';
            informesContainer.style.display = 'none';

            // Obtener estadísticas usando procedimiento almacenado
            const statsResponse = await window.auth.fetchWithAuth('/estadisticas/salones');
            if (!statsResponse.ok) {
                throw new Error('Error al cargar las estadísticas');
            }
            const statsDataRaw = await statsResponse.json();
            // Manejar respuesta estandarizada { success: true, data: {...} }
            const estadisticas = (statsDataRaw.success && statsDataRaw.data) ? statsDataRaw.data : statsDataRaw;
            displayStats(estadisticas);

            // Obtener todos los salones para la tabla
            const response = await window.auth.fetchWithAuth(`${API_URL}?all=true`);
            if (!response.ok) {
                throw new Error('Error al cargar los salones');
            }
            
            const salonesDataRaw = await response.json();
            // Manejar respuesta estandarizada { success: true, data: [...] }
            const allSalones = (salonesDataRaw.success && salonesDataRaw.data) ? salonesDataRaw.data : salonesDataRaw;
            allSalonesData = allSalones;
            statsData = estadisticas;
            displaySalonesTable(allSalones);
            
            loadingMessage.style.display = 'none';
            informesContainer.style.display = 'block';

        } catch (error) {
            console.error('Error al cargar informes:', error);
            loadingMessage.style.display = 'none';
            errorMessage.style.display = 'block';
        }
    }

    function displayStats(estadisticas) {
        // Actualizar DOM con estadísticas del procedimiento almacenado
        document.getElementById('total-salones').textContent = estadisticas.total_salones || 0;
        document.getElementById('salones-activos').textContent = estadisticas.salones_activos || 0;
        document.getElementById('salones-inactivos').textContent = estadisticas.salones_inactivos || 0;
        
        document.getElementById('capacidad-total').textContent = (estadisticas.capacidad_total || 0).toLocaleString('es-AR');
        document.getElementById('capacidad-promedio').textContent = Math.round(estadisticas.capacidad_promedio || 0).toLocaleString('es-AR');
        document.getElementById('capacidad-maxima').textContent = (estadisticas.capacidad_maxima || 0).toLocaleString('es-AR');
        document.getElementById('capacidad-minima').textContent = (estadisticas.capacidad_minima || 0).toLocaleString('es-AR');
        
        document.getElementById('importe-total').textContent = formatCurrency(estadisticas.importe_total || 0);
        document.getElementById('importe-promedio').textContent = formatCurrency(estadisticas.importe_promedio || 0);
        document.getElementById('importe-maximo').textContent = formatCurrency(estadisticas.importe_maximo || 0);
        document.getElementById('importe-minimo').textContent = formatCurrency(estadisticas.importe_minimo || 0);
    }

    function displaySalonesTable(salones) {
        salonesDetailBody.innerHTML = '';
        
        // Ordenar por fecha de creación (más recientes primero)
        const sortedSalones = [...salones].sort((a, b) => {
            const dateA = new Date(a.creado || 0);
            const dateB = new Date(b.creado || 0);
            return dateB - dateA;
        });

        sortedSalones.forEach(salon => {
            const row = salonesDetailBody.insertRow();
            
            if (salon.activo === 0 || salon.activo === false) {
                row.classList.add('user-inactive-row');
            }

            row.insertCell().textContent = salon.salon_id;
            row.insertCell().textContent = salon.titulo || '-';
            row.insertCell().textContent = salon.direccion || '-';
            row.insertCell().textContent = salon.capacidad || '-';
            row.insertCell().textContent = formatCurrency(salon.importe);
            row.insertCell().textContent = (salon.activo === 1 || salon.activo === true) ? 'Activo' : 'Inactivo';
            row.insertCell().textContent = formatDate(salon.creado);
        });

        if (salones.length === 0) {
            const row = salonesDetailBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 7;
            cell.textContent = 'No hay salones registrados';
            cell.style.textAlign = 'center';
            cell.style.color = '#6c757d';
        }
    }

    // Funcionalidad de PDF y CSV
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const pdfConfigModal = document.getElementById('pdf-config-modal');
    const pdfConfigForm = document.getElementById('pdf-config-form');
    const closePdfConfigBtn = document.querySelector('.close-pdf-config-modal');

    exportPdfBtn.addEventListener('click', () => {
        pdfConfigModal.style.display = 'flex';
    });

    exportCsvBtn.addEventListener('click', () => {
        exportToCSV();
    });

    closePdfConfigBtn.addEventListener('click', () => {
        pdfConfigModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === pdfConfigModal) {
            pdfConfigModal.style.display = 'none';
        }
    });

    pdfConfigForm.addEventListener('submit', (e) => {
        e.preventDefault();
        generatePDF();
        pdfConfigModal.style.display = 'none';
    });

    function generatePDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        let yPos = 20;
        const pageWidth = doc.internal.pageSize.width;
        const margin = 15;
        const maxWidth = pageWidth - (margin * 2);

        // Configuración
        const includeEstadisticasGenerales = document.getElementById('include-estadisticas-generales').checked;
        const includeEstadisticasCapacidad = document.getElementById('include-estadisticas-capacidad').checked;
        const includeEstadisticasImportes = document.getElementById('include-estadisticas-importes').checked;
        const includeTablaDetalles = document.getElementById('include-tabla-detalles').checked;
        const onlyActivos = document.getElementById('only-activos').checked;

        // Filtrar salones si es necesario
        let salonesParaPDF = allSalonesData;
        if (onlyActivos) {
            salonesParaPDF = allSalonesData.filter(s => s.activo === 1 || s.activo === true);
        }

        // Título
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('Informe de Salones', margin, yPos);
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

        // Estadísticas Generales
        if (includeEstadisticasGenerales) {
            if (yPos > 250) { doc.addPage(); yPos = 20; }
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('Estadísticas Generales', margin, yPos);
            yPos += 8;
            
            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');
            doc.text(`Total de Salones: ${statsData.total_salones || 0}`, margin, yPos);
            yPos += 6;
            doc.text(`Salones Activos: ${statsData.salones_activos || 0}`, margin, yPos);
            yPos += 6;
            doc.text(`Salones Inactivos: ${statsData.salones_inactivos || 0}`, margin, yPos);
            yPos += 10;
        }

        // Estadísticas de Capacidad
        if (includeEstadisticasCapacidad) {
            if (yPos > 250) { doc.addPage(); yPos = 20; }
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('Estadísticas de Capacidad', margin, yPos);
            yPos += 8;
            
            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');
            const capacidadTotal = (statsData.capacidad_total || 0);
            const capacidadPromedio = (statsData.capacidad_promedio || 0);
            const capacidadMaxima = (statsData.capacidad_maxima || 0);
            const capacidadMinima = (statsData.capacidad_minima || 0);
            doc.text(`Capacidad Total: ${capacidadTotal.toLocaleString('es-AR')} personas`, margin, yPos);
            yPos += 6;
            doc.text(`Capacidad Promedio: ${Math.round(capacidadPromedio).toLocaleString('es-AR')} personas`, margin, yPos);
            yPos += 6;
            doc.text(`Capacidad Máxima: ${capacidadMaxima.toLocaleString('es-AR')} personas`, margin, yPos);
            yPos += 6;
            doc.text(`Capacidad Mínima: ${capacidadMinima.toLocaleString('es-AR')} personas`, margin, yPos);
            yPos += 10;
        }

        // Estadísticas de Importes
        if (includeEstadisticasImportes) {
            if (yPos > 250) { doc.addPage(); yPos = 20; }
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('Estadísticas de Importes', margin, yPos);
            yPos += 8;
            
            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');
            doc.text(`Importe Total: ${formatCurrency(statsData.importe_total || 0)}`, margin, yPos);
            yPos += 6;
            doc.text(`Importe Promedio: ${formatCurrency(statsData.importe_promedio || 0)}`, margin, yPos);
            yPos += 6;
            doc.text(`Importe Máximo: ${formatCurrency(statsData.importe_maximo || 0)}`, margin, yPos);
            yPos += 6;
            doc.text(`Importe Mínimo: ${formatCurrency(statsData.importe_minimo || 0)}`, margin, yPos);
            yPos += 10;
        }

        // Tabla de Detalles
        if (includeTablaDetalles && salonesParaPDF.length > 0) {
            if (yPos > 200) { doc.addPage(); yPos = 20; }
            
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('Detalle de Salones', margin, yPos);
            yPos += 8;

            const tableData = salonesParaPDF.map(salon => [
                salon.salon_id,
                salon.titulo || '-',
                salon.direccion || '-',
                salon.capacidad || '-',
                formatCurrency(salon.importe),
                (salon.activo === 1 || salon.activo === true) ? 'Activo' : 'Inactivo',
                formatDate(salon.creado).split(' ')[0] // Solo fecha
            ]);

            doc.autoTable({
                startY: yPos,
                head: [['ID', 'Título', 'Dirección', 'Capacidad', 'Importe', 'Estado', 'Creado']],
                body: tableData,
                margin: { left: margin, right: margin },
                styles: { fontSize: 8 },
                headStyles: { fillColor: [0, 123, 255], textColor: [255, 255, 255], fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [245, 245, 245] }
            });
        }

        // Guardar PDF
        const filename = `Informe_Salones_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
    }

    function exportToCSV() {
        const onlyActivos = confirm('¿Incluir solo salones activos? (Aceptar = Solo activos, Cancelar = Todos)');
        let salonesParaCSV = allSalonesData;
        
        if (onlyActivos) {
            salonesParaCSV = allSalonesData.filter(s => s.activo === 1 || s.activo === true);
        }

        // CSV con formato mejorado y separador de punto y coma para Excel
        let csv = 'ID;Título;Dirección;Capacidad (personas);Importe (ARS);Estado;Fecha de Creación\n';
        
        // Datos - usando punto y coma como separador
        salonesParaCSV.forEach(salon => {
            const fecha = formatDate(salon.creado).split(' ')[0];
            const titulo = (salon.titulo || '').replace(/"/g, '""'); // Escapar comillas
            const direccion = (salon.direccion || '').replace(/"/g, '""'); // Escapar comillas
            const importe = parseFloat(salon.importe || 0).toFixed(2);
            const estado = (salon.activo === 1 || salon.activo === true) ? 'Activo' : 'Inactivo';
            
            csv += `${salon.salon_id};"${titulo}";"${direccion}";${salon.capacidad || ''};"${importe}";"${estado}";"${fecha}"\n`;
        });

        // Crear y descargar archivo con BOM para UTF-8 en Excel
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Informe_Salones_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    fetchAllSalones();
});

