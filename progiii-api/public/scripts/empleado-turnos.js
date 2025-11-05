document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/turnos';
    const activosBody = document.getElementById('turnos-activos-body');
    const inactivosBody = document.getElementById('turnos-inactivos-body');
    const filterInput = document.getElementById('filter-input');
    const noResults = document.getElementById('no-results');
    
    const addModal = document.getElementById('add-modal');
    const openAddModalBtn = document.getElementById('open-add-modal-btn');
    const closeAddModalBtn = document.querySelector('.close-add-modal');
    const addTurnoForm = document.getElementById('add-turno-form');

    const detailsModal = document.getElementById('details-modal');
    const closeDetailsModalBtn = document.querySelector('.close-details-modal');
    const turnoDetailsView = document.getElementById('turno-details-view');
    const editTurnoForm = document.getElementById('edit-turno-form');
    const openEditFormBtn = document.getElementById('open-edit-form-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const deleteTurnoBtn = document.getElementById('delete-turno-btn');
    
    let allTurnos = [];

    function formatTime(timeString) {
        if (!timeString) return '-';
        return timeString.substring(0, 5);
    }

    function formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR') + ' ' + date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    }

    function showViewMode() {
        turnoDetailsView.style.display = 'block';
        editTurnoForm.style.display = 'none';
    }

    function openDetailsModal(turno) {
        document.getElementById('view-id').textContent = turno.turno_id;
        document.getElementById('view-orden').textContent = turno.orden;
        document.getElementById('view-hora-desde').textContent = formatTime(turno.hora_desde);
        document.getElementById('view-hora-hasta').textContent = formatTime(turno.hora_hasta);
        document.getElementById('view-estado').textContent = (turno.activo === 1 || turno.activo === true) ? '✅ Activado' : '❌ Desactivado';
        document.getElementById('view-creado').textContent = formatDate(turno.creado);
        
        document.getElementById('edit-id').value = turno.turno_id;
        document.getElementById('edit-orden').value = turno.orden;
        document.getElementById('edit-hora-desde').value = turno.hora_desde.substring(0, 5);
        document.getElementById('edit-hora-hasta').value = turno.hora_hasta.substring(0, 5);
        
        deleteTurnoBtn.dataset.id = turno.turno_id;
        
        // Si el turno está desactivado, mostrar "Reactivar", si no "Desactivar"
        if (turno.activo === 0 || turno.activo === false) {
            deleteTurnoBtn.textContent = 'Reactivar Turno';
            deleteTurnoBtn.className = 'activate-btn';
        } else {
            deleteTurnoBtn.textContent = 'Desactivar Turno';
            deleteTurnoBtn.className = 'delete-btn';
        }
        
        // Mostrar/ocultar botón de eliminación definitiva solo para turnos desactivados
        const permanentDeleteBtn = document.getElementById('permanent-delete-turno-btn');
        if (permanentDeleteBtn) {
            if (turno.activo === 0 || turno.activo === false) {
                permanentDeleteBtn.style.display = 'block';
                permanentDeleteBtn.dataset.id = turno.turno_id;
            } else {
                permanentDeleteBtn.style.display = 'none';
            }
        }
        
        showViewMode();
        detailsModal.style.display = 'flex';
        setTimeout(() => detailsModal.classList.add('show'), 10);
    }

    async function fetchTurnos() {
        try {
            // Incluir turnos inactivos (soft delete) usando ?all=true
            const response = await fetch('http://localhost:3007/api/turnos?all=true');
            if (!response.ok) {
                throw new Error('Error al cargar los turnos');
            }
            const data = await response.json();
            // Manejar respuesta estandarizada { success: true, data: [...] }
            allTurnos = (data.success && data.data) ? data.data : data;
            renderTurnos(allTurnos);
            // Sincronizar anchos de columnas después de renderizar
            setTimeout(() => syncTableColumnWidths(), 100);
        } catch (error) {
            console.error('Error al cargar turnos:', error);
            const errorMessageRow = `<tr><td colspan="7" style="color: red; text-align: center;">Error al conectar con la API: ${error.message}</td></tr>`;
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

    function renderTurnos(turnosToRender) {
        activosBody.innerHTML = '';
        inactivosBody.innerHTML = '';
        
        if (turnosToRender.length === 0) {
            noResults.style.display = 'block';
            return;
        }
        
        noResults.style.display = 'none';

        const turnosActivos = turnosToRender.filter(t => t.activo === 1 || t.activo === true || t.activo === '1');
        const turnosInactivos = turnosToRender.filter(t => t.activo === 0 || t.activo === false || t.activo === '0' || t.activo === null);

        turnosActivos.forEach(turno => createRow(turno, activosBody));
        turnosInactivos.forEach(turno => createRow(turno, inactivosBody));
        
        // Sincronizar anchos después de renderizar
        setTimeout(() => syncTableColumnWidths(), 50);
    }

    function createRow(turno, tbody) {
        const row = tbody.insertRow();
        
        if (turno.activo === 0 || turno.activo === false) {
            row.classList.add('user-inactive-row');
        }

        row.insertCell().textContent = turno.turno_id;
        row.insertCell().textContent = turno.orden;
        row.insertCell().textContent = formatTime(turno.hora_desde);
        row.insertCell().textContent = formatTime(turno.hora_hasta);
        row.insertCell().textContent = (turno.activo === 1 || turno.activo === true) ? 'Activo' : 'Inactivo';
        row.insertCell().textContent = formatDate(turno.creado);

        const actionsCell = row.insertCell();
        actionsCell.className = 'table-actions';
        
        const viewButton = document.createElement('button');
        viewButton.textContent = 'Ver / Editar';
        viewButton.className = 'edit-btn';
        viewButton.addEventListener('click', () => openDetailsModal(turno));
        actionsCell.appendChild(viewButton);
    }

    openAddModalBtn.addEventListener('click', () => {
        addModal.style.display = 'flex';
        addModal.classList.add('show');
        addTurnoForm.reset();
    });

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
            showViewMode();
        }, 300);
    });

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
                showViewMode();
            }, 300);
        }
    });

    openEditFormBtn.addEventListener('click', () => {
        turnoDetailsView.style.display = 'none';
        editTurnoForm.style.display = 'block';
    });

    cancelEditBtn.addEventListener('click', showViewMode);

    addTurnoForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nuevoTurno = {
            orden: parseInt(document.getElementById('add-orden').value),
            hora_desde: document.getElementById('add-hora-desde').value,
            hora_hasta: document.getElementById('add-hora-hasta').value,
        };

        try {
            const response = await window.auth.fetchWithAuth(API_URL, {
                method: 'POST',
                body: JSON.stringify(nuevoTurno),
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
                
                throw new Error(errorData.message || errorData.error || 'Error al crear el turno');
            }

            alert('Turno creado correctamente!');
            addModal.style.display = 'none';
            fetchTurnos();

        } catch (error) {
            alert(`Error al agregar: ${error.message}`);
            console.error('Error al agregar turno:', error);
        }
    });

    editTurnoForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('edit-id').value;
        const turnoActualizado = {
            orden: parseInt(document.getElementById('edit-orden').value),
            hora_desde: document.getElementById('edit-hora-desde').value,
            hora_hasta: document.getElementById('edit-hora-hasta').value,
        };

        try {
            const response = await window.auth.fetchWithAuth(`${API_URL}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(turnoActualizado),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar el turno');
            }

            alert('Turno actualizado correctamente!');
            detailsModal.style.display = 'none';
            showViewMode();
            fetchTurnos();

        } catch (error) {
            alert(`Error al actualizar: ${error.message}`);
            console.error('Error al actualizar turno:', error);
        }
    });

    deleteTurnoBtn.addEventListener('click', async () => {
        const id = deleteTurnoBtn.dataset.id;
        const turno = allTurnos.find(t => t.turno_id == id);
        const isInactive = turno && (turno.activo === 0 || turno.activo === false);
        const action = isInactive ? 'reactivar' : 'desactivar';
        
        if (!confirm(`¿Estás seguro de que quieres ${action} el turno ID ${id}?`)) {
            return;
        }

        try {
            if (isInactive) {
                // Reactivar: actualizar solo activo = 1
                const response = await window.auth.fetchWithAuth(`${API_URL}/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        activo: 1
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.message || 'Error al reactivar el turno');
                }

                alert('Turno reactivado correctamente!');
            } else {
                // Desactivar: soft delete
                const response = await window.auth.fetchWithAuth(`${API_URL}/${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.message || 'Error al desactivar el turno');
                }

                alert('Turno desactivado correctamente!');
            }

            detailsModal.style.display = 'none';
            fetchTurnos();

        } catch (error) {
            alert(`Error: ${error.message}`);
            console.error(`Error al ${action} turno:`, error);
        }
    });

    // Event listener para eliminación definitiva
    const permanentDeleteBtn = document.getElementById('permanent-delete-turno-btn');
    if (permanentDeleteBtn) {
        permanentDeleteBtn.addEventListener('click', async () => {
            const id = permanentDeleteBtn.dataset.id;
            
            // Confirmación con advertencia
            const confirmMessage = `⚠️ ADVERTENCIA: Esta acción NO se puede deshacer.\n\n` +
                `Estás a punto de eliminar definitivamente el turno ID ${id}.\n\n` +
                `Esta acción eliminará permanentemente el turno de la base de datos.\n\n` +
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
                    throw new Error(errorData.error || errorData.message || 'Error al eliminar definitivamente el turno');
                }
                
                alert('Turno eliminado definitivamente.');
                detailsModal.style.display = 'none';
                fetchTurnos();
            } catch (error) {
                alert(`Error al eliminar definitivamente: ${error.message}`);
                console.error('Error al eliminar definitivamente turno:', error);
            }
        });
    }

    window.filterTurnos = function() {
        const filterText = filterInput.value.toLowerCase();
        const filteredTurnos = allTurnos.filter(turno => {
            const horario = `${formatTime(turno.hora_desde)} - ${formatTime(turno.hora_hasta)}`;
            return horario.toLowerCase().includes(filterText) ||
                   turno.orden.toString().includes(filterText);
        });
        renderTurnos(filteredTurnos);
    };

    fetchTurnos();
});

