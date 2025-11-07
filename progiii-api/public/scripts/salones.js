document.addEventListener('DOMContentLoaded', () => {

    const activosContainer = document.getElementById('salones-activos-container');
    const inactivosContainer = document.getElementById('salones-inactivos-container');
    const filterInput = document.getElementById('filter-input');
    const noResultsMessage = document.getElementById('no-results');
    
    const addModal = document.getElementById('add-modal');
    const openAddModalBtn = document.getElementById('open-add-modal-btn');
    const closeAddModalBtn = document.querySelector('.close-add-modal');
    const addSalonForm = document.getElementById('add-salon-form');

    const detailsModal = document.getElementById('details-modal');
    const closeDetailsModalBtn = document.querySelector('.close-details-modal');
    const salonDetailsView = document.getElementById('salon-details-view');
    const editSalonForm = document.getElementById('edit-salon-form');
    const openEditFormBtn = document.getElementById('open-edit-form-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const deleteSalonBtn = document.getElementById('delete-salon-btn');
    
    let allSalones = []; 
    const API_URL = '/salones';
    
    // Verificar autenticación y permisos
    if (!window.auth || !window.auth.isAuthenticated()) {
        window.location.href = '../login.html';
    }

  
    
    function showViewMode() {
        salonDetailsView.style.display = 'block';
        editSalonForm.style.display = 'none';
    }

    function openDetailsModal(salon) {
        document.getElementById('view-titulo').textContent = salon.titulo;
        document.getElementById('view-direccion').textContent = salon.direccion;
        document.getElementById('view-capacidad').textContent = salon.capacidad;
        document.getElementById('view-importe').textContent = `$${parseFloat(salon.importe).toFixed(2)}`;
        
        document.getElementById('edit-id').value = salon.salon_id;
        document.getElementById('edit-titulo').value = salon.titulo;
        document.getElementById('edit-direccion').value = salon.direccion;
        document.getElementById('edit-capacidad').value = salon.capacidad;
        document.getElementById('edit-importe').value = salon.importe;
        
        deleteSalonBtn.dataset.id = salon.salon_id;
        
        // Si el salón está desactivado, mostrar "Reactivar", si no "Desactivar"
        if (salon.activo === 0 || salon.activo === false) {
            deleteSalonBtn.textContent = 'Reactivar Salón';
            deleteSalonBtn.className = 'activate-btn';
        } else {
            deleteSalonBtn.textContent = 'Desactivar Salón';
            deleteSalonBtn.className = 'delete-btn';
        }
        
        // Mostrar/ocultar botón de eliminación definitiva solo para salones desactivados
        const permanentDeleteBtn = document.getElementById('permanent-delete-salon-btn');
        if (permanentDeleteBtn) {
            if (salon.activo === 0 || salon.activo === false) {
                permanentDeleteBtn.style.display = 'block';
                permanentDeleteBtn.dataset.id = salon.salon_id;
            } else {
                permanentDeleteBtn.style.display = 'none';
            }
        }

        showViewMode();
        detailsModal.style.display = 'flex';
        detailsModal.classList.add('show');
    }

    function renderSalones(salonesToRender) {
        activosContainer.innerHTML = '';
        inactivosContainer.innerHTML = '';

        if (salonesToRender.length === 0) {
            noResultsMessage.style.display = 'block';
            return;
        }

        noResultsMessage.style.display = 'none';

        const salonesActivos = salonesToRender.filter(s => s.activo === 1 || s.activo === true || s.activo === '1');
        const salonesInactivos = salonesToRender.filter(s => s.activo === 0 || s.activo === false || s.activo === '0' || s.activo === null);

        salonesActivos.forEach(salon => {
            const card = createSalonCard(salon);
            activosContainer.appendChild(card);
        });

        salonesInactivos.forEach(salon => {
            const card = createSalonCard(salon, true);
            inactivosContainer.appendChild(card);
        });
    }

    function createSalonCard(salon, isInactive = false) {
        const card = document.createElement('div');
        card.className = 'salon-card';
        if (isInactive) {
            card.classList.add('salon-inactive');
            card.style.opacity = '0.7';
            card.style.border = '2px solid #dc3545';
        }
        card.dataset.id = salon.salon_id; 

        card.innerHTML = `
            <h3 class="card-title">${salon.titulo}</h3>
            <p class="card-info"><strong>Dirección:</strong> ${salon.direccion}</p>
            <p class="card-info"><strong>Capacidad:</strong> ${salon.capacidad} personas</p>
            <p class="card-info"><strong>Importe:</strong> $${parseFloat(salon.importe).toFixed(2)}</p>
            <p class="card-info"><strong>Estado:</strong> ${isInactive ? '❌ Desactivado' : '✅ Activo'}</p>
            <button class="view-btn" data-id="${salon.salon_id}">Modificar</button>
        `;

        card.querySelector('.view-btn').addEventListener('click', () => openDetailsModal(salon));

        return card;
    }


    async function fetchSalones() {
        try {
            // Incluir salones inactivos (soft delete) usando ?all=true
            const response = await window.auth.fetchWithAuth(`${API_URL}?all=true`);
            if (!response.ok) {
                throw new Error('Error al cargar los salones');
            }
            const data = await response.json();
            
            // Manejar respuesta estandarizada { success: true, data: [...] }
            allSalones = (data.success && data.data) ? data.data : data;
            renderSalones(allSalones);

        } catch (error) {
            console.error('Fetch error:', error);
            activosContainer.innerHTML = `<p style="color: red; text-align: center;">Error al conectar con la API: ${error.message}</p>`;
            inactivosContainer.innerHTML = '';
        }
    }

   
    
    openAddModalBtn.addEventListener('click', () => {
        addModal.style.display = 'flex';
        addModal.classList.add('show');
        addSalonForm.reset(); 
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
        salonDetailsView.style.display = 'none';
        editSalonForm.style.display = 'block';
    });

    cancelEditBtn.addEventListener('click', showViewMode);
    
    window.filterSalones = function() {
        const filterText = filterInput.value.toLowerCase();
        
        const filteredSalones = allSalones.filter(salon => {
            return salon.titulo.toLowerCase().includes(filterText) || 
                   salon.direccion.toLowerCase().includes(filterText);
        });

        renderSalones(filteredSalones);
    }
    
    addSalonForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const titulo = document.getElementById('add-titulo').value.trim();
        const direccion = document.getElementById('add-direccion').value.trim();
        const capacidad = document.getElementById('add-capacidad').value;
        const importe = document.getElementById('add-importe').value;
        
        if (!titulo || !direccion || !capacidad || !importe) {
            alert('Todos los campos son obligatorios');
            return;
        }
        
        const nuevoSalon = {
            titulo: titulo,
            direccion: direccion,
            capacidad: parseInt(capacidad),
            importe: parseFloat(importe),
        };

        try {
            const response = await window.auth.fetchWithAuth(API_URL, {
                method: 'POST',
                body: JSON.stringify(nuevoSalon),
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
                
                throw new Error(errorData.message || errorData.error || 'Error al crear el salón');
            }

            alert('Salón creado correctamente!');
            addModal.style.display = 'none';
            fetchSalones(); 

        } catch (error) {
            alert(`Error al agregar: ${error.message}`);
            console.error('Error al agregar salón:', error);
        }
    });

    editSalonForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('edit-id').value;
        const salonActualizado = {
            titulo: document.getElementById('edit-titulo').value,
            direccion: document.getElementById('edit-direccion').value,
            capacidad: parseInt(document.getElementById('edit-capacidad').value),
            importe: parseFloat(document.getElementById('edit-importe').value),
        };

        try {
            const response = await window.auth.fetchWithAuth(`${API_URL}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(salonActualizado),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar el salón');
            }

            alert('Salón actualizado correctamente!');
            detailsModal.style.display = 'none'; 
            showViewMode(); 
            fetchSalones(); 

        } catch (error) {
            alert(`Error al actualizar: ${error.message}`);
            console.error('Error al actualizar salón:', error);
        }
    });


    deleteSalonBtn.addEventListener('click', async () => {
        const id = deleteSalonBtn.dataset.id;
        const salon = allSalones.find(s => s.salon_id == id);
        const isInactive = salon && (salon.activo === 0 || salon.activo === false);
        const action = isInactive ? 'reactivar' : 'desactivar';
        
        if (!confirm(`¿Estás seguro de que quieres ${action} el salón ID ${id}?`)) {
            return;
        }

        try {
            if (isInactive) {
                // Reactivar: actualizar activo = 1
                const response = await window.auth.fetchWithAuth(`${API_URL}/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        titulo: salon.titulo,
                        direccion: salon.direccion,
                        capacidad: salon.capacidad,
                        importe: salon.importe,
                        activo: 1
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.message || 'Error al reactivar el salón');
                }

                alert('Salón reactivado correctamente!');
            } else {
                // Desactivar: soft delete
                const response = await window.auth.fetchWithAuth(`${API_URL}/${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.message || 'Error al desactivar el salón');
                }

                alert('Salón desactivado correctamente!');
            }

            detailsModal.style.display = 'none'; 
            fetchSalones(); 

        } catch (error) {
            alert(`Error: ${error.message}`);
            console.error(`Error al ${action} salón:`, error);
        }
    });

    // Event listener para eliminación definitiva
    const permanentDeleteBtn = document.getElementById('permanent-delete-salon-btn');
    if (permanentDeleteBtn) {
        permanentDeleteBtn.addEventListener('click', async () => {
            const id = permanentDeleteBtn.dataset.id;
            
            // Confirmación con advertencia
            const confirmMessage = `⚠️ ADVERTENCIA: Esta acción NO se puede deshacer.\n\n` +
                `Estás a punto de eliminar definitivamente el salón ID ${id}.\n\n` +
                `Esta acción eliminará permanentemente el salón de la base de datos.\n\n` +
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
                    throw new Error(errorData.error || errorData.message || 'Error al eliminar definitivamente el salón');
                }
                
                alert('Salón eliminado definitivamente.');
                detailsModal.style.display = 'none';
                fetchSalones();
            } catch (error) {
                alert(`Error al eliminar definitivamente: ${error.message}`);
                console.error('Error al eliminar definitivamente salón:', error);
            }
        });
    }


    fetchSalones();
});