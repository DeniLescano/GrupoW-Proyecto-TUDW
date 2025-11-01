require('dotenv').config();
const db = require('../src/config/database');
const bcrypt = require('bcryptjs');

async function updatePasswords() {
  try {
    const password = '123456';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Actualizando contraseñas...');
    console.log(`Hash generado: ${hashedPassword}`);
    
    // Actualizar todas las contraseñas
    const [result] = await db.query(
      'UPDATE usuarios SET contrasenia = ?',
      [hashedPassword]
    );
    
    console.log(`✅ Contraseñas actualizadas: ${result.affectedRows} usuarios`);
    
    // Mostrar usuarios actualizados
    const [usuarios] = await db.query(
      'SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario FROM usuarios'
    );
    
    console.log('\n📋 Usuarios disponibles:');
    console.log('=' .repeat(60));
    
    const roles = {
      1: 'Cliente',
      2: 'Empleado',
      3: 'Administrador'
    };
    
    usuarios.forEach(usuario => {
      console.log(`\n👤 ${usuario.nombre} ${usuario.apellido}`);
      console.log(`   Usuario: ${usuario.nombre_usuario}`);
      console.log(`   Rol: ${roles[usuario.tipo_usuario] || 'Desconocido'}`);
      console.log(`   Contraseña: 123456`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ ¡Actualización completada!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al actualizar contraseñas:', error);
    process.exit(1);
  }
}

updatePasswords();

