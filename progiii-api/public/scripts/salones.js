document.addEventListener('DOMContentLoaded', () => {

    const cardsContainer = document.getElementById('salones-cards-container');
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

        showViewMode();
        detailsModal.style.display = 'flex';
    }

    function renderSalones(salonesToRender) {
        cardsContainer.innerHTML = ''; 

        if (salonesToRender.length === 0) {
            noResultsMessage.style.display = 'block';
            return;
        }

        noResultsMessage.style.display = 'none';

        salonesToRender.forEach(salon => {
            const card = document.createElement('div');
            card.className = 'salon-card';
            card.dataset.id = salon.salon_id; 

            card.innerHTML = `
                <h3 class="card-title">${salon.titulo}</h3>
                <p class="card-info"><strong>Dirección:</strong> ${salon.direccion}</p>
                <p class="card-info"><strong>Capacidad:</strong> ${salon.capacidad} personas</p>
                <p class="card-info"><strong>Importe:</strong> $${parseFloat(salon.importe).toFixed(2)}</p>
                <button class="view-btn" data-id="${salon.salon_id}">Modificar</button>
            `;

            card.querySelector('.view-btn').addEventListener('click', () => openDetailsModal(salon));

            cardsContainer.appendChild(card);
        });
    }


    async function fetchSalones() {
        try {
            // GET no necesita auth para ver salones activos
            const response = await fetch(`http://localhost:3007/api${API_URL}`);
            if (!response.ok) {
                throw new Error('Error al cargar los salones');
            }
            allSalones = await response.json(); 
            renderSalones(allSalones);

        } catch (error) {
            console.error('Fetch error:', error);
            cardsContainer.innerHTML = `<p style="color: red; text-align: center;">Error al conectar con la API: ${error.message}</p>`;
        }
    }

   
    
    openAddModalBtn.addEventListener('click', () => {
        addModal.style.display = 'flex';
        addSalonForm.reset(); 
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
        
        if (!confirm(`¿Estás seguro de que quieres eliminar (desactivar) el salón ID ${id}?`)) {
            return;
        }

        try {
            const response = await window.auth.fetchWithAuth(`${API_URL}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar el salón');
            }

            alert('Salón eliminado correctamente (Soft Delete)!');
            detailsModal.style.display = 'none'; 
            fetchSalones(); 

        } catch (error) {
            alert(`Error al eliminar: ${error.message}`);
            console.error('Error al eliminar salón:', error);
        }
    });


    fetchSalones();
});