document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/servicios';
    const serviciosBody = document.getElementById('servicios-body');
    const filterInput = document.getElementById('filter-input');
    const noResults = document.getElementById('no-results');
    
    const addModal = document.getElementById('add-modal');
    const openAddModalBtn = document.getElementById('open-add-modal-btn');
    const closeAddModalBtn = document.querySelector('.close-add-modal');
    const addServicioForm = document.getElementById('add-servicio-form');

    const detailsModal = document.getElementById('details-modal');
    const closeDetailsModalBtn = document.querySelector('.close-details-modal');
    const servicioDetailsView = document.getElementById('servicio-details-view');
    const editServicioForm = document.getElementById('edit-servicio-form');
    const openEditFormBtn = document.getElementById('open-edit-form-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const deleteServicioBtn = document.getElementById('delete-servicio-btn');
    
    let allServicios = [];

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

    function showViewMode() {
        servicioDetailsView.style.display = 'block';
        editServicioForm.style.display = 'none';
    }

    function openDetailsModal(servicio) {
        document.getElementById('view-id').textContent = servicio.servicio_id;
        document.getElementById('view-descripcion').textContent = servicio.descripcion;
        document.getElementById('view-importe').textContent = formatCurrency(servicio.importe);
        document.getElementById('view-estado').textContent = (servicio.activo === 1 || servicio.activo === true) ? 'Activo' : 'Inactivo';
        document.getElementById('view-creado').textContent = formatDate(servicio.creado);
        
        document.getElementById('edit-id').value = servicio.servicio_id;
        document.getElementById('edit-descripcion').value = servicio.descripcion;
        document.getElementById('edit-importe').value = servicio.importe;
        
        deleteServicioBtn.dataset.id = servicio.servicio_id;
        
        showViewMode();
        detailsModal.style.display = 'flex';
    }

    async function fetchServicios() {
        try {
            const response = await fetch('http://localhost:3007/api/servicios');
            if (!response.ok) {
                throw new Error('Error al cargar los servicios');
            }
            allServicios = await response.json();
            renderServicios(allServicios);
        } catch (error) {
            console.error('Error al cargar servicios:', error);
            serviciosBody.innerHTML = `<tr><td colspan="6" style="color: red; text-align: center;">Error al conectar con la API: ${error.message}</td></tr>`;
        }
    }

    function renderServicios(serviciosToRender) {
        serviciosBody.innerHTML = '';
        
        if (serviciosToRender.length === 0) {
            noResults.style.display = 'block';
            return;
        }
        
        noResults.style.display = 'none';

        serviciosToRender.forEach(servicio => {
            const row = serviciosBody.insertRow();
            
            if (servicio.activo === 0 || servicio.activo === false) {
                row.classList.add('user-inactive-row');
            }

            row.insertCell().textContent = servicio.servicio_id;
            row.insertCell().textContent = servicio.descripcion;
            row.insertCell().textContent = formatCurrency(servicio.importe);
            row.insertCell().textContent = (servicio.activo === 1 || servicio.activo === true) ? 'Activo' : 'Inactivo';
            row.insertCell().textContent = formatDate(servicio.creado);

            const actionsCell = row.insertCell();
            actionsCell.className = 'table-actions';
            
            const viewButton = document.createElement('button');
            viewButton.textContent = 'Ver / Editar';
            viewButton.className = 'edit-btn';
            viewButton.addEventListener('click', () => openDetailsModal(servicio));
            actionsCell.appendChild(viewButton);
        });
    }

    openAddModalBtn.addEventListener('click', () => {
        addModal.style.display = 'flex';
        addServicioForm.reset();
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
        servicioDetailsView.style.display = 'none';
        editServicioForm.style.display = 'block';
    });

    cancelEditBtn.addEventListener('click', showViewMode);

    addServicioForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const descripcion = document.getElementById('add-descripcion').value.trim();
        const importe = document.getElementById('add-importe').value;
        
        if (!descripcion || !importe) {
            alert('Todos los campos son obligatorios');
            return;
        }
        
        const nuevoServicio = {
            descripcion: descripcion,
            importe: parseFloat(importe),
        };

        try {
            const response = await window.auth.fetchWithAuth(API_URL, {
                method: 'POST',
                body: JSON.stringify(nuevoServicio),
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
                
                throw new Error(errorData.message || errorData.error || 'Error al crear el servicio');
            }

            alert('Servicio creado correctamente!');
            addModal.style.display = 'none';
            fetchServicios();

        } catch (error) {
            alert(`Error al agregar: ${error.message}`);
            console.error('Error al agregar servicio:', error);
        }
    });

    editServicioForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('edit-id').value;
        const servicioActualizado = {
            descripcion: document.getElementById('edit-descripcion').value,
            importe: parseFloat(document.getElementById('edit-importe').value),
        };

        try {
            const response = await window.auth.fetchWithAuth(`${API_URL}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(servicioActualizado),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar el servicio');
            }

            alert('Servicio actualizado correctamente!');
            detailsModal.style.display = 'none';
            showViewMode();
            fetchServicios();

        } catch (error) {
            alert(`Error al actualizar: ${error.message}`);
            console.error('Error al actualizar servicio:', error);
        }
    });

    deleteServicioBtn.addEventListener('click', async () => {
        const id = deleteServicioBtn.dataset.id;
        
        if (!confirm(`¿Estás seguro de que quieres eliminar (desactivar) el servicio ID ${id}?`)) {
            return;
        }

        try {
            const response = await window.auth.fetchWithAuth(`${API_URL}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar el servicio');
            }

            alert('Servicio eliminado correctamente (Soft Delete)!');
            detailsModal.style.display = 'none';
            fetchServicios();

        } catch (error) {
            alert(`Error al eliminar: ${error.message}`);
            console.error('Error al eliminar servicio:', error);
        }
    });

    window.filterServicios = function() {
        const filterText = filterInput.value.toLowerCase();
        const filteredServicios = allServicios.filter(servicio => {
            return servicio.descripcion.toLowerCase().includes(filterText);
        });
        renderServicios(filteredServicios);
    };

    fetchServicios();
});

