// Sidebar mejorado con iconos SVG profesionales
// Evitar ejecución duplicada
if (window.sidebarInitialized) {
    // Ya se inicializó, no hacer nada
} else {
    window.sidebarInitialized = true;
    
    // Función para inicializar el sidebar
    function initSidebarOnLoad() {
        // Esperar a que los iconos estén cargados
        if (!window.Icons) {
            // Si los iconos no están disponibles, esperar un poco más
            setTimeout(initSidebarOnLoad, 100);
            return;
        }
        
        // Crear sidebar
        createSidebar();
    }
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSidebarOnLoad);
    } else {
        // DOM ya está listo
        initSidebarOnLoad();
    }
}

function createSidebar() {
    // Esperar a que el body esté disponible
    if (!document.body) {
        setTimeout(createSidebar, 50);
        return;
    }
    
    // Verificar si el sidebar ya existe
    if (document.getElementById('main-sidebar')) {
        return;
    }
    
    // Detectar rol del usuario
    const userRole = getUserRole();
    const currentPage = getCurrentPage();
    
    // Crear sidebar según el rol
    let sidebarHTML = '';
    if (userRole === 'administrador') {
        sidebarHTML = createAdminSidebar(currentPage);
    } else if (userRole === 'empleado') {
        sidebarHTML = createEmployeeSidebar(currentPage);
    } else if (userRole === 'cliente') {
        sidebarHTML = createClientSidebar(currentPage);
    } else {
        // Si no hay rol, no crear sidebar
        return;
    }
    
    // Insertar sidebar al inicio del body
    const sidebarDiv = document.createElement('div');
    sidebarDiv.innerHTML = sidebarHTML;
    const sidebar = sidebarDiv.firstElementChild;
    
    // Insertar antes del primer elemento del body
    if (document.body.firstChild) {
        document.body.insertBefore(sidebar, document.body.firstChild);
    } else {
        document.body.appendChild(sidebar);
    }
    
    // También insertar el overlay
    const overlay = sidebarDiv.children[1];
    if (overlay) {
        document.body.appendChild(overlay);
    }
    
    // Inicializar funcionalidad después de un pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => {
        initSidebar();
    }, 10);
}

