document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/reservas';
    const form = document.getElementById('reserva-form');
    const salonSelect = document.getElementById('salon_id');
    const turnoSelect = document.getElementById('turno_id');
    const serviciosContainer = document.getElementById('servicios-container');
    
    let salones = [];
    let turnos = [];
    let servicios = [];
    let serviciosSeleccionados = [];

    // Configurar fecha mínima (hoy)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fecha_reserva').setAttribute('min', today);

    function formatCurrency(amount) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(amount);
    }

    async function fetchSalones() {
        try {
            const response = await fetch('http://localhost:3007/api/salones');
            if (!response.ok) throw new Error('Error al cargar salones');
            salones = await response.json();
            
            salonSelect.innerHTML = '<option value="">Seleccione un salón</option>';
            salones.forEach(salon => {
                const option = document.createElement('option');
                option.value = salon.salon_id;
                option.textContent = `${salon.titulo} - ${formatCurrency(salon.importe)}`;
                option.dataset.importe = salon.importe;
                salonSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar los salones');
        }
    }

    async function fetchTurnos() {
        try {
            const response = await fetch('http://localhost:3007/api/turnos');
            if (!response.ok) throw new Error('Error al cargar turnos');
            turnos = await response.json();
            
            turnoSelect.innerHTML = '<option value="">Seleccione un turno</option>';
            turnos.forEach(turno => {
                const option = document.createElement('option');
                option.value = turno.turno_id;
                option.textContent = `${turno.hora_desde.substring(0, 5)} - ${turno.hora_hasta.substring(0, 5)}`;
                turnoSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar los turnos');
        }
    }

    async function fetchServicios() {
        try {
            const response = await fetch('http://localhost:3007/api/servicios');
            if (!response.ok) throw new Error('Error al cargar servicios');
            servicios = await response.json();
            
            serviciosContainer.innerHTML = '';
            servicios.forEach(servicio => {
                const div = document.createElement('div');
                div.style.marginBottom = '10px';
                div.innerHTML = `
                    <label style="display: flex; align-items: center; cursor: pointer;">
                        <input type="checkbox" value="${servicio.servicio_id}" 
                               data-descripcion="${servicio.descripcion}" 
                               data-importe="${servicio.importe}"
                               onchange="updateServicios()" 
                               style="margin-right: 10px; width: 20px; height: 20px;">
                        <span>${servicio.descripcion} - ${formatCurrency(servicio.importe)}</span>
                    </label>
                `;
                serviciosContainer.appendChild(div);
            });
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar los servicios');
        }
    }

    window.updateServicios = function() {
        serviciosSeleccionados = [];
        const checkboxes = serviciosContainer.querySelectorAll('input[type="checkbox"]:checked');
        checkboxes.forEach(cb => {
            serviciosSeleccionados.push({
                servicio_id: parseInt(cb.value),
                descripcion: cb.dataset.descripcion,
                importe: parseFloat(cb.dataset.importe)
            });
        });
        calcularTotal();
    };

    function calcularTotal() {
        const salonOption = salonSelect.options[salonSelect.selectedIndex];
        const importeSalon = salonOption ? parseFloat(salonOption.dataset.importe || 0) : 0;
        const importeServicios = serviciosSeleccionados.reduce((sum, s) => sum + s.importe, 0);
        const total = importeSalon + importeServicios;

        document.getElementById('importe-salon').textContent = formatCurrency(importeSalon);
        document.getElementById('importe-servicios').textContent = formatCurrency(importeServicios);
        document.getElementById('importe-total').textContent = formatCurrency(total);
    }

    salonSelect.addEventListener('change', calcularTotal);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fecha_reserva = document.getElementById('fecha_reserva').value;
        const salon_id = parseInt(salonSelect.value);
        const turno_id = parseInt(turnoSelect.value);
        const tematica = document.getElementById('tematica').value;
        const foto_cumpleaniero = document.getElementById('foto_cumpleaniero').value;

        if (!fecha_reserva || !salon_id || !turno_id) {
            alert('Por favor complete todos los campos requeridos');
            return;
        }

        const reservaData = {
            fecha_reserva,
            salon_id,
            turno_id,
            tematica: tematica || null,
            foto_cumpleaniero: foto_cumpleaniero || null,
            servicios: serviciosSeleccionados.map(s => ({ servicio_id: s.servicio_id }))
        };

        try {
            const response = await window.auth.fetchWithAuth(API_URL, {
                method: 'POST',
                body: JSON.stringify(reservaData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear la reserva');
            }

            const data = await response.json();
            alert('¡Reserva creada exitosamente!');
            window.location.href = 'reservas.html';

        } catch (error) {
            alert(`Error al crear la reserva: ${error.message}`);
            console.error('Error:', error);
        }
    });

    fetchSalones();
    fetchTurnos();
    fetchServicios();
});

