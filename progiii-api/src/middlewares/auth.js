const jwt = require('jsonwebtoken');

// Verificar token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Token de acceso requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secret_key_super_seguro_cambiar_en_produccion');
    req.user = decoded; // Agregar información del usuario al request
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
};

// Autorización por roles
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const userRole = req.user.tipo_usuario;
    
    // Mapeo de roles: 1 = Cliente, 2 = Empleado, 3 = Administrador
    const roleMap = {
      1: 'cliente',
      2: 'empleado',
      3: 'administrador'
    };

    const userRoleName = roleMap[userRole];

    if (!allowedRoles.includes(userRoleName)) {
      return res.status(403).json({ 
        message: 'No tienes permisos para acceder a este recurso',
        required: allowedRoles,
        current: userRoleName
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
};