function createAdminSidebar(currentPage) {
    // Función helper para construir rutas relativas correctas desde cualquier ubicación
    function getRelativePath(targetFile) {
        const currentPath = window.location.pathname;
        
        // Limpiar el pathname (remover /public si existe)
        const cleanPath = currentPath.replace(/^\/public/, '');
        
        // Detectar si estamos en /administrador/ o en la raíz
        const isInAdminFolder = cleanPath.includes('/administrador/');
        const isInEmployeeFolder = cleanPath.includes('/empleado/');
        const isInClientFolder = cleanPath.includes('/cliente/');
        
        // Determinar el directorio actual
        let currentDir = '';
        if (isInAdminFolder) {
            currentDir = 'administrador';
        } else if (isInEmployeeFolder) {
            currentDir = 'empleado';
        } else if (isInClientFolder) {
            currentDir = 'cliente';
        }
        
        // Construir rutas relativas según el directorio actual
        if (currentDir === 'administrador') {
            // Estamos en /administrador/
            if (targetFile.startsWith('administrador/')) {
                // Archivo en administrador/ (misma carpeta)
                return targetFile.replace('administrador/', '');
            } else if (targetFile.startsWith('empleado/')) {
                // Archivo en empleado/ (subir y entrar)
                return '../' + targetFile;
            } else {
                // Archivo en raíz (subir un nivel)
                return '../' + targetFile;
            }
        } else if (currentDir === 'empleado') {
            // Estamos en /empleado/ (pero somos administradores)
            if (targetFile.startsWith('administrador/')) {
                // Archivo en administrador/ (subir y entrar)
                return '../' + targetFile;
            } else if (targetFile.startsWith('empleado/')) {
                // Archivo en empleado/ (misma carpeta)
                return targetFile.replace('empleado/', '');
            } else {
                // Archivo en raíz (subir un nivel)
                return '../' + targetFile;
            }
        } else {
            // Estamos en la raíz (/)
            return targetFile;
        }
    }
    
    // Construir todas las rutas
    const inicioPath = getRelativePath('index.html');
    const salonesPath = getRelativePath('salones.html');
    const usuariosPath = getRelativePath('usuarios.html');
    const informesSalonesPath = getRelativePath('informes-salones.html');
    const informesUsuariosPath = getRelativePath('informes-usuarios.html');
    const serviciosPath = getRelativePath('empleado/servicios.html');
    const turnosPath = getRelativePath('empleado/turnos.html');
    const reservasPath = getRelativePath('administrador/reservas.html');
    const reportesReservasPath = getRelativePath('administrador/reportes-reservas.html');
    const loginPath = getRelativePath('login.html');
    
    return `
        <aside class="sidebar" id="main-sidebar">
            <div class="sidebar-header">
                <div class="sidebar-logo">
                    <span class="sidebar-icon">${window.Icons?.building || '🏢'}</span>
                    <span class="sidebar-logo-text">Sistema Reservas</span>
                </div>
                <button class="sidebar-toggle" id="sidebar-toggle" aria-label="Toggle sidebar">
                    ${window.Icons?.chevronLeft || '◀'}
                </button>
            </div>
            
            <ul class="sidebar-menu">
                <li class="sidebar-menu-item">
                    <a href="../index.html" class="sidebar-menu-link ${currentPage === 'index' ? 'active' : ''}">
                        <span class="sidebar-menu-icon">${window.Icons?.home || '🏠'}</span>
                        <span class="sidebar-menu-text">Inicio</span>
                    </a>
                </li>
                
                <li class="sidebar-divider"></li>
                <li class="sidebar-menu-header">
                    <span class="sidebar-menu-text" style="font-weight: 600; color: rgba(255,255,255,0.8); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;">GESTIÓN</span>
                </li>
                <li class="sidebar-divider"></li>
                
                <li class="sidebar-menu-item">
                    <a href="${salonesPath}" class="sidebar-menu-link ${currentPage === 'salones' ? 'active' : ''}">
                        <span class="sidebar-menu-icon">${window.Icons?.building || '🏢'}</span>
                        <span class="sidebar-menu-text">Gestión de Salones</span>
                    </a>
                </li>
                
                <li class="sidebar-menu-item">
                    <a href="${serviciosPath}" class="sidebar-menu-link ${currentPage === 'servicios' ? 'active' : ''}">
                        <span class="sidebar-menu-icon">${window.Icons?.sparkles || '🎉'}</span>
                        <span class="sidebar-menu-text">Gestión de Servicios</span>
                    </a>
                </li>
                
                <li class="sidebar-menu-item">
                    <a href="${turnosPath}" class="sidebar-menu-link ${currentPage === 'turnos' ? 'active' : ''}">
                        <span class="sidebar-menu-icon">${window.Icons?.clock || '⏰'}</span>
                        <span class="sidebar-menu-text">Gestión de Turnos</span>
                    </a>
                </li>
                
                <li class="sidebar-menu-item">
                    <a href="${reservasPath}" class="sidebar-menu-link ${currentPage === 'reservas' ? 'active' : ''}">
                        <span class="sidebar-menu-icon">${window.Icons?.calendar || '📅'}</span>
                        <span class="sidebar-menu-text">Gestión de Reservas</span>
                    </a>
                </li>
                
                <li class="sidebar-menu-item">
                    <a href="${usuariosPath}" class="sidebar-menu-link ${currentPage === 'usuarios' ? 'active' : ''}">
                        <span class="sidebar-menu-icon">${window.Icons?.users || '👥'}</span>
                        <span class="sidebar-menu-text">Gestión de Usuarios</span>
                    </a>
                </li>
                
                <li class="sidebar-divider"></li>
                <li class="sidebar-menu-header">
                    <span class="sidebar-menu-text" style="font-weight: 600; color: rgba(255,255,255,0.8); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;">INFORMES</span>
                </li>
                <li class="sidebar-divider"></li>
                
                <li class="sidebar-menu-item">
                    <a href="${informesSalonesPath}" class="sidebar-menu-link ${currentPage === 'informes-salones' ? 'active' : ''}">
                        <span class="sidebar-menu-icon">${window.Icons?.barChart || '📊'}</span>
                        <span class="sidebar-menu-text">Informes de Salones</span>
                    </a>
                </li>
                
                <li class="sidebar-menu-item">
                    <a href="${informesUsuariosPath}" class="sidebar-menu-link ${currentPage === 'informes-usuarios' ? 'active' : ''}">
                        <span class="sidebar-menu-icon">${window.Icons?.barChart || '📈'}</span>
                        <span class="sidebar-menu-text">Informes de Usuarios</span>
                    </a>
                </li>
                
                <li class="sidebar-menu-item">
                    <a href="${reportesReservasPath}" class="sidebar-menu-link ${currentPage === 'reportes-reservas' ? 'active' : ''}">
                        <span class="sidebar-menu-icon">${window.Icons?.fileText || '📋'}</span>
                        <span class="sidebar-menu-text">Informes de Reservas</span>
                    </a>
                </li>
                
                <li class="sidebar-divider"></li>
                
                <li class="sidebar-menu-item">
                    <a href="${loginPath}" class="sidebar-menu-link" id="logout-link">
                        <span class="sidebar-menu-icon">${window.Icons?.logOut || '🚪'}</span>
                        <span class="sidebar-menu-text">Cerrar Sesión</span>
                    </a>
                </li>
            </ul>
            
            <div class="sidebar-footer">
                <span class="sidebar-footer-text">© 2024 Sistema de Reservas</span>
            </div>
        </aside>
        <div class="sidebar-overlay" id="sidebar-overlay"></div>
    `;
}

