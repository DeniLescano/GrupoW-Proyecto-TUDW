// ============================================
// Utilidades de autenticación para el frontend
// ============================================

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
    stopInactivityDetection();
    closeExpirationWarningModal();
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

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
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
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

    const expirationTime = decoded.exp * 1000; // segundos -> ms
    return Date.now() >= expirationTime;
}

// Verificar si el token está por expirar (menos de 5 minutos)
function isTokenExpiringSoon(token) {
    if (!token) return true;
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const expirationTime = decoded.exp * 1000;
    return (expirationTime - Date.now()) < 5 * 60 * 1000;
}

// Verificar y manejar expiración del token
function checkTokenExpiration() {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
        console.warn('Token expirado o no válido. Redirigiendo...');
        logout(true);
        return false;
    }
    return true;
}

// Hacer fetch con autenticación
async function fetchWithAuth(url, options = {}) {
    const token = getToken();

    if (!token || isTokenExpired(token)) {
        console.warn('Token no válido o expirado. Redirigiendo...');
        logout(true);
        throw new Error('Sesión expirada');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    const fullUrl = url.startsWith('http://') ? url : `${API_BASE_URL}${url}`;

    const response = await fetch(fullUrl, {
        ...options,
        headers
    });

    if (response.status === 401 || response.status === 403) {
        const errorData = await response.json().catch(() => ({ message: 'Token inválido o expirado' }));
        console.warn('Token inválido o expirado:', errorData.message);
        logout(true);
        throw new Error('Sesión expirada');
    }

    return response;
}

// Fetch JSON estandarizado con autenticación
async function fetchJSONWithAuth(url, options = {}) {
    const response = await fetchWithAuth(url, options);
    const data = await response.json();

    if (data.success !== undefined) {
        if (!data.success) throw new Error(data.error || data.message || 'Error en la petición');
        return data.data;
    }

    return data;
}

// Verificar rol del usuario
function hasRole(...roles) {
    const usuario = getUsuario();
    if (!usuario) return false;

    const roleMap = { 1: 'cliente', 2: 'empleado', 3: 'administrador' };
    const userRole = roleMap[usuario.tipo_usuario];
    return roles.includes(userRole);
}

function isAdmin() { return hasRole('administrador'); }
function isEmpleado() { return hasRole('empleado'); }
function isCliente() { return hasRole('cliente'); }

// Middleware para proteger páginas
function requireAuth(allowedRoles = []) {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
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
// Sistema de detección de inactividad
// ============================================

let inactivityTimer = null;
let warningTimer = null;
let lastActivityTime = Date.now();
let warningModalShown = false;

const INACTIVITY_WARNING_TIME = 14 * 60 * 1000;
const INACTIVITY_EXPIRATION_TIME = 15 * 60 * 1000;
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

function resetInactivityTimer() {
    lastActivityTime = Date.now();
    warningModalShown = false;

    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (warningTimer) clearTimeout(warningTimer);

    closeExpirationWarningModal();

    warningTimer = setTimeout(() => {
        if (getToken() && !isTokenExpired(getToken())) showExpirationWarningModal();
    }, INACTIVITY_WARNING_TIME);

    inactivityTimer = setTimeout(() => {
        if (getToken()) {
            console.warn('Sesión expirada por inactividad');
            logout(true);
        }
    }, INACTIVITY_EXPIRATION_TIME);
}

function initInactivityDetection() {
    if (!getToken()) return;
    resetInactivityTimer();
    ACTIVITY_EVENTS.forEach(event => document.addEventListener(event, resetInactivityTimer, { passive: true }));
    document.addEventListener('visibilitychange', () => { if (!document.hidden && getToken()) resetInactivityTimer(); });
}

function stopInactivityDetection() {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (warningTimer) clearTimeout(warningTimer);
    ACTIVITY_EVENTS.forEach(event => document.removeEventListener(event, resetInactivityTimer));
}

// Modal de advertencia
function showExpirationWarningModal() {
    if (warningModalShown) return;
    warningModalShown = true;

    let modal = document.getElementById('expiration-warning-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'expiration-warning-modal';
        modal.className = 'modal expiration-modal';
        modal.innerHTML = `
            <div class="modal-content expiration-modal-content" style="max-width:500px;text-align:center;">
                <div style="padding:30px;">
                    <div style="font-size:4rem;margin-bottom:20px;">⏰</div>
                    <h2 style="margin-bottom:15px;color:#ff6b6b;">Sesión por expirar</h2>
                    <p style="margin-bottom:25px;font-size:1.1rem;color:#555;">
                        Tu sesión está por expirar debido a inactividad. 
                        ¿Deseas continuar en la página?
                    </p>
                    <div style="display:flex;gap:15px;justify-content:center;">
                        <button id="continue-session-btn" class="add-btn" style="padding:12px 30px;font-size:1rem;">Continuar</button>
                        <button id="logout-session-btn" class="cancel-btn" style="padding:12px 30px;font-size:1rem;">Cerrar Sesión</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('continue-session-btn').addEventListener('click', continueSession);
        document.getElementById('logout-session-btn').addEventListener('click', () => logout(false));
        modal.addEventListener('click', e => { if (e.target === modal) continueSession(); });
    }

    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
}

function closeExpirationWarningModal() {
    const modal = document.getElementById('expiration-warning-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    }
}

async function continueSession() {
    closeExpirationWarningModal();
    resetInactivityTimer();

    const token = getToken();
    if (!token || isTokenExpired(token)) logout(true);
    else console.log('Sesión extendida.');
}

// Inicializar al cargar página
document.addEventListener('DOMContentLoaded', () => {
    if (getToken()) {
        checkTokenExpiration();
        initInactivityDetection();
        setInterval(() => { if (getToken()) checkTokenExpiration(); else stopInactivityDetection(); }, 30000);
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
