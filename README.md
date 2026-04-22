# Todo App — Backend

API REST para una aplicación de lista de tareas. Construida con **Express + TypeScript**, desplegada en **Cloud Functions for Firebase** y persistida en **Cloud Firestore**.

Forma parte de una prueba técnica; el frontend correspondiente está en otro repositorio (Angular 17).

## Tecnologías

- Node.js + TypeScript
- Express (servido a través de una Cloud Function HTTPS)
- Firebase Admin SDK + Cloud Firestore
- Zod (validación de payloads)
- Firebase Emulator Suite (desarrollo local)

## Arquitectura

Arquitectura hexagonal (puertos y adaptadores) con separación por módulos de dominio (DDD ligero).

```text
functions/src/
  index.ts                          # Exporta la Cloud Function `api`
  app.ts                            # Configuración de Express + rutas
  config/
    firebase.ts                     # Singleton del Admin SDK
  shared/
    container.ts                    # Composition root (factories + singleton)
    errors/app-error.ts             # Error de dominio/aplicación
    http/
      authenticate.ts               # Middleware de autenticación por header
      error-handler.ts              # Middleware global de errores
      validate.ts                   # Middleware de validación con Zod
  modules/
    users/
      domain/
        user.ts                     # Entidad
        user.repository.ts          # Puerto (interface)
      application/
        find-user-by-email.usecase.ts
        create-user.usecase.ts      # Idempotente: devuelve existente o crea
      infrastructure/
        http/                       # Adaptador HTTP
          user.controller.ts
          user.router.ts
          user.schemas.ts
        persistence/                # Adaptador de persistencia
          firestore-user.repository.ts
    tasks/
      domain/
        task.ts
        task.repository.ts
      application/
        list-tasks.usecase.ts
        create-task.usecase.ts
        update-task.usecase.ts      # Verifica ownership
        delete-task.usecase.ts      # Verifica ownership
      infrastructure/
        http/
          task.controller.ts
          task.router.ts
          task.schemas.ts
        persistence/
          firestore-task.repository.ts
```

### Flujo de una request

```
HTTP → Express → validate(Zod) → authenticate → Controller → UseCase → Repository (port)
                                                                 ↓
                                                      FirestoreXRepository (adapter)
                                                                 ↓
                                                              Firestore
```

- `domain` no conoce Express ni Firebase.
- `application` orquesta casos de uso y depende solo de interfaces (puertos).
- `infrastructure` contiene los adaptadores concretos (HTTP y Firestore).
- `shared/container.ts` es el único lugar donde se instancian adaptadores y casos de uso (singleton), aplicando inyección de dependencias.

## Requisitos

- Node.js 22+ (recomendado 24, definido en `functions/package.json`).
- Firebase CLI: `npm install -g firebase-tools`.
- Proyecto de Firebase con Firestore habilitado y plan Blaze (requerido para Cloud Functions).

## Instalación

```bash
git clone <repo>
cd todo-app-backend/functions
npm install
```

## Desarrollo local (emuladores)

Desde la raíz del repo:

```bash
firebase emulators:start
```

Esto levanta:

- Functions en `http://127.0.0.1:5001`
- Firestore en `http://127.0.0.1:8080`
- Emulator UI en `http://127.0.0.1:4000`

Base URL del API en local:

```
http://127.0.0.1:5001/<PROJECT_ID>/us-central1/api
```

Para este repo: `http://127.0.0.1:5001/todo-app-c933d/us-central1/api`.

## Despliegue

Compila y despliega funciones, reglas e índices:

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions,firestore:rules,firestore:indexes
```

La URL pública de este despliegue es:

```
https://api-aobuox2onq-uc.a.run.app
```

> Cloud Functions v2 corre por debajo sobre Cloud Run, por eso la URL termina en `run.app` en lugar de `cloudfunctions.net`. Ambas formas son equivalentes y apuntan a la misma función.

## Endpoints

**Base URL (producción):** `https://api-aobuox2onq-uc.a.run.app`

Todas las rutas de `/tasks` requieren el header:

```
x-user-email: <email-del-usuario>
```

### Health

`GET /health` → `{"ok": true}`

### Usuarios