function createEmployeeSidebar(currentPage) {
    const basePath = window.location.pathname.includes('/empleado/') ? '' : 'empleado/';
    return `
        <aside class="sidebar" id="main-sidebar">
            <div class="sidebar-header">
                <div class="sidebar-logo">
                    <span class="sidebar-icon">${window.Icons?.building || '🏢'}</span>
                    <span class="sidebar-logo-text">Sistema Reservas</span>
                </div>
                <button class="sidebar-toggle" id="sidebar-toggle" aria-label="Toggle sidebar">
                    ${window.Icons?.chevronLeft || '◀'}
                </button>
            </div>
            
            <ul class="sidebar-menu">
                <li class="sidebar-menu-item">
                    <a href="../index.html" class="sidebar-menu-link ${currentPage === 'index' ? 'active' : ''}">
                        <span class="sidebar-menu-icon">${window.Icons?.home || '🏠'}</span>
                        <span class="sidebar-menu-text">Inicio</span>
                    </a>
                </li>
                
                <li class="sidebar-divider"></li>
                <li class="sidebar-menu-header">
                    <span class="sidebar-menu-text" style="font-weight: 600; color: rgba(255,255,255,0.8); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;">CONSULTAS</span>
                </li>
                <li class="sidebar-divider"></li>
                
                <li class="sidebar-menu-item">
                    <a href="${basePath}reservas.html" class="sidebar-menu-link ${currentPage === 'reservas' ? 'active' : ''}">
                        <span class="sidebar-menu-icon">${window.Icons?.calendar || '📅'}</span>
                        <span class="sidebar-menu-text">Listar Reservas</span>
                    </a>
                </li>
                
                <li class="sidebar-menu-item">
                    <a href="${basePath}clientes.html" class="sidebar-menu-link ${currentPage === 'clientes' ? 'active' : ''}">
                        <span class="sidebar-menu-icon">${window.Icons?.users || '👥'}</span>
                        <span class="sidebar-menu-text">Listar Clientes</span>
                    </a>
                </li>
                
                <li class="sidebar-divider"></li>
                <li class="sidebar-menu-header">
                    <span class="sidebar-menu-text" style="font-weight: 600; color: rgba(255,255,255,0.8); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;">GESTIÓN</span>
                </li>
                <li class="sidebar-divider"></li>
                
                <li class="sidebar-menu-item">
                    <a href="../salones.html" class="sidebar-menu-link ${currentPage === 'salones' ? 'active' : ''}">
                        <span class="sidebar-menu-icon">${window.Icons?.building || '🏢'}</span>
                        <span class="sidebar-menu-text">Gestión de Salones</span>
                    </a>
                </li>
                
                <li class="sidebar-menu-item">
                    <a href="${basePath}servicios.html" class="sidebar-menu-link ${currentPage === 'servicios' ? 'active' : ''}">
                        <span class="sidebar-menu-icon">${window.Icons?.sparkles || '🎉'}</span>
                        <span class="sidebar-menu-text">Gestión de Servicios</span>
                    </a>
                </li>
                
                <li class="sidebar-menu-item">
                    <a href="${basePath}turnos.html" class="sidebar-menu-link ${currentPage === 'turnos' ? 'active' : ''}">
                        <span class="sidebar-menu-icon">${window.Icons?.clock || '⏰'}</span>
                        <span class="sidebar-menu-text">Gestión de Turnos</span>
                    </a>
                </li>
                
                <li class="sidebar-divider"></li>
                
                <li class="sidebar-menu-item">
                    <a href="../login.html" class="sidebar-menu-link" id="logout-link">
                        <span class="sidebar-menu-icon">${window.Icons?.logOut || '🚪'}</span>
                        <span class="sidebar-menu-text">Cerrar Sesión</span>
                    </a>
                </li>
            </ul>
            
            <div class="sidebar-footer">
                <span class="sidebar-footer-text">© 2024 Sistema de Reservas</span>
            </div>
        </aside>
        <div class="sidebar-overlay" id="sidebar-overlay"></div>
    `;
}

