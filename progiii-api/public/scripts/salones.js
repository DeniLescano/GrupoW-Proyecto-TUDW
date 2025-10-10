document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const cardsContainer = document.getElementById('salones-cards-container');
    const filterInput = document.getElementById('filter-input');
    const noResultsMessage = document.getElementById('no-results');
    
    // Modales de Creación (ADD)
    const addModal = document.getElementById('add-modal');
    const openAddModalBtn = document.getElementById('open-add-modal-btn');
    const closeAddModalBtn = document.querySelector('.close-add-modal');
    const addSalonForm = document.getElementById('add-salon-form');

    // Modales de Detalles/Edición (READ/EDIT/DELETE)
    const detailsModal = document.getElementById('details-modal');
    const closeDetailsModalBtn = document.querySelector('.close-details-modal');
    const salonDetailsView = document.getElementById('salon-details-view');
    const editSalonForm = document.getElementById('edit-salon-form');
    const openEditFormBtn = document.getElementById('open-edit-form-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const deleteSalonBtn = document.getElementById('delete-salon-btn');
    
    // Array para almacenar todos los salones obtenidos de la API
    let allSalones = []; 
    const API_URL = '/api/salones';

    // ------------------------------------------------------------------------
    // FUNCIONES DE CONTROL DE MODALES
    // ------------------------------------------------------------------------
    
    // Abre el modal de CREACIÓN
    openAddModalBtn.addEventListener('click', () => {
        addModal.style.display = 'flex';
        addSalonForm.reset(); // Asegura que el formulario esté limpio
    });

    // Cierra el modal de CREACIÓN
    closeAddModalBtn.addEventListener('click', () => {
        addModal.style.display = 'none';
    });

    // Cierra el modal de DETALLES/EDICIÓN
    closeDetailsModalBtn.addEventListener('click', () => {
        detailsModal.style.display = 'none';
        // Vuelve al modo "Ver Detalles" al cerrar
        showViewMode(); 
    });

    // Cierra el modal al hacer clic fuera
    window.addEventListener('click', (event) => {
        if (event.target === addModal) {
            addModal.style.display = 'none';
        }
        if (event.target === detailsModal) {
            detailsModal.style.display = 'none';
            showViewMode(); 
        }
    });

    // ------------------------------------------------------------------------
    // FUNCIÓN PRINCIPAL: BROWSE (Leer/Listar)
    // ------------------------------------------------------------------------
    async function fetchSalones() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Error al cargar los salones');
            }
            // Guarda los datos originales para el filtrado
            allSalones = await response.json(); 
            
            // Llama a la función de renderizado con todos los salones
            renderSalones(allSalones);

        } catch (error) {
            console.error('Fetch error:', error);
            cardsContainer.innerHTML = `<p style="color: red; text-align: center;">Error al conectar con la API: ${error.message}</p>`;
        }
    }

    // ------------------------------------------------------------------------
    // FUNCIÓN DE RENDERIZADO (Cards)
    // ------------------------------------------------------------------------
    function renderSalones(salonesToRender) {
        cardsContainer.innerHTML = ''; // Limpia el contenedor

        if (salonesToRender.length === 0) {
            noResultsMessage.style.display = 'block';
            return;
        }

        noResultsMessage.style.display = 'none';

        salonesToRender.forEach(salon => {
            const card = document.createElement('div');
            card.className = 'salon-card';
            card.dataset.id = salon.salon_id; // Útil para identificar la tarjeta

            card.innerHTML = `
                <h3 class="card-title">${salon.titulo}</h3>
                <p class="card-info"><strong>Dirección:</strong> ${salon.direccion}</p>
                <p class="card-info"><strong>Capacidad:</strong> ${salon.capacidad} personas</p>
                <p class="card-info"><strong>Importe:</strong> $${parseFloat(salon.importe).toFixed(2)}</p>
                <button class="view-btn" data-id="${salon.salon_id}">Modificar</button>
            `;

            // Añadir evento al botón "Modificar"
            card.querySelector('.view-btn').addEventListener('click', () => openDetailsModal(salon));

            cardsContainer.appendChild(card);
        });
    }

    // ------------------------------------------------------------------------
    // FUNCIÓN DE FILTRADO (BROWSE)
    // ------------------------------------------------------------------------
    window.filterSalones = function() {
        const filterText = filterInput.value.toLowerCase();
        
        // Filtra el array de salones guardado
        const filteredSalones = allSalones.filter(salon => {
            return salon.titulo.toLowerCase().includes(filterText) || 
                   salon.direccion.toLowerCase().includes(filterText);
        });

        renderSalones(filteredSalones);
    }
    
    // ------------------------------------------------------------------------
    // FUNCIÓN ADD: POST (Crear)
    // ------------------------------------------------------------------------
    addSalonForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nuevoSalon = {
            titulo: document.getElementById('add-titulo').value,
            direccion: document.getElementById('add-direccion').value,
            capacidad: parseInt(document.getElementById('add-capacidad').value),
            importe: parseFloat(document.getElementById('add-importe').value),
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoSalon),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear el salón');
            }

            alert('Salón creado correctamente!');
            addModal.style.display = 'none';
            fetchSalones(); // Recargar la lista

        } catch (error) {
            alert(`Error al agregar: ${error.message}`);
            console.error('Error al agregar salón:', error);
        }
    });

    // ------------------------------------------------------------------------
    // FUNCIÓN READ/EDIT/DELETE (Modal de Detalles/Acciones)
    // ------------------------------------------------------------------------

    // Muestra los detalles del salón en el modal
    function openDetailsModal(salon) {
        // 1. Rellena la vista de detalles
        document.getElementById('view-titulo').textContent = salon.titulo;
        document.getElementById('view-direccion').textContent = salon.direccion;
        document.getElementById('view-capacidad').textContent = salon.capacidad;
        document.getElementById('view-importe').textContent = `$${parseFloat(salon.importe).toFixed(2)}`;
        
        // 2. Rellena el formulario de edición (oculto)
        document.getElementById('edit-id').value = salon.salon_id;
        document.getElementById('edit-titulo').value = salon.titulo;
        document.getElementById('edit-direccion').value = salon.direccion;
        document.getElementById('edit-capacidad').value = salon.capacidad;
        document.getElementById('edit-importe').value = salon.importe;
        
        // 3. Establece el ID para el botón de eliminar
        deleteSalonBtn.dataset.id = salon.salon_id;

        // 4. Muestra el modal en modo "Ver"
        showViewMode();
        detailsModal.style.display = 'flex';
    }

    // Cambia el modal al modo de edición
    openEditFormBtn.addEventListener('click', () => {
        salonDetailsView.style.display = 'none';
        editSalonForm.style.display = 'block';
    });

    // Vuelve al modo de vista desde la edición
    cancelEditBtn.addEventListener('click', showViewMode);
    function showViewMode() {
        salonDetailsView.style.display = 'block';
        editSalonForm.style.display = 'none';
    }


    // ------------------------------------------------------------------------
    // FUNCIÓN EDIT: PUT (Actualizar)
    // ------------------------------------------------------------------------
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
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(salonActualizado),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar el salón');
            }

            alert('Salón actualizado correctamente!');
            detailsModal.style.display = 'none'; 
            showViewMode(); // Restablece la vista
            fetchSalones(); // Recarga la lista

        } catch (error) {
            alert(`Error al actualizar: ${error.message}`);
            console.error('Error al actualizar salón:', error);
        }
    });

    // ------------------------------------------------------------------------
    // FUNCIÓN DELETE: PUT (Soft Delete)
    // ------------------------------------------------------------------------
    deleteSalonBtn.addEventListener('click', async () => {
        const id = deleteSalonBtn.dataset.id;
        
        if (!confirm(`¿Estás seguro de que quieres eliminar (desactivar) el salón ID ${id}?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar el salón');
            }

            alert('Salón eliminado correctamente (Soft Delete)!');
            detailsModal.style.display = 'none'; 
            fetchSalones(); // Recarga la lista

        } catch (error) {
            alert(`Error al eliminar: ${error.message}`);
            console.error('Error al eliminar salón:', error);
        }
    });


    // ------------------------------------------------------------------------
    // EJECUCIÓN INICIAL
    // ------------------------------------------------------------------------
    fetchSalones();
});