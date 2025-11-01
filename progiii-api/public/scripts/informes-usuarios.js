document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/usuarios';
    
    // Verificar autenticación
    if (!window.auth || !window.auth.isAuthenticated() || !window.auth.isAdmin()) {
        window.location.href = '../login.html';
    }
    
    const loadingMessage = document.getElementById('loading-message');
    const errorMessage = document.getElementById('error-message');
    const informesContainer = document.querySelector('.informes-container');
    const usuariosDetailBody = document.getElementById('usuarios-detail-body');
    
    let allUsuariosData = [];
    let statsData = {};

    function formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR') + ' ' + date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    }

    function getDaysAgo(dateString) {
        if (!dateString) return Infinity;
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    function getTipoUsuarioLabel(tipo) {
        const tipos = {
            1: 'Cliente',
            2: 'Empleado',
            3: 'Administrador'
        };
        return tipos[tipo] || `Tipo ${tipo}`;
    }

    async function fetchAllUsuarios() {
        try {
            loadingMessage.style.display = 'block';
            errorMessage.style.display = 'none';
            informesContainer.style.display = 'none';

            // Obtener estadísticas usando procedimiento almacenado
            const statsResponse = await window.auth.fetchWithAuth('/estadisticas/usuarios');
            if (!statsResponse.ok) {
                throw new Error('Error al cargar las estadísticas');
            }
            const estadisticas = await statsResponse.json();
            statsData = estadisticas;

            // Obtener todos los usuarios para la tabla
            const response = await window.auth.fetchWithAuth(API_URL);
            if (!response.ok) {
                throw new Error('Error al cargar los usuarios');
            }
            
            const usuarios = await response.json();
            allUsuariosData = usuarios;
            
            displayStats(estadisticas);
            displayUsuariosTable(usuarios);
            
            loadingMessage.style.display = 'none';
            informesContainer.style.display = 'block';

        } catch (error) {
            console.error('Error al cargar informes:', error);
            loadingMessage.style.display = 'none';
            errorMessage.style.display = 'block';
        }
    }

    function displayStats(estadisticas) {
        // Actualizar DOM con estadísticas del procedimiento almacenado
        document.getElementById('total-usuarios').textContent = estadisticas.total_usuarios || 0;
        document.getElementById('usuarios-activos').textContent = estadisticas.usuarios_activos || 0;
        document.getElementById('usuarios-inactivos').textContent = estadisticas.usuarios_inactivos || 0;
        
        document.getElementById('tipo-1').textContent = estadisticas.total_clientes || 0;
        document.getElementById('tipo-2').textContent = estadisticas.total_empleados || 0;
        document.getElementById('tipo-3').textContent = estadisticas.total_administradores || 0;
        const otrosTipos = (estadisticas.total_usuarios || 0) - 
                          (estadisticas.total_clientes || 0) - 
                          (estadisticas.total_empleados || 0) - 
                          (estadisticas.total_administradores || 0);
        document.getElementById('otros-tipos').textContent = otrosTipos;
        
        // Para usuarios mes y semana, necesitamos calcular desde los datos
        // Esto se puede mejorar con más procedimientos almacenados
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const inicioSemana = new Date(ahora);
        inicioSemana.setDate(ahora.getDate() - 7);

        const usuariosMes = allUsuariosData.filter(u => {
            if (!u.creado) return false;
            const fechaCreacion = new Date(u.creado);
            return fechaCreacion >= inicioMes;
        }).length;

        const usuariosSemana = allUsuariosData.filter(u => {
            if (!u.creado) return false;
            const fechaCreacion = new Date(u.creado);
            return fechaCreacion >= inicioSemana;
        }).length;
        
        document.getElementById('usuarios-mes').textContent = usuariosMes;
        document.getElementById('usuarios-semana').textContent = usuariosSemana;
        document.getElementById('usuarios-con-celular').textContent = estadisticas.usuarios_con_celular || 0;
        document.getElementById('usuarios-con-foto').textContent = estadisticas.usuarios_con_foto || 0;

        // Actualizar statsData para PDF
        statsData.total = estadisticas.total_usuarios || 0;
        statsData.activos = estadisticas.usuarios_activos || 0;
        statsData.inactivos = estadisticas.usuarios_inactivos || 0;
        statsData.tipo1 = estadisticas.total_clientes || 0;
        statsData.tipo2 = estadisticas.total_empleados || 0;
        statsData.tipo3 = estadisticas.total_administradores || 0;
        statsData.otrosTipos = otrosTipos;
        statsData.usuariosMes = usuariosMes;
        statsData.usuariosSemana = usuariosSemana;
        statsData.usuariosConCelular = estadisticas.usuarios_con_celular || 0;
        statsData.usuariosConFoto = estadisticas.usuarios_con_foto || 0;
    }

    function displayUsuariosTable(usuarios) {
        usuariosDetailBody.innerHTML = '';
        
        // Obtener usuario actual
        const currentUser = window.auth.getUsuario();
        const currentUserId = currentUser ? currentUser.usuario_id : null;
        
        // Ordenar por fecha de creación (más recientes primero)
        const sortedUsuarios = [...usuarios].sort((a, b) => {
            const dateA = new Date(a.creado || 0);
            const dateB = new Date(b.creado || 0);
            return dateB - dateA;
        });

        sortedUsuarios.forEach(usuario => {
            const row = usuariosDetailBody.insertRow();
            
            // Resaltar usuario actual
            if (currentUserId && usuario.usuario_id == currentUserId) {
                row.classList.add('current-user-row');
                row.setAttribute('title', 'Este es tu usuario');
            }
            
            if (usuario.activo === 0 || usuario.activo === false) {
                row.classList.add('user-inactive-row');
            }

            // Agregar indicador visual para usuario actual en la primera celda
            const idCell = row.insertCell();
            if (currentUserId && usuario.usuario_id == currentUserId) {
                const badge = document.createElement('span');
                badge.textContent = 'TÚ';
                badge.className = 'current-user-badge';
                badge.style.cssText = 'background: #28a745; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.7rem; font-weight: bold; margin-right: 5px;';
                idCell.appendChild(badge);
            }
            idCell.appendChild(document.createTextNode(usuario.usuario_id));
            
            row.insertCell().textContent = `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || '-';
            row.insertCell().textContent = usuario.nombre_usuario || '-';
            row.insertCell().textContent = getTipoUsuarioLabel(usuario.tipo_usuario);
            row.insertCell().textContent = usuario.celular || '-';
            row.insertCell().textContent = (usuario.activo === 1 || usuario.activo === true) ? 'Activo' : 'Inactivo';
            row.insertCell().textContent = formatDate(usuario.creado);
        });

        if (usuarios.length === 0) {
            const row = usuariosDetailBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 7;
            cell.textContent = 'No hay usuarios registrados';
            cell.style.textAlign = 'center';
            cell.style.color = '#6c757d';
        }
    }

    // Funcionalidad de PDF y CSV
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const pdfConfigModal = document.getElementById('pdf-config-modal');
    const pdfConfigForm = document.getElementById('pdf-config-form');
    const closePdfConfigBtn = document.querySelector('.close-pdf-config-modal');

    exportPdfBtn.addEventListener('click', () => {
        pdfConfigModal.style.display = 'flex';
    });

    exportCsvBtn.addEventListener('click', () => {
        exportToCSV();
    });

    closePdfConfigBtn.addEventListener('click', () => {
        pdfConfigModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === pdfConfigModal) {
            pdfConfigModal.style.display = 'none';
        }
    });

    pdfConfigForm.addEventListener('submit', (e) => {
        e.preventDefault();
        generatePDF();
        pdfConfigModal.style.display = 'none';
    });

    function generatePDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        let yPos = 20;
        const margin = 15;

        // Configuración
        const includeEstadisticasGenerales = document.getElementById('include-estadisticas-generales').checked;
        const includeDistribucionTipo = document.getElementById('include-distribucion-tipo').checked;
        const includeEstadisticasTemporales = document.getElementById('include-estadisticas-temporales').checked;
        const includeTablaDetalles = document.getElementById('include-tabla-detalles').checked;
        const onlyActivos = document.getElementById('only-activos').checked;

        // Filtrar usuarios si es necesario
        let usuariosParaPDF = allUsuariosData;
        if (onlyActivos) {
            usuariosParaPDF = allUsuariosData.filter(u => u.activo === 1 || u.activo === true);
        }

        // Título
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('Informe de Usuarios', margin, yPos);
        yPos += 10;

        // Fecha de generación
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const fecha = new Date().toLocaleDateString('es-AR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        doc.text(`Generado el: ${fecha}`, margin, yPos);
        yPos += 8;

        // Estadísticas Generales
        if (includeEstadisticasGenerales) {
            if (yPos > 250) { doc.addPage(); yPos = 20; }
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('Estadísticas Generales', margin, yPos);
            yPos += 8;
            
            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');
            doc.text(`Total de Usuarios: ${statsData.total}`, margin, yPos);
            yPos += 6;
            doc.text(`Usuarios Activos: ${statsData.activos}`, margin, yPos);
            yPos += 6;
            doc.text(`Usuarios Inactivos: ${statsData.inactivos}`, margin, yPos);
            yPos += 10;
        }

        // Distribución por Tipo
        if (includeDistribucionTipo) {
            if (yPos > 250) { doc.addPage(); yPos = 20; }
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('Distribución por Tipo de Usuario', margin, yPos);
            yPos += 8;
            
            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');
            doc.text(`Tipo 1 (Cliente): ${statsData.tipo1}`, margin, yPos);
            yPos += 6;
            doc.text(`Tipo 2 (Empleado): ${statsData.tipo2}`, margin, yPos);
            yPos += 6;
            doc.text(`Tipo 3 (Administrador): ${statsData.tipo3}`, margin, yPos);
            yPos += 6;
            doc.text(`Otros Tipos: ${statsData.otrosTipos}`, margin, yPos);
            yPos += 10;
        }

        // Estadísticas Temporales
        if (includeEstadisticasTemporales) {
            if (yPos > 250) { doc.addPage(); yPos = 20; }
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('Estadísticas Temporales', margin, yPos);
            yPos += 8;
            
            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');
            doc.text(`Creados este Mes: ${statsData.usuariosMes}`, margin, yPos);
            yPos += 6;
            doc.text(`Creados esta Semana: ${statsData.usuariosSemana}`, margin, yPos);
            yPos += 6;
            doc.text(`Con Celular: ${statsData.usuariosConCelular}`, margin, yPos);
            yPos += 6;
            doc.text(`Con Foto: ${statsData.usuariosConFoto}`, margin, yPos);
            yPos += 10;
        }

        // Tabla de Detalles
        if (includeTablaDetalles && usuariosParaPDF.length > 0) {
            if (yPos > 200) { doc.addPage(); yPos = 20; }
            
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('Detalle de Usuarios', margin, yPos);
            yPos += 8;

            const tableData = usuariosParaPDF.map(usuario => [
                usuario.usuario_id,
                `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || '-',
                usuario.nombre_usuario || '-',
                getTipoUsuarioLabel(usuario.tipo_usuario),
                usuario.celular || '-',
                (usuario.activo === 1 || usuario.activo === true) ? 'Activo' : 'Inactivo',
                formatDate(usuario.creado).split(' ')[0]
            ]);

            doc.autoTable({
                startY: yPos,
                head: [['ID', 'Nombre Completo', 'Usuario', 'Tipo', 'Celular', 'Estado', 'Creado']],
                body: tableData,
                margin: { left: margin, right: margin },
                styles: { fontSize: 8 },
                headStyles: { fillColor: [0, 123, 255], textColor: [255, 255, 255], fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [245, 245, 245] }
            });
        }

        // Guardar PDF
        const filename = `Informe_Usuarios_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
    }

    function exportToCSV() {
        const onlyActivos = confirm('¿Incluir solo usuarios activos? (Aceptar = Solo activos, Cancelar = Todos)');
        let usuariosParaCSV = allUsuariosData;
        
        if (onlyActivos) {
            usuariosParaCSV = allUsuariosData.filter(u => u.activo === 1 || u.activo === true);
        }

        // CSV con formato mejorado y separador de punto y coma para Excel
        let csv = 'ID;Nombre;Apellido;Usuario (Email);Tipo de Usuario;Celular;Estado;Fecha de Creación\n';
        
        // Datos - usando punto y coma como separador
        usuariosParaCSV.forEach(usuario => {
            const fecha = formatDate(usuario.creado).split(' ')[0];
            const nombre = (usuario.nombre || '').replace(/"/g, '""'); // Escapar comillas
            const apellido = (usuario.apellido || '').replace(/"/g, '""'); // Escapar comillas
            const nombreUsuario = (usuario.nombre_usuario || '').replace(/"/g, '""'); // Escapar comillas
            const tipo = getTipoUsuarioLabel(usuario.tipo_usuario);
            const celular = (usuario.celular || '').replace(/"/g, '""'); // Escapar comillas
            const estado = (usuario.activo === 1 || usuario.activo === true) ? 'Activo' : 'Inactivo';
            
            csv += `${usuario.usuario_id};"${nombre}";"${apellido}";"${nombreUsuario}";"${tipo}";"${celular}";"${estado}";"${fecha}"\n`;
        });

        // Crear y descargar archivo con BOM para UTF-8 en Excel
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Informe_Usuarios_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    fetchAllUsuarios();
});

