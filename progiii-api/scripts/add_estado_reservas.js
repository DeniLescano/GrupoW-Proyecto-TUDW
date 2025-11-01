// Script para agregar campo estado a la tabla reservas
require('dotenv').config();
const db = require('../src/config/database');

async function addEstadoReservas() {
  try {
    console.log('🔄 Agregando campo estado a la tabla reservas...');

    // Verificar si el campo existe
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'reservas' 
      AND COLUMN_NAME = 'estado'
    `);

    if (columns.length > 0) {
      console.log('ℹ️  Campo estado ya existe en la tabla reservas');
      process.exit(0);
    }

    // Agregar el campo
    await db.query(`
      ALTER TABLE reservas 
      ADD COLUMN estado VARCHAR(20) DEFAULT 'pendiente'
    `);

    // Agregar check constraint (si es compatible)
    try {
      await db.query(`
        ALTER TABLE reservas 
        ADD CONSTRAINT chk_estado 
        CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada'))
      `);
    } catch (err) {
      // MySQL puede no soportar CHECK en versiones antiguas, continuar
      console.log('⚠️  No se pudo agregar constraint CHECK (puede ser por versión de MySQL)');
    }

    // Actualizar reservas existentes
    await db.query(`
      UPDATE reservas 
      SET estado = 'confirmada' 
      WHERE estado IS NULL OR estado = ''
    `);

    console.log('✅ Campo estado agregado exitosamente');
    console.log('✅ Reservas existentes actualizadas a estado "confirmada"');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al agregar campo estado:', error.message);
    process.exit(1);
  }
}

addEstadoReservas();

