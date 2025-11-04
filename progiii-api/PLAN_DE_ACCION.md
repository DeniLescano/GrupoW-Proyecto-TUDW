# Plan de Acción - Refactorización a Arquitectura de 3 Capas y Mejores Prácticas

## Análisis del Estado Actual

### ✅ Aspectos Cumplidos
1. **Framework Express**: Implementado correctamente
2. **JWT Authentication**: Funcional con middleware de autenticación
3. **RBAC (Role-Based Access Control)**: Implementado con `authorizeRoles`
4. **Validación de Datos**: Usa `express-validator` en todos los endpoints
5. **Manejo de Errores**: Middleware de errores implementado
6. **Swagger/OpenAPI**: Configurado (necesita completar documentación)
7. **CORS**: Configurado (necesita mejorarse)
8. **Estructura Modular**: Separación básica de controllers, routes, middlewares

### ❌ Aspectos Pendientes/Mejoras Necesarias

#### I. Arquitectura y Código
1. **Arquitectura de 3 Capas**: Falta capa de acceso a datos (DAOs/Repositories)
2. **Estilo de Código**: 
   - Uso de `==` en lugar de `===` (62 ocurrencias encontradas)
   - Algunos `if` sin llaves
   - Indentación inconsistente
3. **Modularidad**: Controladores contienen lógica de negocio y acceso a datos mezclada
4. **Encapsulamiento**: No hay clases con propiedades privadas donde sería apropiado

#### II. Diseño de API REST
1. **Versionado**: No hay `/api/v1/` en las rutas
2. **Paginación**: No implementada
3. **Filtrado**: No implementado
4. **Ordenación**: No implementada
5. **HATEOAS**: No implementado
6. **Estructura de Respuesta**: Inconsistente (algunos usan `message`, otros `error`)

#### III. Seguridad, Errores y Rendimiento
1. **Rate Limiting**: No implementado
2. **CORS**: Configurado con `*` (muy permisivo)
3. **HTTPS**: No configurado
4. **Caching**: No implementado
5. **Manejo de Errores**: Estructura inconsistente

#### IV. Documentación
1. **Swagger**: Configurado pero incompleto en muchos endpoints
2. **Schemas**: Algunos schemas en Swagger no coinciden con la realidad

---

## PLAN DE ACCIÓN PASO A PASO

### FASE 1: Arquitectura de 3 Capas (PRIORIDAD ALTA)

#### Paso 1.1: Crear Capa de Acceso a Datos (DAOs/Repositories)
**Objetivo**: Separar el acceso a datos de la lógica de negocio

**Archivos a crear**:
- `src/repositories/usuarioRepository.js`
- `src/repositories/salonRepository.js`
- `src/repositories/servicioRepository.js`
- `src/repositories/turnoRepository.js`
- `src/repositories/reservaRepository.js`
- `src/repositories/estadisticasRepository.js`
- `src/repositories/notificacionRepository.js`

**Cambios**:
- Mover todas las consultas SQL de controllers a repositories
- Los repositories deben exponer métodos simples como `findAll()`, `findById()`, `create()`, `update()`, `delete()`
- Los repositories retornan objetos planos o arrays

**Tiempo estimado**: 4-6 horas

---

#### Paso 1.2: Crear Capa de Servicios
**Objetivo**: Mover toda la lógica de negocio a servicios

**Archivos a crear/refactorizar**:
- `src/services/usuarioService.js`
- `src/services/salonService.js`
- `src/services/servicioService.js`
- `src/services/turnoService.js`
- `src/services/reservaService.js`
- `src/services/estadisticasService.js`
- `src/services/notificationService.js` (ya existe, refactorizar)

**Cambios**:
- Los servicios usan los repositories para acceso a datos
- Los servicios contienen validaciones de negocio, transformaciones de datos, cálculos
- Los servicios pueden llamar a otros servicios
- Los controladores solo llaman a servicios y manejan HTTP

**Tiempo estimado**: 6-8 horas

---

#### Paso 1.3: Refactorizar Controladores
**Objetivo**: Los controladores solo manejan HTTP (req/res)

**Archivos a refactorizar**:
- Todos los archivos en `src/controllers/`

**Cambios**:
- Eliminar acceso directo a base de datos
- Eliminar lógica de negocio
- Los controladores solo llaman a servicios y formatean respuestas HTTP
- Manejo de códigos de estado HTTP correctos

**Tiempo estimado**: 3-4 horas

---

### FASE 2: Estilo de Código y Calidad (PRIORIDAD ALTA)

#### Paso 2.1: Corregir Operadores de Comparación
**Objetivo**: Reemplazar todos los `==` por `===`

**Archivos afectados**: Todos los archivos `.js` en `src/`

**Acción**: Búsqueda y reemplazo global, verificar cada caso

