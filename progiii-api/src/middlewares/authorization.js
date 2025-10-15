const authorize = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user.tipo_usuario;
        if (allowedRoles.includes(userRole)) {
            next();
        } else {
            res.status(403).json({ message: 'Forbidden: No tienes permiso para realizar esta acción' });
        }
    };
};

module.exports = authorize;