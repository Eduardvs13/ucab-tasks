## Ucab Tasks - API de Notas

API REST para gestionar notas con NestJS. Incluye CRUD completo, validaciones con pipes globales, filtrado/ordenación por fechas y exportación en JSON o CSV. La persistencia se realiza en un archivo local, por lo que no necesitas un servidor de base de datos.

## Requisitos

- Node.js >= 18 (recomendado Node 20 LTS).
- npm >= 10 (incluido con Node).
- Git para clonar el repositorio.
- Permisos de lectura/escritura sobre [database/notes.json](database/notes.json).
- Opcional: [Nest CLI](https://docs.nestjs.com/cli/overview) si quieres usar comandos `nest` directamente.

## Puesta en marcha local

1. Clonar el repositorio
   ```bash
   git clone <url-del-repositorio>
   cd ucab-tasks
   ```
2. Instalar dependencias
   ```bash
   npm install
   ```
3. Ejecutar en desarrollo (recarga en caliente)
   ```bash
   npm run start:dev
   ```

   - URL base: http://localhost:3000
   - Swagger UI: http://localhost:3000/api
   - Variable opcional: `PORT` para cambiar el puerto.

4. Ejecutar pruebas
   ```bash
   npm test        # unitarias
   npm run test:e2e # end-to-end
   npm run test -- [nombre-completo-del-test].[extensión] # ejecuta un test específico
   ```

## Endpoints principales

| Método | Ruta          | Descripción                                                                                                                                                                        |
| :----- | :------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | /notes        | Lista notas con filtros opcionales: `search`, `sort` (title, createdAt, updatedAt), `order` (asc, desc), `createdFrom`, `createdTo`, `updatedFrom`, `updatedTo` (fechas ISO 8601). |
| GET    | /notes/export | Exporta notas. Parámetro `format=csv` para CSV; por defecto JSON.                                                                                                                  |
| GET    | /notes/:id    | Obtiene una nota por UUID.                                                                                                                                                         |
| POST   | /notes        | Crea una nota. Campos: `title` (min 3), `content`.                                                                                                                                 |
| PUT    | /notes/:id    | Actualiza título y/o contenido.                                                                                                                                                    |
| DELETE | /notes/:id    | Elimina una o varias notas (IDs separados por coma).                                                                                                                               |

## Datos y arquitectura

- Persistencia en [database/notes.json](database/notes.json); no requiere motor de base de datos.
- Validaciones automáticas con `ValidationPipe` global (propiedades extra se rechazan).
- Patrón Repository en [src/notes/notes.repository.ts](src/notes/notes.repository.ts) para aislar acceso a datos.
- Patrón Strategy para exportación en [src/notes/strategies](src/notes/strategies) (JSON y CSV).
- Documentación auto-generada con Swagger en `/api` configurada en [src/main.ts](src/main.ts).

## Scripts npm útiles

- `npm run start:dev`: servidor en modo desarrollo con watch.
- `npm run start:prod`: ejecuta el build compilado.
- `npm run test` | `npm run test:e2e`: pruebas unitarias y e2e.

## Notas de operación

- El archivo de datos debe existir antes de escribir; se incluye un ejemplo en `database/notes.json`.
- Asegúrate de ejecutar el proceso con permisos de escritura.
- Para extender formatos de exportación, implementa `ExportStrategy` y regístralo en el controlador o servicio.
