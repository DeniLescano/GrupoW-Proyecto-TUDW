document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/reservas/mis-reservas';
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
            const data = await response.json();
            // Manejar respuesta estandarizada { success: true, data: [...] }
            allReservas = (data.success && data.data) ? data.data : data;
            renderReservas(allReservas);
        } catch (error) {
            console.error('Error al cargar reservas:', error);
            reservasBody.innerHTML = `<tr><td colspan="8" style="color: red; text-align: center;">Error al conectar con la API: ${error.message}</td></tr>`;
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
        document.getElementById('view-salon').textContent = reserva.salon_titulo || '-';
        document.getElementById('view-direccion').textContent = reserva.salon_direccion || '-';
        document.getElementById('view-turno').textContent = reserva.hora_desde ? `${formatTime(reserva.hora_desde)} - ${formatTime(reserva.hora_hasta)}` : '-';
        document.getElementById('view-tematica').textContent = reserva.tematica || '-';
        document.getElementById('view-importe-salon').textContent = formatCurrency(reserva.importe_salon);
        document.getElementById('view-importe-total').textContent = formatCurrency(reserva.importe_total);
        document.getElementById('view-estado').textContent = (reserva.activo === 1 || reserva.activo === true) ? 'Activa' : 'Cancelada';
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
        
        // Mostrar/ocultar botón de cancelar según el estado
        const cancelBtn = document.getElementById('cancel-reserva-btn');
        const cancelSection = document.getElementById('cancel-reserva-section');
        if (reserva.activo === 0 || reserva.activo === false) {
            cancelSection.style.display = 'none';
        } else {
            cancelSection.style.display = 'block';
            cancelBtn.dataset.id = reserva.reserva_id;
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
            return (reserva.salon_titulo && reserva.salon_titulo.toLowerCase().includes(filterText)) ||
                   (reserva.tematica && reserva.tematica.toLowerCase().includes(filterText));
        });
        renderReservas(filteredReservas);
    };

    // Cancelar reserva
    const cancelReservaBtn = document.getElementById('cancel-reserva-btn');
    const cancelModal = document.getElementById('cancel-modal');
    const cancelForm = document.getElementById('cancel-reserva-form');
    const cancelMotivo = document.getElementById('cancel-motivo');
    const cancelReservaIdHidden = document.getElementById('cancel-reserva-id-hidden');
    const cancelReservaId = document.getElementById('cancel-reserva-id');
    const closeCancelModalBtn = document.querySelector('.close-cancel-modal');
    
    if (cancelReservaBtn) {
        cancelReservaBtn.addEventListener('click', () => {
            const reservaId = cancelReservaBtn.dataset.id;
            if (!reservaId) {
                alert('Error: No se pudo obtener el ID de la reserva');
                return;
            }
            
            cancelReservaId.textContent = reservaId;
            cancelReservaIdHidden.value = reservaId;
            cancelMotivo.value = '';
            
            cancelModal.style.display = 'flex';
            setTimeout(() => cancelModal.classList.add('show'), 10);
        });
    }
    
    if (closeCancelModalBtn) {
        closeCancelModalBtn.addEventListener('click', () => {
            cancelModal.classList.remove('show');
            setTimeout(() => {
                cancelModal.style.display = 'none';
            }, 300);
        });
    }
    
    if (cancelForm) {
        cancelForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const reservaId = cancelReservaIdHidden.value;
            const motivo = cancelMotivo.value.trim();
            
            if (!motivo) {
                alert('Por favor ingrese el motivo de la cancelación');
                return;
            }
            
            if (!confirm(`¿Está seguro de que desea cancelar la reserva ID ${reservaId}?\n\nEsta acción no se puede deshacer.`)) {
                return;
            }
            
            try {
                // Soft delete - cancelar reserva usando el endpoint de cancelación para clientes
                const response = await window.auth.fetchWithAuth(`http://localhost:3007/api/v1/reservas/${reservaId}/cancelar`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        motivo_cancelacion: motivo
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.message || 'Error al cancelar la reserva');
                }
                
                const data = await response.json();
                const responseData = data.success && data.data ? data.data : data;
                
                let alertMessage = 'Reserva cancelada exitosamente.';
                
                // Si hay información de email, mostrarla
                if (responseData.emailInfo) {
                    const emailInfo = responseData.emailInfo;
                    if (emailInfo.enviado) {
                        alertMessage += `\n\n📧 Email de cancelación enviado a: ${emailInfo.email}`;
                        if (emailInfo.previewUrl) {
                            alertMessage += `\n\n🔗 Preview URL (modo desarrollo):\n${emailInfo.previewUrl}`;
                        }
                    } else {
                        alertMessage += `\n\n⚠️ No se pudo enviar el email de cancelación a: ${emailInfo.email}`;
                    }
                }
                
                alert(alertMessage);
                
                cancelModal.classList.remove('show');
                setTimeout(() => {
                    cancelModal.style.display = 'none';
                }, 300);
                detailsModal.style.display = 'none';
                
                fetchReservas();
            } catch (error) {
                alert(`Error al cancelar la reserva: ${error.message}`);
                console.error('Error al cancelar reserva:', error);
            }
        });
    }
    
    window.addEventListener('click', (event) => {
        if (event.target === cancelModal) {
            cancelModal.classList.remove('show');
            setTimeout(() => {
                cancelModal.style.display = 'none';
            }, 300);
        }
    });

    fetchReservas();
});

