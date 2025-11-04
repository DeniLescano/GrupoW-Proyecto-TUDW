document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/servicios';
    const activosBody = document.getElementById('servicios-activos-body');
    const inactivosBody = document.getElementById('servicios-inactivos-body');
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
        document.getElementById('view-estado').textContent = (servicio.activo === 1 || servicio.activo === true) ? '✅ Activado' : '❌ Desactivado';
        document.getElementById('view-creado').textContent = formatDate(servicio.creado);
        
        document.getElementById('edit-id').value = servicio.servicio_id;
        document.getElementById('edit-descripcion').value = servicio.descripcion;
        document.getElementById('edit-importe').value = servicio.importe;
        
        deleteServicioBtn.dataset.id = servicio.servicio_id;
        
        // Si el servicio está desactivado, mostrar "Reactivar", si no "Desactivar"
        if (servicio.activo === 0 || servicio.activo === false) {
            deleteServicioBtn.textContent = 'Reactivar Servicio';
            deleteServicioBtn.className = 'activate-btn';
        } else {
            deleteServicioBtn.textContent = 'Desactivar Servicio';
            deleteServicioBtn.className = 'delete-btn';
        }
        
        // Mostrar/ocultar botón de eliminación definitiva solo para servicios desactivados
        const permanentDeleteBtn = document.getElementById('permanent-delete-servicio-btn');
        if (permanentDeleteBtn) {
            if (servicio.activo === 0 || servicio.activo === false) {
                permanentDeleteBtn.style.display = 'block';
                permanentDeleteBtn.dataset.id = servicio.servicio_id;
            } else {
                permanentDeleteBtn.style.display = 'none';
            }
        }
        
        showViewMode();
        detailsModal.style.display = 'flex';
        setTimeout(() => detailsModal.classList.add('show'), 10);
    }

    async function fetchServicios() {
        try {
            // Incluir servicios inactivos (soft delete) usando ?all=true
            const response = await fetch('http://localhost:3007/api/servicios?all=true');
            if (!response.ok) {
                throw new Error('Error al cargar los servicios');
            }
            const data = await response.json();
            // Manejar respuesta estandarizada { success: true, data: [...] }
            allServicios = (data.success && data.data) ? data.data : data;
            renderServicios(allServicios);
        } catch (error) {
            console.error('Error al cargar servicios:', error);
            const errorMessageRow = `<tr><td colspan="6" style="color: red; text-align: center;">Error al conectar con la API: ${error.message}</td></tr>`;
            activosBody.innerHTML = errorMessageRow;
            inactivosBody.innerHTML = errorMessageRow;
        }
    }

    function renderServicios(serviciosToRender) {
        activosBody.innerHTML = '';
        inactivosBody.innerHTML = '';
        
        if (serviciosToRender.length === 0) {
            noResults.style.display = 'block';
            return;
        }
        
        noResults.style.display = 'none';

        const serviciosActivos = serviciosToRender.filter(s => s.activo === 1 || s.activo === true || s.activo === '1');
        const serviciosInactivos = serviciosToRender.filter(s => s.activo === 0 || s.activo === false || s.activo === '0' || s.activo === null);

        serviciosActivos.forEach(servicio => createRow(servicio, activosBody));
        serviciosInactivos.forEach(servicio => createRow(servicio, inactivosBody));
    }

    function createRow(servicio, tbody) {
        const row = tbody.insertRow();
        
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
    }

    openAddModalBtn.addEventListener('click', () => {
        addModal.style.display = 'flex';
        addModal.classList.add('show');
        addServicioForm.reset();
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
        const servicio = allServicios.find(s => s.servicio_id == id);
        const isInactive = servicio && (servicio.activo === 0 || servicio.activo === false);
        const action = isInactive ? 'reactivar' : 'desactivar';
        
        if (!confirm(`¿Estás seguro de que quieres ${action} el servicio ID ${id}?`)) {
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
                    throw new Error(errorData.error || errorData.message || 'Error al reactivar el servicio');
                }

                alert('Servicio reactivado correctamente!');
            } else {
                // Desactivar: soft delete
                const response = await window.auth.fetchWithAuth(`${API_URL}/${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.message || 'Error al desactivar el servicio');
                }

                alert('Servicio desactivado correctamente!');
            }

            detailsModal.style.display = 'none'; 
            fetchServicios(); 

        } catch (error) {
            alert(`Error: ${error.message}`);
            console.error(`Error al ${action} servicio:`, error);
        }
    });

    // Event listener para eliminación definitiva
    const permanentDeleteBtn = document.getElementById('permanent-delete-servicio-btn');
    if (permanentDeleteBtn) {
        permanentDeleteBtn.addEventListener('click', async () => {
            const id = permanentDeleteBtn.dataset.id;
            
            // Confirmación con advertencia
            const confirmMessage = `⚠️ ADVERTENCIA: Esta acción NO se puede deshacer.\n\n` +
                `Estás a punto de eliminar definitivamente el servicio ID ${id}.\n\n` +
                `Esta acción eliminará permanentemente el servicio de la base de datos.\n\n` +
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
                    throw new Error(errorData.error || errorData.message || 'Error al eliminar definitivamente el servicio');
                }
                
                alert('Servicio eliminado definitivamente.');
                detailsModal.style.display = 'none';
                fetchServicios();
            } catch (error) {
                alert(`Error al eliminar definitivamente: ${error.message}`);
                console.error('Error al eliminar definitivamente servicio:', error);
            }
        });
    }

    window.filterServicios = function() {
        const filterText = filterInput.value.toLowerCase();
        const filteredServicios = allServicios.filter(servicio => {
            return servicio.descripcion.toLowerCase().includes(filterText);
        });
        renderServicios(filteredServicios);
    };

    fetchServicios();
});

