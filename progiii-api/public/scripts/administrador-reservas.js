document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/reservas';
    const activosBody = document.getElementById('reservas-activas-body');
    const inactivosBody = document.getElementById('reservas-inactivas-body');
    const addModal = document.getElementById('add-modal');
    const detailsModal = document.getElementById('details-modal');
    const closeAddModalBtn = document.querySelector('.close-add-modal');
    const closeDetailsModalBtn = document.querySelector('.close-details-modal');
    const openAddModalBtn = document.getElementById('open-add-modal-btn');
    const reservaForm = document.getElementById('reserva-form');
    const openEditBtn = document.getElementById('open-edit-btn');
    const deleteReservaBtn = document.getElementById('delete-reserva-btn');
    const noResults = document.getElementById('no-results');
    const modalTitle = document.getElementById('modal-title');
    
    let allReservas = [];
    let allSalones = [];
    let allTurnos = [];
    let allUsuarios = [];
    let allServicios = [];
    let currentReserva = null;
    let isEditMode = false;

    function formatCurrency(amount) {
        if (!amount) return '$0.00';
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
    }

    function formatDate(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-AR');
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

    async function fetchSalones() {
        try {
            const response = await fetch('http://localhost:3007/api/salones');
            allSalones = await response.json();
            const select = document.getElementById('form-salon-id');
            select.innerHTML = '<option value="">Seleccione un salón</option>';
            allSalones.filter(s => s.activo === 1).forEach(salon => {
                const option = document.createElement('option');
                option.value = salon.salon_id;
                option.textContent = `${salon.titulo} - $${parseFloat(salon.importe).toFixed(2)}`;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar salones:', error);
        }
    }

    async function fetchTurnos() {
        try {
            const response = await fetch('http://localhost:3007/api/turnos');
            allTurnos = await response.json();
            const select = document.getElementById('form-turno-id');
            select.innerHTML = '<option value="">Seleccione un turno</option>';
            allTurnos.filter(t => t.activo === 1).sort((a, b) => (a.orden || 0) - (b.orden || 0)).forEach(turno => {
                const option = document.createElement('option');
                option.value = turno.turno_id;
                option.textContent = `${turno.orden || ''} - ${formatTime(turno.hora_desde)} - ${formatTime(turno.hora_hasta)}`;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar turnos:', error);
        }
    }

    async function fetchUsuarios() {
        try {
            const response = await window.auth.fetchWithAuth('/usuarios');
            const data = await response.json();
            // Manejar respuesta estandarizada { success: true, data: [...] }
            allUsuarios = (data.success && data.data) ? data.data : data;
            const select = document.getElementById('form-usuario-id');
            select.innerHTML = '<option value="">Seleccione un cliente</option>';
            allUsuarios.filter(u => u.activo === 1 && u.tipo_usuario === 1).forEach(usuario => {
                const option = document.createElement('option');
                option.value = usuario.usuario_id;
                option.textContent = `${usuario.nombre} ${usuario.apellido} (${usuario.nombre_usuario})`;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        }
    }

    async function fetchServicios() {
        try {
            const response = await fetch('http://localhost:3007/api/servicios');
            const data = await response.json();
            // Manejar respuesta estandarizada { success: true, data: [...] }
            allServicios = (data.success && data.data) ? data.data : data;
            const container = document.getElementById('servicios-checkboxes');
            container.innerHTML = '';
            allServicios.filter(s => s.activo === 1).forEach(servicio => {
                const div = document.createElement('div');
                div.className = 'servicio-checkbox';
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = servicio.servicio_id;
                checkbox.id = `servicio-${servicio.servicio_id}`;
                const label = document.createElement('label');
                label.htmlFor = `servicio-${servicio.servicio_id}`;
                label.textContent = `${servicio.descripcion} - ${formatCurrency(servicio.importe)}`;
                div.appendChild(checkbox);
                div.appendChild(label);
                container.appendChild(div);
            });
        } catch (error) {
            console.error('Error al cargar servicios:', error);
        }
    }

    async function fetchReservas() {
        try {
            // Incluir reservas inactivas (soft delete) usando ?all=true
            const response = await window.auth.fetchWithAuth(`${API_URL}?all=true`);
            if (!response.ok) throw new Error('Error al cargar las reservas');
            const data = await response.json();
            // Manejar respuesta estandarizada { success: true, data: [...] }
            allReservas = (data.success && data.data) ? data.data : data;
            renderReservas(allReservas);
            // Sincronizar anchos de columnas después de renderizar
            setTimeout(() => syncTableColumnWidths(), 100);
        } catch (error) {
            console.error('Error:', error);
            const errorMessageRow = `<tr><td colspan="10" style="color: red; text-align: center;">Error: ${error.message}</td></tr>`;
            activosBody.innerHTML = errorMessageRow;
            inactivosBody.innerHTML = errorMessageRow;
        }
    }

    function syncTableColumnWidths() {
        const activeTable = document.querySelector('.table-container:first-of-type .usuarios-table');
        const inactiveTable = document.querySelector('.table-container:nth-of-type(2) .usuarios-table');
        
        if (activeTable && inactiveTable) {
            const activeHeaders = activeTable.querySelectorAll('thead th');
            const inactiveHeaders = inactiveTable.querySelectorAll('thead th');
            
            if (activeHeaders.length === inactiveHeaders.length) {
                activeHeaders.forEach((th, index) => {
                    if (inactiveHeaders[index]) {
                        const width = th.offsetWidth;
                        inactiveHeaders[index].style.width = width + 'px';
                        inactiveHeaders[index].style.minWidth = width + 'px';
                        inactiveHeaders[index].style.maxWidth = width + 'px';
                    }
                });
            }
        }
    }

    function renderReservas(reservasToRender) {
        activosBody.innerHTML = '';
        inactivosBody.innerHTML = '';
        
        if (reservasToRender.length === 0) {
            noResults.style.display = 'block';
            return;
        }
        noResults.style.display = 'none';

        const sorted = [...reservasToRender].sort((a, b) => new Date(b.fecha_reserva || 0) - new Date(a.fecha_reserva || 0));
        const reservasActivas = sorted.filter(r => r.activo === 1 || r.activo === true || r.activo === '1');
        const reservasInactivas = sorted.filter(r => r.activo === 0 || r.activo === false || r.activo === '0' || r.activo === null);

        reservasActivas.forEach(reserva => createRow(reserva, activosBody));
        reservasInactivas.forEach(reserva => createRow(reserva, inactivosBody));
        
        // Sincronizar anchos después de renderizar
        setTimeout(() => syncTableColumnWidths(), 50);
    }

    function createRow(reserva, tbody) {
        const row = tbody.insertRow();
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

        const actionsCell = row.insertCell();
        actionsCell.className = 'table-actions';
        const viewBtn = document.createElement('button');
        viewBtn.textContent = 'Ver / Editar';
        viewBtn.className = 'edit-btn';
        viewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openDetailsModal(reserva);
        });
        actionsCell.appendChild(viewBtn);
    }

    function openDetailsModal(reserva) {
        currentReserva = reserva;
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
        document.getElementById('view-estado').textContent = reserva.estado || 'pendiente';
        document.getElementById('view-creado').textContent = formatDateTime(reserva.creado);

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

        deleteReservaBtn.dataset.id = reserva.reserva_id;
        
        // Cargar comentarios de la reserva
        loadComentarios(reserva.reserva_id);
        
        // Si la reserva está desactivada, mostrar "Reactivar", si no "Desactivar"
        if (reserva.activo === 0 || reserva.activo === false) {
            deleteReservaBtn.textContent = 'Reactivar Reserva';
            deleteReservaBtn.className = 'activate-btn';
        } else {
            deleteReservaBtn.textContent = 'Desactivar Reserva';
            deleteReservaBtn.className = 'delete-btn';
        }
        
        // Mostrar/ocultar botón de eliminación definitiva solo para reservas desactivadas
        const permanentDeleteBtn = document.getElementById('permanent-delete-reserva-btn');
        if (permanentDeleteBtn) {
            if (reserva.activo === 0 || reserva.activo === false) {
                permanentDeleteBtn.style.display = 'block';
                permanentDeleteBtn.dataset.id = reserva.reserva_id;
            } else {
                permanentDeleteBtn.style.display = 'none';
            }
        }
        
        detailsModal.style.display = 'flex';
        setTimeout(() => detailsModal.classList.add('show'), 10);
    }

    function openAddModal() {
        isEditMode = false;
        modalTitle.textContent = 'Crear Nueva Reserva';
        reservaForm.reset();
        document.getElementById('edit-reserva-id').value = '';
        const hoy = new Date().toISOString().split('T')[0];
        document.getElementById('form-fecha-reserva').setAttribute('min', hoy);
        addModal.style.display = 'flex';
    }

    async function openEditModal(reserva) {
        isEditMode = true;
        currentReserva = reserva;
        modalTitle.textContent = 'Editar Reserva';
        document.getElementById('edit-reserva-id').value = reserva.reserva_id;
        document.getElementById('form-fecha-reserva').value = reserva.fecha_reserva ? reserva.fecha_reserva.split('T')[0] : '';
        document.getElementById('form-salon-id').value = reserva.salon_id || '';
        document.getElementById('form-turno-id').value = reserva.turno_id || '';
        
        // Cargar datos completos de la reserva para obtener usuario_id
        try {
            const response = await window.auth.fetchWithAuth(`${API_URL}/${reserva.reserva_id}`);
            if (response.ok) {
                const data = await response.json();
                // Manejar respuesta estandarizada { success: true, data: {...} }
                const reservaCompleta = (data.success && data.data) ? data.data : data;
                document.getElementById('form-usuario-id').value = reservaCompleta.usuario_id || reserva.usuario_id || '';
                
                // Cargar servicios de la reserva completa
                if (reservaCompleta.servicios) {
                    allServicios.forEach(servicio => {
                        const checkbox = document.getElementById(`servicio-${servicio.servicio_id}`);
                        if (checkbox) {
                            checkbox.checked = reservaCompleta.servicios.some(s => s.servicio_id === servicio.servicio_id);
                        }
                    });
                }
            } else {
                // Fallback a datos disponibles
                document.getElementById('form-usuario-id').value = reserva.usuario_id || '';
            }
        } catch (error) {
            console.error('Error al cargar reserva completa:', error);
            document.getElementById('form-usuario-id').value = reserva.usuario_id || '';
        }
        
        document.getElementById('form-tematica').value = reserva.tematica || '';
        document.getElementById('form-foto-cumpleaniero').value = reserva.foto_cumpleaniero || '';

        detailsModal.classList.remove('show');
        setTimeout(() => {
            detailsModal.style.display = 'none';
        }, 300);
        addModal.style.display = 'flex';
        setTimeout(() => addModal.classList.add('show'), 10);
    }

    openAddModalBtn.addEventListener('click', openAddModal);
    closeAddModalBtn.addEventListener('click', () => {
        addModal.classList.remove('show');
        setTimeout(() => {
            addModal.style.display = 'none';
        }, 300);
    });
    closeDetailsModalBtn.addEventListener('click', () => {
        detailsModal.classList.remove('show');
        setTimeout(() => {
            detailsModal.style.display = 'none';
        }, 300);
    });
    openEditBtn.addEventListener('click', () => openEditModal(currentReserva));

    window.addEventListener('click', (event) => {
        if (event.target === addModal) {
            addModal.classList.remove('show');
            setTimeout(() => {
                addModal.style.display = 'none';
            }, 300);
        }
        if (event.target === detailsModal) {
            detailsModal.classList.remove('show');
            setTimeout(() => {
                detailsModal.style.display = 'none';
            }, 300);
        }
    });

    reservaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-reserva-id').value;
        const selectedServicios = Array.from(document.querySelectorAll('#servicios-checkboxes input:checked'))
            .map(cb => ({ servicio_id: parseInt(cb.value) }));

        const reservaData = {
            fecha_reserva: document.getElementById('form-fecha-reserva').value,
            salon_id: parseInt(document.getElementById('form-salon-id').value),
            turno_id: parseInt(document.getElementById('form-turno-id').value),
            usuario_id: parseInt(document.getElementById('form-usuario-id').value),
            tematica: document.getElementById('form-tematica').value || null,
            foto_cumpleaniero: document.getElementById('form-foto-cumpleaniero').value || null,
            servicios: selectedServicios.map(s => s.servicio_id) // Enviar solo IDs enteros
        };

        try {
            const method = isEditMode ? 'PUT' : 'POST';
            const url = isEditMode ? `${API_URL}/${id}` : API_URL;
            const response = await window.auth.fetchWithAuth(url, {
                method,
                body: JSON.stringify(reservaData)
            });

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { message: `Error ${response.status}: ${response.statusText}` };
                }
                
                if (errorData.details && Array.isArray(errorData.details)) {
                    const errorMessages = errorData.details.map(err => `${err.field}: ${err.message}`).join('\n');
                    throw new Error(`Errores de validación:\n${errorMessages}`);
                }
                
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    const errorMessages = errorData.errors.map(err => err.msg || err).join('\n');
                    throw new Error(errorMessages);
                }
                
                throw new Error(errorData.message || errorData.error || 'Error al guardar la reserva');
            }

            alert(isEditMode ? 'Reserva actualizada correctamente!' : 'Reserva creada correctamente!');
            addModal.classList.remove('show');
            setTimeout(() => {
                addModal.style.display = 'none';
            }, 300);
            fetchReservas();
        } catch (error) {
            alert(`Error: ${error.message}`);
            console.error('Error:', error);
        }
    });

    deleteReservaBtn.addEventListener('click', async () => {
        const id = deleteReservaBtn.dataset.id;
        const reserva = allReservas.find(r => r.reserva_id == id);
        const isInactive = reserva && (reserva.activo === 0 || reserva.activo === false);
        const action = isInactive ? 'reactivar' : 'desactivar';
        
        if (!confirm(`¿Estás seguro de que quieres ${action} la reserva ID ${id}?`)) {
            return;
        }

        try {
            if (isInactive) {
                // Reactivar: actualizar activo = 1 usando PUT
                const response = await window.auth.fetchWithAuth(`${API_URL}/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        fecha_reserva: reserva.fecha_reserva,
                        salon_id: reserva.salon_id,
                        turno_id: reserva.turno_id,
                        usuario_id: reserva.usuario_id,
                        tematica: reserva.tematica,
                        foto_cumpleaniero: reserva.foto_cumpleaniero,
                        servicios: reserva.servicios ? reserva.servicios.map(s => s.servicio_id || s) : [],
                        activo: 1
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.message || 'Error al reactivar la reserva');
                }

                alert('Reserva reactivada correctamente!');
            } else {
                // Desactivar: soft delete
                const response = await window.auth.fetchWithAuth(`${API_URL}/${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.message || 'Error al desactivar la reserva');
                }

                alert('Reserva desactivada correctamente!');
            }

            detailsModal.classList.remove('show');
            setTimeout(() => {
                detailsModal.style.display = 'none';
            }, 300);
            fetchReservas();
        } catch (error) {
            alert(`Error: ${error.message}`);
            console.error(`Error al ${action} reserva:`, error);
        }
    });

    // Event listener para eliminación definitiva
    const permanentDeleteBtn = document.getElementById('permanent-delete-reserva-btn');
    if (permanentDeleteBtn) {
        permanentDeleteBtn.addEventListener('click', async () => {
            const id = permanentDeleteBtn.dataset.id;
            
            // Confirmación con advertencia
            const confirmMessage = `⚠️ ADVERTENCIA: Esta acción NO se puede deshacer.\n\n` +
                `Estás a punto de eliminar definitivamente la reserva ID ${id}.\n\n` +
                `Esta acción eliminará permanentemente la reserva de la base de datos.\n\n` +
                `¿Estás completamente seguro de que deseas continuar?`;
            
            if (!confirm(confirmMessage)) {
                return;
            }
            
            // Segunda confirmación
            if (!confirm('Esta es tu última oportunidad. ¿Proceder con la eliminación definitiva?')) {
                return;
            }
            
            try {
                const response = await window.auth.fetchWithAuth(`${API_URL}/${id}/permanent`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.message || 'Error al eliminar definitivamente la reserva');
                }
                
                alert('Reserva eliminada definitivamente.');
                detailsModal.classList.remove('show');
                setTimeout(() => {
                    detailsModal.style.display = 'none';
                }, 300);
                fetchReservas();
            } catch (error) {
                alert(`Error al eliminar definitivamente: ${error.message}`);
                console.error('Error al eliminar definitivamente reserva:', error);
            }
        });
    }


    window.filterReservas = function() {
        const filterText = document.getElementById('filter-input').value.toLowerCase();
        const filtered = allReservas.filter(r => {
            const cliente = `${r.usuario_nombre || ''} ${r.usuario_apellido || ''}`.toLowerCase();
            return cliente.includes(filterText) ||
                   (r.salon_titulo && r.salon_titulo.toLowerCase().includes(filterText)) ||
                   (r.tematica && r.tematica.toLowerCase().includes(filterText));
        });
        renderReservas(filtered);
    };

    // Funciones para comentarios
    async function loadComentarios(reservaId) {
        try {
            const response = await window.auth.fetchWithAuth(`http://localhost:3007/api/v1/reservas/${reservaId}/comentarios`);
            if (!response.ok) throw new Error('Error al cargar comentarios');
            const data = await response.json();
            const comentarios = (data.success && data.data) ? data.data : data;
            renderComentarios(comentarios);
        } catch (error) {
            console.error('Error al cargar comentarios:', error);
            document.getElementById('comentarios-list').innerHTML = '<p style="color: red; text-align: center;">Error al cargar comentarios</p>';
        }
    }

    function renderComentarios(comentarios) {
        const comentariosList = document.getElementById('comentarios-list');
        const noComentarios = document.getElementById('no-comentarios');
        
        comentariosList.innerHTML = '';
        
        if (!comentarios || comentarios.length === 0) {
            noComentarios.style.display = 'block';
            return;
        }
        
        noComentarios.style.display = 'none';
        
        comentarios.forEach(comentario => {
            const comentarioDiv = document.createElement('div');
            comentarioDiv.className = 'comentario-item';
            comentarioDiv.style.cssText = 'padding: 12px; margin-bottom: 10px; background: white; border-radius: 8px; border-left: 4px solid #667eea; box-shadow: 0 2px 4px rgba(0,0,0,0.1);';
            
            const usuarioInfo = document.createElement('div');
            usuarioInfo.style.cssText = 'font-weight: bold; color: #667eea; margin-bottom: 5px; font-size: 0.9rem;';
            usuarioInfo.textContent = `${comentario.usuario_nombre || ''} ${comentario.usuario_apellido || ''}`.trim() || comentario.nombre_usuario || 'Administrador';
            
            const comentarioText = document.createElement('div');
            comentarioText.style.cssText = 'color: #333; margin-bottom: 5px; white-space: pre-wrap; word-wrap: break-word;';
            comentarioText.textContent = comentario.comentario;
            
            const fechaInfo = document.createElement('div');
            fechaInfo.style.cssText = 'font-size: 0.75rem; color: #999;';
            fechaInfo.textContent = `Creado: ${formatDateTime(comentario.creado)}`;
            
            comentarioDiv.appendChild(usuarioInfo);
            comentarioDiv.appendChild(comentarioText);
            comentarioDiv.appendChild(fechaInfo);
            
            comentariosList.appendChild(comentarioDiv);
        });
    }

    // Event listener para agregar comentario
    const agregarComentarioBtn = document.getElementById('agregar-comentario-btn');
    const nuevoComentarioInput = document.getElementById('nuevo-comentario');
    
    if (agregarComentarioBtn) {
        agregarComentarioBtn.addEventListener('click', async () => {
            const comentario = nuevoComentarioInput.value.trim();
            
            if (!comentario) {
                alert('Por favor ingrese un comentario');
                return;
            }
            
            if (!currentReserva || !currentReserva.reserva_id) {
                alert('No hay reserva seleccionada');
                return;
            }
            
            try {
                const response = await window.auth.fetchWithAuth(`http://localhost:3007/api/v1/reservas/${currentReserva.reserva_id}/comentarios`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ comentario }),
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.message || 'Error al agregar comentario');
                }
                
                // Limpiar input y recargar comentarios
                nuevoComentarioInput.value = '';
                loadComentarios(currentReserva.reserva_id);
                
            } catch (error) {
                alert(`Error: ${error.message}`);
                console.error('Error al agregar comentario:', error);
            }
        });
    }

    // Inicializar
    fetchSalones();
    fetchTurnos();
    fetchUsuarios();
    fetchServicios();
    fetchReservas();
});

