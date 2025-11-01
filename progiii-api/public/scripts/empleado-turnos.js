document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/turnos';
    const turnosBody = document.getElementById('turnos-body');
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
        document.getElementById('view-estado').textContent = (turno.activo === 1 || turno.activo === true) ? 'Activo' : 'Inactivo';
        document.getElementById('view-creado').textContent = formatDate(turno.creado);
        
        document.getElementById('edit-id').value = turno.turno_id;
        document.getElementById('edit-orden').value = turno.orden;
        document.getElementById('edit-hora-desde').value = turno.hora_desde.substring(0, 5);
        document.getElementById('edit-hora-hasta').value = turno.hora_hasta.substring(0, 5);
        
        deleteTurnoBtn.dataset.id = turno.turno_id;
        
        showViewMode();
        detailsModal.style.display = 'flex';
    }

    async function fetchTurnos() {
        try {
            const response = await fetch('http://localhost:3007/api/turnos');
            if (!response.ok) {
                throw new Error('Error al cargar los turnos');
            }
            allTurnos = await response.json();
            renderTurnos(allTurnos);
        } catch (error) {
            console.error('Error al cargar turnos:', error);
            turnosBody.innerHTML = `<tr><td colspan="7" style="color: red; text-align: center;">Error al conectar con la API: ${error.message}</td></tr>`;
        }
    }

    function renderTurnos(turnosToRender) {
        turnosBody.innerHTML = '';
        
        if (turnosToRender.length === 0) {
            noResults.style.display = 'block';
            return;
        }
        
        noResults.style.display = 'none';

        turnosToRender.forEach(turno => {
            const row = turnosBody.insertRow();
            
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
        });
    }

    openAddModalBtn.addEventListener('click', () => {
        addModal.style.display = 'flex';
        addTurnoForm.reset();
    });

    closeAddModalBtn.addEventListener('click', () => {
        addModal.style.display = 'none';
    });

    closeDetailsModalBtn.addEventListener('click', () => {
        detailsModal.style.display = 'none';
        showViewMode();
    });

    window.addEventListener('click', (event) => {
        if (event.target === addModal) {
            addModal.style.display = 'none';
        }
        if (event.target === detailsModal) {
            detailsModal.style.display = 'none';
            showViewMode();
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
        
        if (!confirm(`¿Estás seguro de que quieres eliminar (desactivar) el turno ID ${id}?`)) {
            return;
        }

        try {
            const response = await window.auth.fetchWithAuth(`${API_URL}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar el turno');
            }

            alert('Turno eliminado correctamente (Soft Delete)!');
            detailsModal.style.display = 'none';
            fetchTurnos();

        } catch (error) {
            alert(`Error al eliminar: ${error.message}`);
            console.error('Error al eliminar turno:', error);
        }
    });

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

