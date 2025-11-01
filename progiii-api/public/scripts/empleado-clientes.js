document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/usuarios';
    const clientesBody = document.getElementById('clientes-body');
    const noResults = document.getElementById('no-results');
    
    let allClientes = [];

    function formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR');
    }

    async function fetchClientes() {
        try {
            const response = await window.auth.fetchWithAuth(API_URL);
            if (!response.ok) {
                throw new Error('Error al cargar los clientes');
            }
            const usuarios = await response.json();
            // Filtrar solo clientes (tipo_usuario = 1)
            allClientes = usuarios.filter(u => u.tipo_usuario === 1);
            renderClientes(allClientes);
        } catch (error) {
            console.error('Error al cargar clientes:', error);
            clientesBody.innerHTML = `<tr><td colspan="7" style="color: red; text-align: center;">Error al conectar con la API: ${error.message}</td></tr>`;
        }
    }

    function renderClientes(clientesToRender) {
        clientesBody.innerHTML = '';
        
        if (clientesToRender.length === 0) {
            noResults.style.display = 'block';
            return;
        }
        
        noResults.style.display = 'none';

        const sortedClientes = [...clientesToRender].sort((a, b) => {
            const dateA = new Date(a.creado || 0);
            const dateB = new Date(b.creado || 0);
            return dateB - dateA;
        });

        sortedClientes.forEach(cliente => {
            const row = clientesBody.insertRow();
            
            if (cliente.activo === 0 || cliente.activo === false) {
                row.classList.add('user-inactive-row');
            }

            row.insertCell().textContent = cliente.usuario_id;
            row.insertCell().textContent = `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim() || '-';
            row.insertCell().textContent = cliente.nombre_usuario || '-';
            row.insertCell().textContent = cliente.celular || '-';
            row.insertCell().textContent = (cliente.activo === 1 || cliente.activo === true) ? 'Activo' : 'Inactivo';
            
            // TODO: Agregar conteo de reservas cuando tengamos la funcionalidad
            row.insertCell().textContent = '-';
            
            row.insertCell().textContent = formatDate(cliente.creado);
        });
    }

    window.filterClientes = function() {
        const filterText = document.getElementById('filter-input').value.toLowerCase();
        const filteredClientes = allClientes.filter(cliente => {
            const nombreCompleto = `${cliente.nombre || ''} ${cliente.apellido || ''}`.toLowerCase();
            return nombreCompleto.includes(filterText) ||
                   (cliente.nombre_usuario && cliente.nombre_usuario.toLowerCase().includes(filterText));
        });
        renderClientes(filteredClientes);
    };

    fetchClientes();
});

