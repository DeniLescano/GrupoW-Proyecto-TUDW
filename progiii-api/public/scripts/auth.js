// Utilidades de autenticación para el frontend

const API_BASE_URL = 'http://localhost:3007/api/v1';

// Obtener token del localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Obtener usuario del localStorage
function getUsuario() {
    const usuarioStr = localStorage.getItem('usuario');
    return usuarioStr ? JSON.parse(usuarioStr) : null;
}

// Verificar si el usuario está autenticado
function isAuthenticated() {
    return getToken() !== null;
}

// Cerrar sesión
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '../login.html';
}

// Agregar token a las peticiones fetch
async function fetchWithAuth(url, options = {}) {
    const token = getToken();
    
    if (!token) {
        window.location.href = '../login.html';
        throw new Error('No autenticado');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    // Si la URL ya incluye http://, usar tal cual, sino agregar API_BASE_URL
    const fullUrl = url.startsWith('http://') ? url : `${API_BASE_URL}${url}`;
    
    const response = await fetch(fullUrl, {
        ...options,
        headers
    });

    // Si el token es inválido, redirigir al login
    if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error('Sesión expirada');
    }

    return response;
}

// Helper para obtener JSON de respuesta estandarizada
// Maneja automáticamente la estructura { success: true, data: ... }
async function fetchJSONWithAuth(url, options = {}) {
    const response = await fetchWithAuth(url, options);
    const data = await response.json();
    
    // Si la respuesta está en formato estandarizado (successResponse)
    if (data.success !== undefined) {
        if (!data.success) {
            // Si hay un error, lanzar excepción
            throw new Error(data.error || data.message || 'Error en la petición');
        }
        // Retornar solo los datos (data.data)
        return data.data;
    }
    
    // Si no está en formato estandarizado (compatibilidad con respuestas antiguas)
    return data;
}

// Verificar rol del usuario
function hasRole(...roles) {
    const usuario = getUsuario();
    if (!usuario) return false;

    // Mapeo de tipos: 1 = cliente, 2 = empleado, 3 = administrador
    const roleMap = {
        1: 'cliente',
        2: 'empleado',
        3: 'administrador'
    };

    const userRole = roleMap[usuario.tipo_usuario];
    return roles.includes(userRole);
}

// Verificar si es administrador
function isAdmin() {
    return hasRole('administrador');
}

// Verificar si es empleado
function isEmpleado() {
    return hasRole('empleado');
}

// Verificar si es cliente
function isCliente() {
    return hasRole('cliente');
}

// Middleware para proteger páginas
function requireAuth(allowedRoles = []) {
    if (!isAuthenticated()) {
        window.location.href = '../login.html';
        return false;
    }

    if (allowedRoles.length > 0 && !hasRole(...allowedRoles)) {
        alert('No tienes permisos para acceder a esta página');
        window.history.back();
        return false;
    }

    return true;
}

// Exportar funciones
window.auth = {
    getToken,
    getUsuario,
    isAuthenticated,
    logout,
    fetchWithAuth,
    fetchJSONWithAuth,
    hasRole,
    isAdmin,
    isEmpleado,
    isCliente,
    requireAuth
};

