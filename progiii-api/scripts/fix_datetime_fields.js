// Script para corregir campos creado/modificado a DATETIME
require('dotenv').config();
const db = require('../src/config/database');

async function fixDateTimeFields() {
  try {
    console.log('🔄 Corrigiendo campos creado/modificado a DATETIME...');

    const tables = ['salones', 'usuarios', 'servicios', 'turnos', 'reservas', 'reservas_servicios'];
    
    for (const table of tables) {
      try {
        await db.query(`
          ALTER TABLE ${table}
            MODIFY creado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            MODIFY modificado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        `);
        console.log(`✅ ${table} actualizado`);
      } catch (error) {
        if (error.code === 'ER_BAD_FIELD_ERROR') {
          console.log(`⚠️  ${table} - algunos campos no existen, continuando...`);
        } else {
          console.error(`❌ Error en ${table}:`, error.message);
        }
      }
    }

    console.log('\n✅ Corrección de campos DATETIME completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixDateTimeFields();

