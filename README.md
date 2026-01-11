<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Ucab Tasks - API de Notas

Este proyecto es una API REST para una aplicación de toma de notas, construida con [NestJS](https://nestjs.com/). El objetivo es crear un servidor modular, escalable y fácil de mantener, aplicando patrones de diseño de software.

## Características Implementadas

- **Gestión de Notas (CRUD):**
  - Crear una nueva nota.
  - Obtener una lista de todas las notas.
  - Obtener una nota específica por su ID.
  - Actualizar una nota existente.
  - Eliminar una nota.
- **Persistencia de Datos:** Los datos de las notas se guardan en un archivo `database/notes.json`.
- **Exportación de Datos:** Las notas se pueden exportar en diferentes formatos (actualmente JSON y CSV).

## Arquitectura y Patrones de Diseño

La aplicación sigue una arquitectura de 3 capas para asegurar la separación de responsabilidades y la modularidad.

1.  **Capa de Presentación (Controller):**
    - `NotesController`: Expone los endpoints de la API REST. Es el punto de entrada para las solicitudes del cliente.

2.  **Capa de Lógica de Negocio (Service):**
    - `NotesService`: Contiene la lógica de negocio. Orquesta las operaciones y aplica las reglas (ej. validaciones).

3.  **Capa de Acceso a Datos (Repository):**
    - `NotesRepository`: Encapsula la lógica para interactuar con la fuente de datos (el archivo JSON).

### Patrones de Diseño Aplicados

- **Repository Pattern:** El `NotesService` depende de la abstracción del `NotesRepository`, no de una implementación concreta. Esto desacopla la lógica de negocio de la persistencia de datos, permitiendo cambiar la base de datos en el futuro (ej. de JSON a SQL) sin afectar el resto de la aplicación.

- **Strategy Pattern:** Se utiliza para la funcionalidad de exportación.
  - Una interfaz `ExportStrategy` define un contrato para diferentes algoritmos de exportación.
  - Clases concretas como `JsonExportStrategy` y `CsvExportStrategy` implementan la lógica para cada formato.
  - El `NotesService` utiliza la estrategia seleccionada para exportar los datos, permitiendo añadir nuevos formatos de manera sencilla y sin modificar el servicio.

- **Inyección de Dependencias (Dependency Injection):** Utilizado en todo el proyecto y gestionado por el contenedor de Inversión de Control (IoC) de NestJS. Las clases reciben sus dependencias (ej. el servicio recibe el repositorio) en lugar de crearlas, lo que aumenta la modularidad y facilita las pruebas.

## API Endpoints

| Método | Ruta                  | Descripción                               |
| :----- | :-------------------- | :---------------------------------------- |
| `GET`  | `/notes`              | Obtiene todas las notas.                  |
| `GET`  | `/notes/:id`          | Obtiene una nota por su ID.               |
| `POST` | `/notes`              | Crea una nueva nota.                      |
| `PUT`  | `/notes/:id`          | Actualiza una nota existente.             |
| `DELETE`| `/notes/:id`          | Elimina una nota.                         |
| `GET`  | `/notes/export`       | Exporta todas las notas en formato JSON.  |
| `GET`  | `/notes/export?format=csv` | Exporta todas las notas en formato CSV.   |

## Cómo Empezar

1.  **Clonar el repositorio:**
    ```bash
    git clone <url-del-repositorio>
    cd ucab-tasks
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Ejecutar la aplicación en modo de desarrollo:**
    ```bash
    npm run start:dev
    ```

La API estará disponible en `http://localhost:3000`.
