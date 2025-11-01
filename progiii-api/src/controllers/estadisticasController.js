const db = require('../config/database');

// Estadísticas de reservas usando procedimiento almacenado
exports.estadisticasReservas = async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;
    
    const [results] = await db.query(
      'CALL sp_estadisticas_reservas(?, ?)',
      [fecha_desde || null, fecha_hasta || null]
    );
    
    res.json(results[0][0]);
  } catch (error) {
    console.error('Error al obtener estadísticas de reservas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
};

// Estadísticas de salones usando procedimiento almacenado
exports.estadisticasSalones = async (req, res) => {
  try {
    const [results] = await db.query('CALL sp_estadisticas_salones()');
    res.json(results[0][0]);
  } catch (error) {
    console.error('Error al obtener estadísticas de salones:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
};

// Estadísticas de usuarios usando procedimiento almacenado
exports.estadisticasUsuarios = async (req, res) => {
  try {
    const [results] = await db.query('CALL sp_estadisticas_usuarios()');
    res.json(results[0][0]);
  } catch (error) {
    console.error('Error al obtener estadísticas de usuarios:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
};

// Reservas por mes usando procedimiento almacenado
exports.reservasPorMes = async (req, res) => {
  try {
    const { anio } = req.query;
    
    const [results] = await db.query(
      'CALL sp_reservas_por_mes(?)',
      [anio || null]
    );
    
    res.json(results[0]);
  } catch (error) {
    console.error('Error al obtener reservas por mes:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
};

// Reservas detalladas para informes usando procedimiento almacenado
exports.reservasDetalladas = async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;
    
    const [results] = await db.query(
      'CALL sp_reservas_detalladas(?, ?)',
      [fecha_desde || null, fecha_hasta || null]
    );
    
    res.json(results[0]);
  } catch (error) {
    console.error('Error al obtener reservas detalladas:', error);
    res.status(500).json({ message: 'Error al obtener reservas detalladas', error: error.message });
  }
};