**Tiempo estimado**: 1-2 horas

---

#### Paso 2.2: Estandarizar Indentación
**Objetivo**: Usar 2 espacios consistentemente

**Archivos afectados**: Todos los archivos `.js` en `src/`

**Acción**: Usar herramienta de formateo (Prettier o ESLint)

**Tiempo estimado**: 30 minutos

---

#### Paso 2.3: Agregar Llaves a todos los `if`
**Objetivo**: Todos los bloques `if` deben tener llaves explícitas

**Archivos afectados**: Todos los archivos `.js` en `src/`

**Acción**: Revisar y corregir manualmente

**Tiempo estimado**: 1 hora

---

#### Paso 2.4: Mejorar Early Return
**Objetivo**: Aplicar principio de retorno temprano consistentemente

**Archivos afectados**: Todos los archivos en `src/controllers/` y `src/services/`

**Acción**: Refactorizar funciones con múltiples niveles de anidación

**Tiempo estimado**: 2-3 horas

---

### FASE 3: Mejoras en API REST (PRIORIDAD MEDIA)

#### Paso 3.1: Implementar Versionado de API
**Objetivo**: Agregar `/api/v1/` a todas las rutas

**Archivos a modificar**:
- `src/app.js`
- Todos los archivos en `src/routes/`

**Cambios**:
- Cambiar `/api/usuarios` a `/api/v1/usuarios`
- Mantener compatibilidad con rutas antiguas (deprecated) o migrar completamente
- Actualizar Swagger para reflejar versionado

**Tiempo estimado**: 1 hora

---

#### Paso 3.2: Implementar Paginación
**Objetivo**: Agregar paginación a endpoints de listado

**Archivos a modificar**:
- `src/repositories/*.js` (crear método `findAllPaginated`)
- `src/services/*.js` (agregar lógica de paginación)
- `src/controllers/*.js` (leer query params `page`, `limit`)

**Cambios**:
- Agregar query params: `?page=1&limit=10`
- Respuesta incluir: `{ data: [], total: 100, page: 1, limit: 10, totalPages: 10 }`

**Tiempo estimado**: 3-4 horas

---

#### Paso 3.3: Implementar Filtrado
**Objetivo**: Permitir filtrar recursos por campos específicos

**Archivos a modificar**:
- `src/repositories/*.js`
- `src/services/*.js`
- `src/controllers/*.js`

**Cambios**:
- Query params: `?activo=1&tipo_usuario=2`
- Validar filtros permitidos
- Aplicar filtros en consultas SQL

**Tiempo estimado**: 2-3 horas

---

#### Paso 3.4: Implementar Ordenación
**Objetivo**: Permitir ordenar resultados

**Archivos a modificar**:
- `src/repositories/*.js`
- `src/controllers/*.js`

**Cambios**:
- Query params: `?sort=nombre&order=asc` o `?sort=-nombre` (desc)
- Validar campos ordenables
- Aplicar ORDER BY en consultas SQL

**Tiempo estimado**: 2 horas

---

#### Paso 3.5: Estandarizar Estructura de Respuesta
**Objetivo**: Respuestas JSON consistentes

**Archivos a modificar**:
- Todos los `src/controllers/*.js`
- Crear `src/utils/responseFormatter.js`

**Cambios**:
- Crear funciones helper para formatear respuestas:
  - `successResponse(data, message, meta)`
  - `errorResponse(message, errors, statusCode)`
- Aplicar en todos los controladores

**Tiempo estimado**: 2-3 horas

---

#### Paso 3.6: Implementar HATEOAS (Opcional)
**Objetivo**: Agregar enlaces a recursos relacionados en respuestas

**Archivos a modificar**:
- `src/utils/responseFormatter.js`
- `src/controllers/*.js`

**Cambios**:
- Agregar campo `_links` en respuestas con enlaces a recursos relacionados
- Ejemplo: `{ data: {...}, _links: { self: "/api/v1/usuarios/1", reservas: "/api/v1/usuarios/1/reservas" } }`

**Tiempo estimado**: 3-4 horas

---

### FASE 4: Seguridad y Rendimiento (PRIORIDAD MEDIA-ALTA)

#### Paso 4.1: Implementar Rate Limiting
**Objetivo**: Proteger API contra abusos

**Dependencias**: Instalar `express-rate-limit`

**Archivos a modificar**:
- `src/middlewares/rateLimiter.js` (crear)
- `src/app.js`

**Cambios**:
- Configurar rate limiter por IP
- Diferentes límites para rutas públicas vs protegidas
- Headers informativos: `X-RateLimit-*`

**Tiempo estimado**: 1-2 horas

---

#### Paso 4.2: Mejorar Configuración CORS
**Objetivo**: CORS más restrictivo y seguro