| Método | Ruta                  | Descripción                                     |
|--------|-----------------------|-------------------------------------------------|
| GET    | `/users?email=<e>`    | Busca usuario por email.                        |
| POST   | `/users`              | Crea usuario (idempotente: 200 si ya existía).  |

Body de `POST /users`:

```json
{ "email": "user@example.com" }
```

Respuesta:

```json
{
  "data": {
    "id": "SkPbxgAJRiks5HT2n5Rj",
    "email": "user@example.com",
    "createdAt": "2026-04-22T04:29:45.523Z"
  }
}
```

### Tasks (requieren header `x-user-email`)

| Método | Ruta           | Descripción                                            |
|--------|----------------|--------------------------------------------------------|
| GET    | `/tasks`       | Lista las tareas del usuario autenticado (desc).       |
| POST   | `/tasks`       | Crea una tarea para el usuario autenticado.            |
| PUT    | `/tasks/:id`   | Actualiza una tarea propia (título/desc/`completed`).  |
| DELETE | `/tasks/:id`   | Elimina una tarea propia.                              |

Body de `POST /tasks`:

```json
{ "title": "Estudiar", "description": "Angular + RxJS" }
```

Body de `PUT /tasks/:id` (al menos un campo):

```json
{ "completed": true }
```

## Ejemplos (curl)

Cambia el valor de `BASE` según quieras probar local o producción:

```bash
# Producción
BASE="https://api-aobuox2onq-uc.a.run.app"

# Local (emuladores)
# BASE="http://127.0.0.1:5001/todo-app-c933d/us-central1/api"

# Crear/consultar usuario
curl -X POST "$BASE/users" -H "Content-Type: application/json" \
  -d '{"email":"demo@demo.com"}'

# Crear tarea
curl -X POST "$BASE/tasks" \
  -H "Content-Type: application/json" \
  -H "x-user-email: demo@demo.com" \
  -d '{"title":"Primera","description":"probando"}'

# Listar tareas del usuario
curl "$BASE/tasks" -H "x-user-email: demo@demo.com"

# Marcar completada
curl -X PUT "$BASE/tasks/<TASK_ID>" \
  -H "Content-Type: application/json" \
  -H "x-user-email: demo@demo.com" \
  -d '{"completed":true}'

# Borrar
curl -X DELETE "$BASE/tasks/<TASK_ID>" \
  -H "x-user-email: demo@demo.com"
```

## Seguridad

- **CORS** habilitado a nivel de función (`onRequest({cors: true})`) y middleware.
- **Validación** con Zod de `body`, `params` y `query` por endpoint.
- **Auth** simple por header `x-user-email` (middleware `authenticate`). Las operaciones sobre tareas usan el `userId` extraído del usuario autenticado, nunca del cliente, y verifican ownership en `update`/`delete` (devolviendo 403 si no pertenece).
- **Firestore rules**: el acceso directo desde clientes está denegado. Toda operación va por el API con Admin SDK.

> Dado que la prueba pide que el login sea solo con email, se optó por una autenticación simple por header en lugar de JWT/Firebase Auth, manteniendo la lógica clara y verificable. Puede reforzarse en una siguiente iteración con Firebase Auth + custom tokens sin tocar dominio ni casos de uso.

## Decisiones técnicas

- **Hexagonal + DDD**: cumple con la solicitud de arquitectura limpia, repositorios, factories y singletons. El `container` aplica inyección de dependencias y es el único lugar con estado mutable (patrón singleton).
- **Un solo HTTP Cloud Function (`api`)** que sirve toda la app Express, evitando cold starts múltiples y simplificando el routing.
- **Idempotencia en `POST /users`** para simplificar el flujo de login del frontend: si el usuario existe se devuelve 200 con el recurso, si no, 201.
- **Índice compuesto** de Firestore en `tasks(userId ASC, createdAt DESC)` para que la consulta principal escale y no falle en producción.
- **Zod** para validación: tipado fuerte y mensajes consistentes con el middleware global de errores.
- **ESLint + Prettier**-friendly (sin JSDoc forzado, `max-len` 120, `new-cap` desactivado para factories).

## Scripts útiles

Dentro de `functions/`:

```bash
npm run build        # tsc
npm run build:watch  # tsc --watch
npm run lint         # eslint
npm run serve        # build + emulador de functions
npm run deploy       # firebase deploy --only functions
```