function createClientSidebar(currentPage) {
    const basePath = window.location.pathname.includes('/cliente/') ? '' : 'cliente/';
    return `
        <aside class="sidebar" id="main-sidebar">
            <div class="sidebar-header">
                <div class="sidebar-logo">
                    <span class="sidebar-icon">${window.Icons?.building || '🏢'}</span>
                    <span class="sidebar-logo-text">Sistema Reservas</span>
                </div>
                <button class="sidebar-toggle" id="sidebar-toggle" aria-label="Toggle sidebar">
                    ${window.Icons?.chevronLeft || '◀'}
                </button>
            </div>
            
            <ul class="sidebar-menu">
                <li class="sidebar-menu-item">
                    <a href="../index.html" class="sidebar-menu-link ${currentPage === 'index' ? 'active' : ''}">
                        <span class="sidebar-menu-icon">${window.Icons?.home || '🏠'}</span>
                        <span class="sidebar-menu-text">Inicio</span>
                    </a>
                </li>
                
                <li class="sidebar-divider"></li>
                <li class="sidebar-menu-header">
                    <span class="sidebar-menu-text" style="font-weight: 600; color: rgba(255,255,255,0.8); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;">MIS RESERVAS</span>
                </li>
                <li class="sidebar-divider"></li>
                
                <li class="sidebar-menu-item">
                    <a href="${basePath}reservas.html" class="sidebar-menu-link ${currentPage === 'reservas' ? 'active' : ''}">
                        <span class="sidebar-menu-icon">${window.Icons?.calendar || '📅'}</span>
                        <span class="sidebar-menu-text">Mis Reservas</span>
                    </a>
                </li>
                
                <li class="sidebar-menu-item">
                    <a href="${basePath}nueva-reserva.html" class="sidebar-menu-link ${currentPage === 'nueva-reserva' ? 'active' : ''}">
                        <span class="sidebar-menu-icon">${window.Icons?.calendarPlus || '➕'}</span>
                        <span class="sidebar-menu-text">Nueva Reserva</span>
                    </a>
                </li>
                
                <li class="sidebar-divider"></li>
                <li class="sidebar-menu-header">
                    <span class="sidebar-menu-text" style="font-weight: 600; color: rgba(255,255,255,0.8); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;">INFORMACIÓN</span>
                </li>
                <li class="sidebar-divider"></li>
                
                <li class="sidebar-menu-item">
                    <a href="${basePath}salones-view.html" class="sidebar-menu-link ${currentPage === 'salones-view' ? 'active' : ''}">
                        <span class="sidebar-menu-icon">${window.Icons?.building || '🏢'}</span>
                        <span class="sidebar-menu-text">Ver Salones</span>
                    </a>
                </li>
                
                <li class="sidebar-menu-item">
                    <a href="${basePath}servicios-view.html" class="sidebar-menu-link ${currentPage === 'servicios-view' ? 'active' : ''}">
                        <span class="sidebar-menu-icon">${window.Icons?.sparkles || '🎉'}</span>
                        <span class="sidebar-menu-text">Ver Servicios</span>
                    </a>
                </li>
                
                <li class="sidebar-menu-item">
                    <a href="${basePath}turnos-view.html" class="sidebar-menu-link ${currentPage === 'turnos-view' ? 'active' : ''}">
                        <span class="sidebar-menu-icon">${window.Icons?.clock || '⏰'}</span>
                        <span class="sidebar-menu-text">Ver Turnos</span>
                    </a>
                </li>
                
                <li class="sidebar-divider"></li>
                
                <li class="sidebar-menu-item">
                    <a href="../login.html" class="sidebar-menu-link" id="logout-link">
                        <span class="sidebar-menu-icon">${window.Icons?.logOut || '🚪'}</span>
                        <span class="sidebar-menu-text">Cerrar Sesión</span>
                    </a>
                </li>
            </ul>
            
            <div class="sidebar-footer">
                <span class="sidebar-footer-text">© 2024 Sistema de Reservas</span>
            </div>
        </aside>
        <div class="sidebar-overlay" id="sidebar-overlay"></div>
    `;
}