**Archivos a modificar**:
- `src/app.js`

**Cambios**:
- Configurar origen específico en lugar de `*`
- Configurar métodos y headers permitidos
- Configurar credenciales si es necesario
- Usar variables de entorno para orígenes permitidos

**Tiempo estimado**: 30 minutos

---

#### Paso 4.3: Implementar Caching
**Objetivo**: Cachear datos que rara vez cambian

**Dependencias**: Instalar `apicache` o `node-cache`

**Archivos a modificar**:
- `src/middlewares/cache.js` (crear)
- `src/app.js` o rutas específicas

**Cambios**:
- Cachear endpoints de estadísticas
- Cachear listados de recursos (con invalidación en updates)
- Headers HTTP: `Cache-Control`

**Tiempo estimado**: 2-3 horas

---

#### Paso 4.4: Configurar HTTPS (Producción)
**Objetivo**: Habilitar HTTPS en producción

**Archivos a modificar**:
- `server.js` o crear `server-https.js`
- Documentación de despliegue

**Cambios**:
- Configurar certificados SSL
- Redirigir HTTP a HTTPS
- Configurar variables de entorno

**Tiempo estimado**: 1-2 horas (depende del entorno)

---

### FASE 5: Documentación y Testing (PRIORIDAD MEDIA)

#### Paso 5.1: Completar Documentación Swagger
**Objetivo**: Documentar todos los endpoints completamente

**Archivos a modificar**:
- Todos los archivos en `src/routes/*.js`

**Cambios**:
- Agregar documentación Swagger completa a todos los endpoints
- Documentar parámetros de query (paginación, filtrado, ordenación)
- Documentar códigos de respuesta y estructuras de error
- Actualizar schemas para que coincidan con la realidad

**Tiempo estimado**: 4-6 horas

---

#### Paso 5.2: Crear Documentación de API
**Objetivo**: Documentación adicional para desarrolladores

**Archivos a crear**:
- `docs/API.md` (Guía de uso de la API)
- `docs/ARCHITECTURE.md` (Documentación de arquitectura)
- `docs/DEPLOYMENT.md` (Guía de despliegue)

**Tiempo estimado**: 2-3 horas

---

### FASE 6: Encapsulamiento y Clases (PRIORIDAD BAJA)

#### Paso 6.1: Refactorizar Servicios a Clases (Opcional)
**Objetivo**: Usar clases con propiedades privadas donde sea apropiado

**Archivos a refactorizar**:
- `src/services/*.js`

**Cambios**:
- Convertir servicios estáticos a clases con métodos de instancia
- Usar `#` para propiedades privadas (ES2022)
- Mantener interfaz pública simple

**Tiempo estimado**: 3-4 horas

---

## ORDEN DE EJECUCIÓN RECOMENDADO

1. **FASE 1** (Arquitectura de 3 Capas) - **CRÍTICO**
   - Paso 1.1 → Paso 1.2 → Paso 1.3

2. **FASE 2** (Estilo de Código) - **CRÍTICO**
   - Paso 2.1 → Paso 2.2 → Paso 2.3 → Paso 2.4

3. **FASE 4.1 y 4.2** (Rate Limiting y CORS) - **IMPORTANTE**

4. **FASE 3** (Mejoras REST) - **IMPORTANTE**
   - Paso 3.1 → Paso 3.2 → Paso 3.3 → Paso 3.4 → Paso 3.5

5. **FASE 4.3 y 4.4** (Caching y HTTPS) - **MEJORAS**

6. **FASE 5** (Documentación) - **IMPORTANTE**

7. **FASE 3.6 y FASE 6** (HATEOAS y Clases) - **OPCIONAL**

---

## ESTIMACIÓN TOTAL DE TIEMPO

- **FASE 1**: 13-18 horas
- **FASE 2**: 4.5-6.5 horas
- **FASE 3**: 10-14 horas
- **FASE 4**: 5-8 horas
- **FASE 5**: 6-9 horas
- **FASE 6**: 3-4 horas (opcional)

**Total**: ~38-60 horas de desarrollo

---

## NOTAS IMPORTANTES

1. **Testing**: Después de cada fase, probar que todo sigue funcionando
2. **Migración Gradual**: Se puede hacer de forma incremental, endpoint por endpoint
3. **Compatibilidad**: Mantener compatibilidad con frontend existente durante la transición
4. **Versionado**: Si se implementa `/api/v1/`, mantener rutas antiguas como deprecated por un tiempo
5. **Documentación**: Actualizar documentación en cada paso

---

## PRÓXIMOS PASOS INMEDIATOS

1. Revisar y aprobar este plan
2. Iniciar con FASE 1, Paso 1.1 (Crear Repositories)
3. Trabajar de forma iterativa, completando cada paso antes de continuar

