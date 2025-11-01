document.addEventListener('DOMContentLoaded', () => {

    const API_URL = '/usuarios';
    
    // Verificar autenticación y permisos
    if (!window.auth || !window.auth.isAuthenticated() || !window.auth.isAdmin()) {
        window.location.href = '../login.html';
    }
    
    const activosBody = document.getElementById('usuarios-activos-body');
    const inactivosBody = document.getElementById('usuarios-inactivos-body');
    const filterInput = document.getElementById('filter-input-user');
    const noResultsMessage = document.getElementById('no-results-user');
    
    const addUserModal = document.getElementById('add-user-modal');
    const openAddUserModalBtn = document.getElementById('open-add-user-modal-btn');
    const closeAddUserModalBtn = document.querySelector('.close-add-user-modal');
    const addUserForm = document.getElementById('add-user-form');

    const detailsUserModal = document.getElementById('details-user-modal');
    const closeDetailsUserModalBtn = document.querySelector('.close-details-user-modal');
    const userDetailsView = document.getElementById('user-details-view');
    const editUserForm = document.getElementById('edit-user-form');
    const openEditUserFormBtn = document.getElementById('open-edit-user-form-btn');
    const cancelEditUserBtn = document.getElementById('cancel-edit-user-btn');
    const deleteUserBtn = document.getElementById('delete-user-btn');
    
    let allUsuarios = []; 

    function formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR') + ' ' + date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    }
    
    function getTipoUsuarioNombre(tipoUsuario) {
        const tipos = {
            1: 'Cliente',
            2: 'Empleado',
            3: 'Administrador'
        };
        return tipos[tipoUsuario] || `Tipo ${tipoUsuario}`;
    }
    
    function getLocalUserById(id) {
        return allUsuarios.find(u => u.usuario_id == id);
    }

    function showViewMode() {
        userDetailsView.style.display = 'block';
        editUserForm.style.display = 'none';
    }

    function openDetailsModal(user) {
        document.getElementById('view-id').textContent = user.usuario_id;
        document.getElementById('view-nombre').textContent = user.nombre;
        document.getElementById('view-apellido').textContent = user.apellido;
        document.getElementById('view-nombre-usuario').textContent = user.nombre_usuario;
        document.getElementById('view-tipo-usuario').textContent = getTipoUsuarioNombre(user.tipo_usuario);
        document.getElementById('view-celular').textContent = user.celular || '-';
        
        const activoText = user.activo === 1 ? '✅ Activado' : '❌ Desactivado';
        document.getElementById('view-activo').textContent = activoText;
        
        document.getElementById('view-creado').textContent = formatDate(user.creado);
        
        document.getElementById('edit-user-id').value = user.usuario_id;
        document.getElementById('edit-nombre').value = user.nombre;
        document.getElementById('edit-apellido').value = user.apellido;
        document.getElementById('edit-nombre-usuario').value = user.nombre_usuario;
        document.getElementById('edit-tipo-usuario').value = user.tipo_usuario;
        document.getElementById('edit-celular').value = user.celular || '';
        document.getElementById('edit-foto').value = user.foto || '';
        
        deleteUserBtn.dataset.id = user.usuario_id;
        
        // Verificar si es el usuario actual - prevenir auto-desactivación
        const currentUser = window.auth.getUsuario();
        const isCurrentUser = currentUser && currentUser.usuario_id == user.usuario_id;
        const selfDeactivateWarning = document.getElementById('self-deactivate-warning');
        
        if (isCurrentUser) {
            deleteUserBtn.disabled = true;
            deleteUserBtn.textContent = 'No puedes desactivar tu propio usuario';
            deleteUserBtn.style.opacity = '0.6';
            deleteUserBtn.style.cursor = 'not-allowed';
            if (selfDeactivateWarning) {
                selfDeactivateWarning.style.display = 'block';
            }
        } else {
            deleteUserBtn.disabled = false;
            deleteUserBtn.textContent = user.activo === 1 ? 'Desactivar Usuario' : 'Activar Usuario';
            deleteUserBtn.style.opacity = '1';
            deleteUserBtn.style.cursor = 'pointer';
            if (selfDeactivateWarning) {
                selfDeactivateWarning.style.display = 'none';
            }
        }

        showViewMode();
        detailsUserModal.style.display = 'flex';
    }

    function renderUsuarios(usuariosToRender) {
        activosBody.innerHTML = ''; 
        inactivosBody.innerHTML = ''; 
        
        const usuariosActivos = usuariosToRender.filter(u => u.activo === 1);
        const usuariosInactivos = usuariosToRender.filter(u => u.activo === 0);

        if (usuariosToRender.length === 0) {
            noResultsMessage.style.display = 'block';
        } else {
            noResultsMessage.style.display = 'none';
        }

        const currentUser = window.auth.getUsuario();
        const currentUserId = currentUser ? currentUser.usuario_id : null;

        const createRow = (user, tbody) => {
            const row = tbody.insertRow();
            
            // Resaltar usuario actual
            if (currentUserId && user.usuario_id == currentUserId) {
                row.classList.add('current-user-row');
                row.setAttribute('title', 'Este es tu usuario');
            }
            
            if (user.activo === 0) {
                row.classList.add('user-inactive-row');
            }

            // Agregar indicador visual para usuario actual en la primera celda
            const idCell = row.insertCell();
            if (currentUserId && user.usuario_id == currentUserId) {
                const badge = document.createElement('span');
                badge.textContent = 'TÚ';
                badge.className = 'current-user-badge';
                badge.style.cssText = 'background: #28a745; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.7rem; font-weight: bold; margin-right: 5px;';
                idCell.appendChild(badge);
            }
            idCell.appendChild(document.createTextNode(user.usuario_id));

            row.insertCell().textContent = `${user.nombre} ${user.apellido}`;
            row.insertCell().textContent = user.nombre_usuario;
            row.insertCell().textContent = getTipoUsuarioNombre(user.tipo_usuario);
            row.insertCell().textContent = user.celular || '-';
            row.insertCell().textContent = user.activo === 1 ? 'Activado' : 'Desactivado';
            row.insertCell().textContent = formatDate(user.creado);

            const actionsCell = row.insertCell();
            actionsCell.className = 'table-actions';
            
            const viewButton = document.createElement('button');
            viewButton.textContent = 'Ver / Editar';
            viewButton.className = 'edit-btn';
            viewButton.addEventListener('click', () => openDetailsModal(user));

            const toggleButton = document.createElement('button');
            const currentUser = window.auth.getUsuario();
            const isCurrentUser = currentUser && currentUser.usuario_id == user.usuario_id;
            
            if (user.activo === 1) {
                toggleButton.textContent = 'Desactivar';
                toggleButton.className = 'delete-btn';
            } else {
                toggleButton.textContent = 'Activar';
                toggleButton.className = 'activate-btn';
            }
            
            // Deshabilitar botón si es el usuario actual
            if (isCurrentUser && user.activo === 1) {
                toggleButton.disabled = true;
                toggleButton.style.opacity = '0.6';
                toggleButton.style.cursor = 'not-allowed';
                toggleButton.title = 'No puedes desactivar tu propio usuario';
            }
            
            toggleButton.addEventListener('click', () => toggleUserActivation(user.usuario_id, user.activo));
            
            actionsCell.appendChild(viewButton);
            actionsCell.appendChild(toggleButton);
        };
        
        usuariosActivos.forEach(user => createRow(user, activosBody));
        usuariosInactivos.forEach(user => createRow(user, inactivosBody));
    }

    async function fetchUsuarios() {
        try {
            const response = await window.auth.fetchWithAuth(API_URL);
            if (!response.ok) {
                throw new Error('Error al cargar los usuarios');
            }
            allUsuarios = await response.json(); 
            renderUsuarios(allUsuarios);

        } catch (error) {
            console.error('Fetch error:', error);
            const errorMessageRow = `<tr><td colspan="8" style="color: red; text-align: center;">Error al conectar con la API: ${error.message}</td></tr>`;
            activosBody.innerHTML = errorMessageRow;
            inactivosBody.innerHTML = errorMessageRow;
        }
    }

    async function toggleUserActivation(id, currentStatus) {
        const newStatus = currentStatus === 1 ? 0 : 1;
        const action = newStatus === 0 ? 'desactivar' : 'activar';
        
        // Verificar si es el usuario actual - prevenir auto-desactivación
        const currentUser = window.auth.getUsuario();
        if (currentUser && currentUser.usuario_id == id) {
            alert('No puedes desactivar tu propio usuario. Si necesitas hacerlo, contacta a otro administrador.');
            return;
        }
        
        if (!confirm(`¿Estás seguro de que quieres ${action} el usuario ID ${id}?`)) {
            return;
        }
        
        const user = getLocalUserById(id);
        if (!user) {
            alert(`Error: Usuario con ID ${id} no encontrado.`);
            return;
        }

        const dataToSend = {
            nombre: user.nombre,
            apellido: user.apellido,
            nombre_usuario: user.nombre_usuario,
            tipo_usuario: user.tipo_usuario,
            celular: user.celular || '',
            foto: user.foto || '',
            activo: newStatus
        };
        
        try {
            const response = await window.auth.fetchWithAuth(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error al ${action} el usuario`);
            }
            
            alert(`Usuario ${action} correctamente!`);
            detailsUserModal.style.display = 'none'; 
            fetchUsuarios(); 

        } catch (error) {
            alert(`Error al ${action}: ${error.message}`);
            console.error(`Error al ${action} usuario:`, error);
        }
    }
    
    window.filterUsuarios = function() {
        const filterText = filterInput.value.toLowerCase();
        
        const filteredUsuarios = allUsuarios.filter(user => {
            return user.nombre.toLowerCase().includes(filterText) || 
                   user.apellido.toLowerCase().includes(filterText) ||
                   user.nombre_usuario.toLowerCase().includes(filterText);
        });

        renderUsuarios(filteredUsuarios);
    }

    openAddUserModalBtn.addEventListener('click', () => {
        addUserModal.style.display = 'flex';
        addUserForm.reset(); 
    });

    closeAddUserModalBtn.addEventListener('click', () => {
        addUserModal.style.display = 'none';
    });

    closeDetailsUserModalBtn.addEventListener('click', () => {
        detailsUserModal.style.display = 'none';
        showViewMode(); 
    });

    window.addEventListener('click', (event) => {
        if (event.target === addUserModal) {
            addUserModal.style.display = 'none';
        }
        if (event.target === detailsUserModal) {
            detailsUserModal.style.display = 'none';
            showViewMode(); 
        }
    });
    
    openEditUserFormBtn.addEventListener('click', () => {
        userDetailsView.style.display = 'none';
        editUserForm.style.display = 'block';
    });

    cancelEditUserBtn.addEventListener('click', showViewMode);
    
    addUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const tipoUsuarioValue = document.getElementById('add-tipo-usuario').value;
        if (!tipoUsuarioValue) {
            alert('Por favor seleccione un tipo de usuario');
            return;
        }
        
        const newUser = {
            nombre: document.getElementById('add-nombre').value,
            apellido: document.getElementById('add-apellido').value,
            nombre_usuario: document.getElementById('add-nombre-usuario').value,
            contrasenia: document.getElementById('add-contrasenia').value,
            tipo_usuario: parseInt(tipoUsuarioValue),
            celular: document.getElementById('add-celular').value || null,
            foto: document.getElementById('add-foto').value || null,
        };

        try {
            const response = await window.auth.fetchWithAuth(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            });

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { message: `Error ${response.status}: ${response.statusText}` };
                }
                
                // Si hay errores de validación, mostrarlos
                if (errorData.details && Array.isArray(errorData.details)) {
                    const errorMessages = errorData.details.map(err => `${err.field}: ${err.message}`).join('\n');
                    throw new Error(`Errores de validación:\n${errorMessages}`);
                }
                
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    const errorMessages = errorData.errors.map(err => err.msg || err).join('\n');
                    throw new Error(errorMessages);
                }
                
                throw new Error(errorData.message || errorData.error || 'Error al crear el usuario');
            }

            alert('Usuario creado correctamente!');
            addUserModal.style.display = 'none';
            fetchUsuarios(); 

        } catch (error) {
            alert(`Error al agregar: ${error.message}`);
            console.error('Error al agregar usuario:', error);
        }
    });

    editUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('edit-user-id').value;
        const userActualizado = {
            nombre: document.getElementById('edit-nombre').value.trim(),
            apellido: document.getElementById('edit-apellido').value.trim(),
            nombre_usuario: document.getElementById('edit-nombre-usuario').value.trim(),
            tipo_usuario: parseInt(document.getElementById('edit-tipo-usuario').value),
            celular: document.getElementById('edit-celular').value.trim() || null,
            foto: document.getElementById('edit-foto').value.trim() || null,
            activo: 1
        };

        try {
            const response = await window.auth.fetchWithAuth(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userActualizado),
            });

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { message: `Error ${response.status}: ${response.statusText}` };
                }
                
                // Si hay errores de validación, mostrarlos
                if (errorData.details && Array.isArray(errorData.details)) {
                    const errorMessages = errorData.details.map(err => `${err.field}: ${err.message}`).join('\n');
                    throw new Error(`Errores de validación:\n${errorMessages}`);
                }
                
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    const errorMessages = errorData.errors.map(err => err.msg || err).join('\n');
                    throw new Error(errorMessages);
                }
                
                throw new Error(errorData.message || errorData.error || 'Error al actualizar el usuario');
            }

            alert('Usuario actualizado correctamente!');
            detailsUserModal.style.display = 'none'; 
            showViewMode(); 
            fetchUsuarios(); 

        } catch (error) {
            alert(`Error al actualizar: ${error.message}`);
            console.error('Error al actualizar usuario:', error);
        }
    });


    deleteUserBtn.addEventListener('click', async () => {
        const id = deleteUserBtn.dataset.id;
        const estadoTexto = document.getElementById('view-activo').textContent;
        const estadoActual = estadoTexto.includes('Activado') ? 1 : 0;
        
        toggleUserActivation(id, estadoActual);
    });


    fetchUsuarios();
});