function getUserRole() {
    try {
        const usuarioStr = localStorage.getItem('usuario');
        if (!usuarioStr) return null;
        const usuario = JSON.parse(usuarioStr);
        const roleMap = {
            1: 'cliente',
            2: 'empleado',
            3: 'administrador'
        };
        return roleMap[usuario.tipo_usuario] || null;
    } catch (e) {
        return null;
    }
}

function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '');
    
    // Mapeo específico
    if (page === 'index' || page === '') return 'index';
    
    // Primero verificar informes/reportes (más específicos)
    if (page === 'informes-salones' || path.includes('informes-salones')) return 'informes-salones';
    if (page === 'informes-usuarios' || path.includes('informes-usuarios')) return 'informes-usuarios';
    if (page === 'reportes-reservas' || path.includes('reportes-reservas')) return 'reportes-reservas';
    
    // Luego reservas
    if (page.includes('reservas')) {
        if (path.includes('administrador') && !path.includes('reportes')) return 'reservas';
        if (page.includes('reportes') || path.includes('reportes-reservas')) return 'reportes-reservas';
        if (page.includes('nueva') || path.includes('nueva-reserva')) return 'nueva-reserva';
        return 'reservas';
    }
    
    // Luego salones
    if (page.includes('salones')) {
        if (path.includes('informes-salones')) return 'informes-salones';
        return path.includes('view') ? 'salones-view' : 'salones';
    }
    
    // Luego usuarios
    if (page.includes('usuarios')) {
        if (path.includes('informes-usuarios')) return 'informes-usuarios';
        return 'usuarios';
    }
    
    if (page.includes('clientes')) return 'clientes';
    if (page.includes('servicios')) return path.includes('view') ? 'servicios-view' : 'servicios';
    if (page.includes('turnos')) return path.includes('view') ? 'turnos-view' : 'turnos';
    if (page.includes('nueva-reserva')) return 'nueva-reserva';
    
    return page;
}

function initSidebar() {
    const sidebar = document.getElementById('main-sidebar');
    if (!sidebar) return;
    
    const toggleBtn = document.getElementById('sidebar-toggle');
    const body = document.body;
    
    // Toggle sidebar
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            if (window.innerWidth > 768) {
                sidebar.classList.toggle('collapsed');
                body.classList.toggle('sidebar-collapsed');
                updateToggleIcon();
                
                // Guardar estado
                localStorage.setItem('sidebar-collapsed', sidebar.classList.contains('collapsed'));
            } else {
                sidebar.classList.toggle('mobile-open');
                const overlay = document.getElementById('sidebar-overlay');
                if (overlay) overlay.classList.toggle('active');
            }
        });
    }
    
    function updateToggleIcon() {
        if (!toggleBtn) return;
        if (sidebar.classList.contains('collapsed')) {
            toggleBtn.innerHTML = window.Icons?.chevronRight || '▶';
        } else {
            toggleBtn.innerHTML = window.Icons?.chevronLeft || '◀';
        }
    }
    
    // Cargar estado guardado
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState === 'true' && window.innerWidth > 768) {
        sidebar.classList.add('collapsed');
        body.classList.add('sidebar-collapsed');
        updateToggleIcon();
    }
    
    // Mobile overlay
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('mobile-open');
            overlay.classList.remove('active');
        });
    }
    
    // Logout
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = logoutLink.getAttribute('href');
        });
    }
    
    // Responsive
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('collapsed');
            body.classList.remove('sidebar-collapsed');
            if (toggleBtn) toggleBtn.innerHTML = window.Icons?.menu || '☰';
        } else {
            updateToggleIcon();
        }
    });
    
    // Mobile: ajustar icono inicial
    if (window.innerWidth <= 768 && toggleBtn) {
        toggleBtn.innerHTML = window.Icons?.menu || '☰';
    }
}
