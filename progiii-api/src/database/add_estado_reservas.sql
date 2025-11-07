-- Agregar campo estado a la tabla reservas si no existe
ALTER TABLE reservas 
ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'pendiente' 
CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada'));

-- Actualizar reservas existentes sin estado a 'confirmada' por defecto
UPDATE reservas SET estado = 'confirmada' WHERE estado IS NULL OR estado = '';

