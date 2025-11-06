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
function logout(redirectToIndex = false) {
    // Detener detección de inactividad
    stopInactivityDetection();
    
    // Cerrar modal de advertencia si está abierto
    closeExpirationWarningModal();
    
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    
    // Redirigir
    if (redirectToIndex) {
        window.location.href = '../index.html';
    } else {
        window.location.href = '../login.html';
    }
}

// Decodificar JWT sin verificar (solo para obtener datos)
function decodeToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null;
    }
}

// Verificar si el token está expirado
function isTokenExpired(token) {
    if (!token) return true;
    
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    // exp está en segundos, Date.now() está en milisegundos
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    
    return currentTime >= expirationTime;
}

// Verificar si el token está cerca de expirar (menos de 5 minutos)
function isTokenExpiringSoon(token) {
    if (!token) return true;
    
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutos en milisegundos
    
    return (expirationTime - currentTime) < fiveMinutes;
}

// Verificar y manejar expiración del token
function checkTokenExpiration() {
    const token = getToken();
    
    if (!token) {
        // No hay token, redirigir a index
        logout(true);
        return false;
    }
    
    if (isTokenExpired(token)) {
        // Token expirado, limpiar y redirigir a index
        console.warn('Token expirado. Redirigiendo a página inicial...');
        logout(true);
        return false;
    }
    
    return true;
}

// Agregar token a las peticiones fetch
async function fetchWithAuth(url, options = {}) {
    const token = getToken();
    
    // Verificar si el token existe y no está expirado antes de hacer la petición
    if (!token || isTokenExpired(token)) {
        console.warn('Token no válido o expirado. Redirigiendo a página inicial...');
        logout(true);
        throw new Error('Sesión expirada');
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

    // Si el token es inválido o expirado, redirigir a index
    if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({ message: 'Token inválido o expirado' }));
        console.warn('Token inválido o expirado:', errorData.message);
        logout(true); // Redirigir a index.html cuando la sesión expira
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
    const token = getToken();
    
    // Verificar si hay token y si no está expirado
    if (!token || isTokenExpired(token)) {
        console.warn('Token no válido o expirado. Redirigiendo a página inicial...');
        logout(true);
        return false;
    }

    if (allowedRoles.length > 0 && !hasRole(...allowedRoles)) {
        alert('No tienes permisos para acceder a esta página');
        window.history.back();
        return false;
    }

    return true;
}

// ============================================
// SISTEMA DE DETECCIÓN DE INACTIVIDAD
// ============================================

let inactivityTimer = null;
let warningTimer = null;
let lastActivityTime = Date.now();
let warningModalShown = false;

// Tiempos en milisegundos
const INACTIVITY_WARNING_TIME = 14 * 60 * 1000; // 14 minutos
const INACTIVITY_EXPIRATION_TIME = 15 * 60 * 1000; // 15 minutos

// Eventos que indican actividad del usuario
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

// Reiniciar el temporizador de inactividad
function resetInactivityTimer() {
    lastActivityTime = Date.now();
    warningModalShown = false;
    
    // Limpiar timers anteriores
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
    if (warningTimer) {
        clearTimeout(warningTimer);
    }
    
    // Cerrar modal de advertencia si está abierto
    closeExpirationWarningModal();
    
    // Establecer timer para mostrar advertencia (14 minutos)
    warningTimer = setTimeout(() => {
        if (getToken() && !isTokenExpired(getToken())) {
            showExpirationWarningModal();
        }
    }, INACTIVITY_WARNING_TIME);
    
    // Establecer timer para expiración completa (15 minutos)
    inactivityTimer = setTimeout(() => {
        if (getToken()) {
            console.warn('Sesión expirada por inactividad. Redirigiendo...');
            logout(true);
        }
    }, INACTIVITY_EXPIRATION_TIME);
}

// Inicializar detección de inactividad
function initInactivityDetection() {
    if (!getToken()) return;
    
    // Reiniciar timer al inicio
    resetInactivityTimer();
    
    // Agregar listeners para eventos de actividad
    ACTIVITY_EVENTS.forEach(event => {
        document.addEventListener(event, resetInactivityTimer, { passive: true });
    });
    
    // También detectar actividad en ventana (cuando el usuario vuelve a la pestaña)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && getToken()) {
            resetInactivityTimer();
        }
    });
}

// Detener detección de inactividad
function stopInactivityDetection() {
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }
    if (warningTimer) {
        clearTimeout(warningTimer);
        warningTimer = null;
    }
    
    ACTIVITY_EVENTS.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer);
    });
}

// Mostrar modal de advertencia de expiración
function showExpirationWarningModal() {
    if (warningModalShown) return;
    
    warningModalShown = true;
    
    // Crear modal si no existe
    let modal = document.getElementById('expiration-warning-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'expiration-warning-modal';
        modal.className = 'modal expiration-modal';
        modal.innerHTML = `
            <div class="modal-content expiration-modal-content" style="max-width: 500px; text-align: center;">
                <div style="padding: 30px;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">⏰</div>
                    <h2 style="margin-bottom: 15px; color: #ff6b6b;">Sesión por expirar</h2>
                    <p style="margin-bottom: 25px; font-size: 1.1rem; color: #555;">
                        Tu sesión está por expirar debido a inactividad. 
                        ¿Deseas continuar en la página?
                    </p>
                    <div style="display: flex; gap: 15px; justify-content: center;">
                        <button id="continue-session-btn" class="add-btn" style="padding: 12px 30px; font-size: 1rem;">
                            Continuar
                        </button>
                        <button id="logout-session-btn" class="cancel-btn" style="padding: 12px 30px; font-size: 1rem;">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Event listeners para los botones
        document.getElementById('continue-session-btn').addEventListener('click', () => {
            continueSession();
        });
        
        document.getElementById('logout-session-btn').addEventListener('click', () => {
            logout(false); // Redirigir a login
        });
        
        // Cerrar al hacer clic fuera del modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                continueSession(); // Si hace clic fuera, continuar sesión
            }
        });
    }
    
    // Mostrar modal con animación
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// Cerrar modal de advertencia
function closeExpirationWarningModal() {
    const modal = document.getElementById('expiration-warning-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// Continuar sesión (renovar actividad)
async function continueSession() {
    closeExpirationWarningModal();
    
    // Reiniciar timer de inactividad
    resetInactivityTimer();
    
    // Opcionalmente, verificar token con el servidor
    try {
        const token = getToken();
        if (token && !isTokenExpired(token)) {
            // El token aún es válido, solo reiniciar inactividad
            console.log('Sesión extendida. Continuando en la página...');
        } else {
            // Token expirado, redirigir
            logout(true);
        }
    } catch (error) {
        console.error('Error al verificar sesión:', error);
        logout(true);
    }
}

// Verificar token al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Solo verificar si hay un token almacenado
    if (getToken()) {
        checkTokenExpiration();
        
        // Inicializar detección de inactividad
        initInactivityDetection();
        
        // Verificar periódicamente cada 30 segundos (para detectar expiración del token mismo)
        setInterval(() => {
            if (getToken()) {
                checkTokenExpiration();
            } else {
                stopInactivityDetection();
            }
        }, 30000); // Cada 30 segundos
    }
});

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
    requireAuth,
    checkTokenExpiration,
    isTokenExpired,
    isTokenExpiringSoon,
    decodeToken
};

