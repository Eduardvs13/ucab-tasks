## Ucab Tasks - API de Notas

API REST en NestJS para gestionar notas (CRUD, filtros, exportación JSON/CSV). Pensada como prototipo extensible: cambio de backend de datos sin tocar la lógica, documentación viva con Swagger y código auto-validado con DTOs.

## Requisitos (para ejecutar el prototipo)

- Node.js >= 18 (recomendado 20 LTS).
- npm >= 10.
- Git para clonar el repositorio.
- Sin motor de base de datos externo: se usa el archivo local [database/notes.json](database/notes.json). Solo necesitas permisos de lectura/escritura en ese archivo.
- Opcional: [Nest CLI](https://docs.nestjs.com/cli/overview) si prefieres usar comandos `nest`.

## Puesta en marcha local (paso a paso)

1. Clona el repo y entra en la carpeta

```bash
git clone <url-del-repositorio>
cd ucab-tasks
```

2. Instala dependencias

```bash
npm install
```

3. Arranca en desarrollo (watch)

```bash
npm run start:dev
```

- Base URL: http://localhost:3000
- Swagger UI: http://localhost:3000/api
- Variable opcional: `PORT` para cambiar el puerto.

4. Ejecuta pruebas

```bash
npm test          # unitarias
npm run test:e2e  # end-to-end
npm run test -- <ruta-al-spec> # test específico
```

## Notas

| Método | Ruta          | Descripción                                                                                                                                                                        |
| :----- | :------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | /notes        | Lista notas con filtros opcionales: `search`, `sort` (title, createdAt, updatedAt), `order` (asc, desc), `createdFrom`, `createdTo`, `updatedFrom`, `updatedTo` (fechas ISO 8601). |
| GET    | /notes/export | Exporta notas. Parámetro `format=csv` para CSV; por defecto JSON.                                                                                                                  |
| GET    | /notes/:id    | Obtiene una nota por UUID.                                                                                                                                                         |
| POST   | /notes        | Crea una nota. Campos: `title` (min 3), `content`.                                                                                                                                 |
| PUT    | /notes/:id    | Actualiza título y/o contenido.                                                                                                                                                    |
| DELETE | /notes/:id    | Elimina una o varias notas (IDs separados por coma).                                                                                                                               |

## Ejemplos de Requests y Responses

### Crear nota

Request

```bash
curl -X POST http://localhost:3000/notes \
	-H "Content-Type: application/json" \
	-d '{
		"title": "My note title",
		"content": "Detailed content"
	}'
```

Response 201

```json
{
  "id": "c1f7b0f8-7a3e-4a9c-9d3d-2c8f3d1b9a10",
  "title": "My note title",
  "content": "Detailed content",
  "createdAt": "2026-01-13T12:00:00.000Z",
  "updatedAt": "2026-01-13T12:00:00.000Z"
}
```

Error 400 (validación)

```json
{
  "statusCode": 400,
  "message": ["Title must have at least 3 characters."],
  "error": "Bad Request"
}
```

### Listar notas (filtros y orden)

Request

```bash
curl "http://localhost:3000/notes?search=note&sort=createdAt&order=desc"
```

Response 200

```json
[
  {
    "id": "c1f7b0f8-7a3e-4a9c-9d3d-2c8f3d1b9a10",
    "title": "My note title",
    "createdAt": "2026-01-13T12:00:00.000Z",
    "updatedAt": "2026-01-13T12:10:00.000Z"
  }
]
```

### Obtener nota por ID

Request

```bash
curl http://localhost:3000/notes/c1f7b0f8-7a3e-4a9c-9d3d-2c8f3d1b9a10
```

Response 200

```json
{
  "id": "c1f7b0f8-7a3e-4a9c-9d3d-2c8f3d1b9a10",
  "title": "My note title",
  "content": "Detailed content",
  "createdAt": "2026-01-13T12:00:00.000Z",
  "updatedAt": "2026-01-13T12:10:00.000Z"
}
```

Error 404

```json
{
  "statusCode": 404,
  "message": "Note not found",
  "error": "Not Found"
}
```

### Actualizar nota

Request

```bash
curl -X PUT http://localhost:3000/notes/c1f7b0f8-7a3e-4a9c-9d3d-2c8f3d1b9a10 \
	-H "Content-Type: application/json" \
	-d '{
		"title": "Updated title"
	}'
```

Response 200

```json
{
  "id": "c1f7b0f8-7a3e-4a9c-9d3d-2c8f3d1b9a10",
  "title": "Updated title",
  "content": "Detailed content",
  "createdAt": "2026-01-13T12:00:00.000Z",
  "updatedAt": "2026-01-13T12:20:00.000Z"
}
```

### Eliminar notas (una o varias)

Request (múltiples IDs separados por coma)

```bash
curl -X DELETE http://localhost:3000/notes/c1f7b0f8-7a3e-4a9c-9d3d-2c8f3d1b9a10,c9aa2f52-1e6c-4f3c-8e47-0b9c1c2d3e4f
```

Response 200

```json
[
  {
    "id": "c1f7b0f8-7a3e-4a9c-9d3d-2c8f3d1b9a10",
    "title": "Updated title",
    "content": "Detailed content",
    "createdAt": "2026-01-13T12:00:00.000Z",
    "updatedAt": "2026-01-13T12:20:00.000Z"
  },
  {
    "id": "c9aa2f52-1e6c-4f3c-8e47-0b9c1c2d3e4f",
    "title": "Another note",
    "content": "More content",
    "createdAt": "2026-01-13T11:00:00.000Z",
    "updatedAt": "2026-01-13T11:05:00.000Z"
  }
]
```

### Exportar notas

JSON (por defecto)

```bash
curl "http://localhost:3000/notes/export"
```

Response 200 (Content-Type: application/json)

```json
[
  {
    "id": "c1f7b0f8-7a3e-4a9c-9d3d-2c8f3d1b9a10",
    "title": "Updated title",
    "content": "Detailed content",
    "createdAt": "2026-01-13T12:00:00.000Z",
    "updatedAt": "2026-01-13T12:20:00.000Z"
  }
]
```

CSV

```bash
curl "http://localhost:3000/notes/export?format=csv"
```

Response 200 (Content-Type: text/csv)

```
id,title,content,createdAt,updatedAt
c1f7b0f8-7a3e-4a9c-9d3d-2c8f3d1b9a10,Updated title,Detailed content,2026-01-13T12:00:00.000Z,2026-01-13T12:20:00.000Z
c9aa2f52-1e6c-4f3c-8e47-0b9c1c2d3e4f,Another note,More content,2026-01-13T11:00:00.000Z,2026-01-13T11:05:00.000Z
```

## Arquitectura y patrones

- **Validación y documentación**: DTOs con `class-validator` y `@ApiProperty*`; Swagger configurado en `/api` ([src/main.ts](src/main.ts)).
- **Repository**: [src/notes/notes.repository.ts](src/notes/notes.repository.ts) centraliza búsqueda, filtros, orden y borrado múltiple; evita duplicar lógica en el servicio y aísla el acceso a datos.
- **Separación de capas**: Controlador -> Servicio -> Repositorio -> Store (adapter). El controlador no conoce la fuente de datos; el repositorio encapsula filtros/orden.
- **Adapter para datos**: `NotesStore` + `FileNotesAdapter` (JSON local). Permite sustituir por otro backend (p.ej., Mongo) sin tocar la lógica ([src/notes/stores](src/notes/stores)).
- **Factory**: `NoteFactory` (invariantes de notas) y `ExportStrategyFactory` (elige JSON/CSV y content-type) ([src/notes/factories](src/notes/factories), [src/notes/strategies/export-strategy.factory.ts](src/notes/strategies/export-strategy.factory.ts)).
- **Strategy**: exportación JSON/CSV desacoplada del controlador ([src/notes/strategies](src/notes/strategies)).

## Datos y operación

- Persistencia en [database/notes.json](database/notes.json); se incluye un archivo de ejemplo.
- Validación estricta: propiedades extra se rechazan; UUID validado en rutas.
- Exportación: `format=csv` devuelve CSV; si no se envía, se entrega JSON.

## Calidad y pruebas

- Código comentado con JSDoc en funciones y métodos implementados (requisito del enunciado).
- Cobertura alta y pruebas para controlador, servicio, repositorio, estrategias, factory, adapter, bootstrap.

### Cobertura de pruebas

- Ejecutar cobertura:

```bash
npm run test:cov
```

- Reporte: resumen en consola y artefactos en `coverage/`.
- HTML (si está habilitado): abrir `coverage/lcov-report/index.html` en el navegador.
- Lcov: `coverage/lcov.info` para integraciones con CI.

### ESLint

- Configuración: [eslint.config.mjs](eslint.config.mjs) (TypeScript + Prettier recomendado).
- Ejecutar análisis y autofix:

```bash
npm run lint
```

- Formateo con Prettier:

```bash
npm run format
```

## Documentación de código (TypeDoc)

- Generar documentación HTML:

```bash
npm install --save-dev typedoc
npm run docs
```

- Abrir en el navegador: `docs/index.html`.
- Configuración: [typedoc.json](typedoc.json). Incluye solo `src/` y excluye pruebas.

## Cómo extender

- Nuevo backend de datos: implementa `NotesStore` (ej. Mongo) y reemplaza la clase inyectada en el provider `NOTES_STORE`.
- Nuevo formato de exportación: crea una clase que implemente `ExportStrategy` y añádela a la factory.

## Enlace rápido

- Swagger UI: http://localhost:3000/api
- Datos locales: [database/notes.json](database/notes.json)
