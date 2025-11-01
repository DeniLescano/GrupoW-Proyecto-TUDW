document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/reservas';
    const reservasBody = document.getElementById('reservas-body');
    const detailsModal = document.getElementById('details-modal');
    const closeDetailsModalBtn = document.querySelector('.close-details-modal');
    const noResults = document.getElementById('no-results');
    
    let allReservas = [];

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

    function formatDateTime(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR') + ' ' + date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    }

    function formatTime(timeString) {
        if (!timeString) return '-';
        return timeString.substring(0, 5);
    }

    async function fetchReservas() {
        try {
            const response = await window.auth.fetchWithAuth(API_URL);
            if (!response.ok) {
                throw new Error('Error al cargar las reservas');
            }
            allReservas = await response.json();
            renderReservas(allReservas);
        } catch (error) {
            console.error('Error al cargar reservas:', error);
            reservasBody.innerHTML = `<tr><td colspan="9" style="color: red; text-align: center;">Error al conectar con la API: ${error.message}</td></tr>`;
        }
    }

    function renderReservas(reservasToRender) {
        reservasBody.innerHTML = '';
        
        if (reservasToRender.length === 0) {
            noResults.style.display = 'block';
            return;
        }
        
        noResults.style.display = 'none';

        const sortedReservas = [...reservasToRender].sort((a, b) => {
            const dateA = new Date(a.fecha_reserva || 0);
            const dateB = new Date(b.fecha_reserva || 0);
            return dateB - dateA;
        });

        sortedReservas.forEach(reserva => {
            const row = reservasBody.insertRow();
            
            if (reserva.activo === 0 || reserva.activo === false) {
                row.classList.add('user-inactive-row');
            }

            row.insertCell().textContent = reserva.reserva_id;
            row.insertCell().textContent = formatDate(reserva.fecha_reserva);
            row.insertCell().textContent = `${reserva.usuario_nombre || ''} ${reserva.usuario_apellido || ''}`.trim() || reserva.nombre_usuario || '-';
            row.insertCell().textContent = reserva.salon_titulo || '-';
            
            const turnoCell = row.insertCell();
            turnoCell.textContent = reserva.hora_desde ? `${formatTime(reserva.hora_desde)} - ${formatTime(reserva.hora_hasta)}` : '-';
            
            row.insertCell().textContent = reserva.tematica || '-';
            row.insertCell().textContent = formatCurrency(reserva.importe_total);
            row.insertCell().textContent = (reserva.activo === 1 || reserva.activo === true) ? 'Activa' : 'Cancelada';
            row.insertCell().textContent = formatDateTime(reserva.creado);

            // Agregar click para ver detalles
            row.style.cursor = 'pointer';
            row.addEventListener('click', () => openDetailsModal(reserva));
        });
    }

    function openDetailsModal(reserva) {
        document.getElementById('view-id').textContent = reserva.reserva_id;
        document.getElementById('view-fecha').textContent = formatDate(reserva.fecha_reserva);
        document.getElementById('view-cliente').textContent = `${reserva.usuario_nombre || ''} ${reserva.usuario_apellido || ''}`.trim() || '-';
        document.getElementById('view-usuario').textContent = reserva.nombre_usuario || '-';
        document.getElementById('view-salon').textContent = reserva.salon_titulo || '-';
        document.getElementById('view-direccion').textContent = reserva.salon_direccion || '-';
        document.getElementById('view-turno').textContent = reserva.hora_desde ? `${formatTime(reserva.hora_desde)} - ${formatTime(reserva.hora_hasta)}` : '-';
        document.getElementById('view-tematica').textContent = reserva.tematica || '-';
        document.getElementById('view-importe-salon').textContent = formatCurrency(reserva.importe_salon);
        document.getElementById('view-importe-total').textContent = formatCurrency(reserva.importe_total);
        document.getElementById('view-creado').textContent = formatDateTime(reserva.creado);
        
        // Mostrar servicios
        const serviciosList = document.getElementById('view-servicios');
        serviciosList.innerHTML = '';
        if (reserva.servicios && reserva.servicios.length > 0) {
            reserva.servicios.forEach(servicio => {
                const li = document.createElement('li');
                li.textContent = `${servicio.descripcion} - ${formatCurrency(servicio.importe)}`;
                serviciosList.appendChild(li);
            });
        } else {
            serviciosList.innerHTML = '<li>No hay servicios adicionales</li>';
        }
        
        detailsModal.style.display = 'flex';
    }

    closeDetailsModalBtn.addEventListener('click', () => {
        detailsModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === detailsModal) {
            detailsModal.style.display = 'none';
        }
    });

    window.filterReservas = function() {
        const filterText = document.getElementById('filter-input').value.toLowerCase();
        const filteredReservas = allReservas.filter(reserva => {
            const clienteNombre = `${reserva.usuario_nombre || ''} ${reserva.usuario_apellido || ''}`.toLowerCase();
            return clienteNombre.includes(filterText) ||
                   (reserva.salon_titulo && reserva.salon_titulo.toLowerCase().includes(filterText)) ||
                   (reserva.tematica && reserva.tematica.toLowerCase().includes(filterText));
        });
        renderReservas(filteredReservas);
    };

    fetchReservas();
});

