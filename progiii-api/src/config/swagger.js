const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Sistema de Reservas',
      version: '1.0.0',
      description: 'API REST para gestión de salones, servicios, turnos y reservas',
      contact: {
        name: 'Grupo W',
        email: 'support@grupow.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3007}/api`,
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido del endpoint /api/auth/login'
        }
      },
      schemas: {
        Usuario: {
          type: 'object',
          required: ['nombre', 'email', 'password', 'tipo_usuario'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del usuario'
            },
            nombre: {
              type: 'string',
              description: 'Nombre completo del usuario'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'Contraseña del usuario'
            },
            telefono: {
              type: 'string',
              description: 'Teléfono del usuario'
            },
            tipo_usuario: {
              type: 'integer',
              enum: [1, 2, 3],
              description: '1: Cliente, 2: Empleado, 3: Administrador'
            },
            activo: {
              type: 'boolean',
              default: true,
              description: 'Estado activo/inactivo'
            }
          }
        },
        Salon: {
          type: 'object',
          required: ['nombre', 'capacidad'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del salón'
            },
            nombre: {
              type: 'string',
              description: 'Nombre del salón'
            },
            capacidad: {
              type: 'integer',
              description: 'Capacidad máxima del salón'
            },
            descripcion: {
              type: 'string',
              description: 'Descripción del salón'
            },
            precio: {
              type: 'number',
              format: 'float',
              description: 'Precio del salón'
            },
            activo: {
              type: 'boolean',
              default: true,
              description: 'Estado activo/inactivo'
            }
          }
        },
        Servicio: {
          type: 'object',
          required: ['nombre', 'precio'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del servicio'
            },
            nombre: {
              type: 'string',
              description: 'Nombre del servicio'
            },
            descripcion: {
              type: 'string',
              description: 'Descripción del servicio'
            },
            precio: {
              type: 'number',
              format: 'float',
              description: 'Precio del servicio'
            },
            duracion: {
              type: 'integer',
              description: 'Duración en minutos'
            },
            activo: {
              type: 'boolean',
              default: true,
              description: 'Estado activo/inactivo'
            }
          }
        },
        Turno: {
          type: 'object',
          required: ['hora_inicio', 'hora_fin'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del turno'
            },
            hora_inicio: {
              type: 'string',
              format: 'time',
              description: 'Hora de inicio (HH:mm)'
            },
            hora_fin: {
              type: 'string',
              format: 'time',
              description: 'Hora de fin (HH:mm)'
            },
            activo: {
              type: 'boolean',
              default: true,
              description: 'Estado activo/inactivo'
            }
          }
        },
        Reserva: {
          type: 'object',
          required: ['fecha_reserva', 'salon_id', 'usuario_id', 'turno_id'],
          properties: {
            reserva_id: {
              type: 'integer',
              description: 'ID único de la reserva'
            },
            fecha_reserva: {
              type: 'string',
              format: 'date',
              description: 'Fecha de la reserva (YYYY-MM-DD)'
            },
            salon_id: {
              type: 'integer',
              description: 'ID del salón'
            },
            usuario_id: {
              type: 'integer',
              description: 'ID del cliente/usuario'
            },
            turno_id: {
              type: 'integer',
              description: 'ID del turno'
            },
            foto_cumpleaniero: {
              type: 'string',
              description: 'URL de foto del cumpleañero'
            },
            tematica: {
              type: 'string',
              description: 'Temática del cumpleaños'
            },
            importe_salon: {
              type: 'number',
              format: 'float',
              description: 'Importe del salón'
            },
            importe_total: {
              type: 'number',
              format: 'float',
              description: 'Importe total (salón + servicios)'
            },
            estado: {
              type: 'string',
              enum: ['pendiente', 'confirmada', 'cancelada', 'completada'],
              default: 'pendiente',
              description: 'Estado de la reserva'
            },
            activo: {
              type: 'boolean',
              default: true,
              description: 'Indica si la reserva está activa (soft delete)'
            },
            servicios: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  servicio_id: { type: 'integer' }
                }
              },
              description: 'Array de servicios asociados'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'Contraseña del usuario'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'Token JWT para autenticación'
            },
            usuario: {
              $ref: '#/components/schemas/Usuario'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error'
            },
            details: {
              type: 'object',
              description: 'Detalles adicionales del error'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js'], // Ruta a los archivos de rutas
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };

