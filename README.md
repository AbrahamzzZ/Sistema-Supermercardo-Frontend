# Sistema de Ventas - Frontend (Angular 22)

Aplicación web desarrollada en **Angular 22** que consume una API REST en .NET 8 para la gestión integral de un negocio.

Incluye administración de usuarios, ventas, compras, inventario, ofertas, reportes y estadísticas con gráficos interactivos.

---

## Características principales

### Gestión de usuarios
- Roles: Administrador y Empleado
- Control de acceso a rutas mediante Guards
- Autenticación basada en JWT
- Interceptor HTTP para envío automático de token
- Cierre de sesión automático por inactividad (10 minutos) y por sesión expirada

---

### Módulos funcionales

El menú lateral agrupa los módulos en secciones desplegables:

| Sección | Módulos |
|---|---|
| General | Inicio, Sucursales (con geolocalización), Usuarios |
| Operaciones | Compras, Ventas, Ofertas |
| Catálogo | Productos, Categorías |
| Contactos | Clientes, Proveedores, Transportistas |
| Sistema | Log |

Las opciones del menú las envía el backend según los permisos del rol. Cada página muestra una ruta de navegación (breadcrumb), por ejemplo `Inicio › Transportistas › Editar Transportista`.

---

### Reportes y estadísticas

- Gráficos dinámicos con Chart.js
- Exportación a PDF y Excel
- Filtros por fechas, categorías y clientes
- Resumen inteligente con IA

---

## Asistente Inteligente del Negocio

El sistema incluye un **Asistente Inteligente** integrado con IA local mediante Ollama.

Permite realizar consultas en lenguaje natural relacionadas con el negocio, por ejemplo:

- ¿Cuáles son los productos más vendidos este mes?
- ¿Qué empleado generó más ventas?
- ¿Qué proveedor tiene mayor volumen de compras?
- ¿Cómo están las ventas comparadas con el mes anterior?
- ¿Qué clientes compran con mayor frecuencia?

La IA analiza la información del sistema y genera un resumen interpretativo para apoyar la toma de decisiones.

---

## Tecnologías utilizadas

- Angular 22
- Angular Material
- SCSS
- Chart.js
- Google Maps
- Leaflet
- JWT

---

## Arquitectura del proyecto

El proyecto está organizado en 3 carpetas principales dentro de `src/app`, más los estilos globales en `src/styles`.

### Core
Contiene elementos globales del sistema:

- Guards
- Interceptors
- Services
- Interfaces
- Constants (constantes compartidas, por ejemplo las claves de `localStorage`)
- Configuración de API y del menú (`core/setting`)

---

### Shared
Componentes reutilizables y utilidades:

- Pipes
- Validators
- UI Components (tabla de datos, menú lateral, breadcrumb, loader)
- Helpers

---

### Presentación
Contiene la estructura visual de la aplicación:

- Pages
- Layout
- Modals
- Dialogs

---

### Styles
Estilos globales de la aplicación:

- `_paleta.scss`: paleta de colores y variables CSS
- `_tema-material.scss`: tema de Angular Material basado en la paleta

---

## Guía para desarrollo

### Paleta de colores

Todos los colores de la aplicación están definidos en `src/styles/_paleta.scss`, a partir de los colores de marca `#79acde` (azul) y `#e2eeb7` (verde lima). Para cambiar un color en toda la app, se cambia solo en ese archivo.

En los estilos de los componentes se usan sus variables en lugar de códigos de color:

```scss
background: var(--color-primario);
color: var(--color-texto-secundario);
border: 1px solid var(--color-borde);
```

Variables principales:

| Variable | Uso |
|---|---|
| `--color-primario` / `--color-primario-hover` | Botones y acciones principales |
| `--color-marca` | Menú lateral y login |
| `--color-secundario` | Resaltados (opción activa del menú, hover) |
| `--color-fondo`, `--color-superficie`, `--color-borde` | Fondos, tarjetas y bordes |
| `--color-texto`, `--color-texto-secundario`, `--color-texto-suave` | Textos |
| `--color-exito`, `--color-advertencia`, `--color-error` | Estados y mensajes |

En los botones de Angular Material se usa `color="primary"` o `color="warn"`, que ya toman la paleta.

### Clases globales para formularios

Definidas en `src/styles.scss`:

| Clase | Uso |
|---|---|
| `form__field` | Input compacto de 35px. Se pone en el `mat-form-field`. |
| `form__button--primary` | Botón principal (Registrar / Guardar cambios) |
| `form__button--secondary` | Botón secundario (Regresar) |
| `boton-archivo` | Botón para subir foto o logo, sobre un `<label for="...">` de un `input file` oculto |

Los formularios usan el proveedor `ESPACIO_FIJO_ERRORES` (`shared/ui/form-field-options.ts`), que reserva el espacio del mensaje de error debajo de cada campo para que no crezca al mostrarse.

### Agregar un menú nuevo

Además de registrarlo en la base de datos, hay que agregar su ruta en la sección que corresponda en `src/app/core/setting/menu/secciones-menu.ts`:

```ts
{ nombre: 'Operaciones', rutas: ['compra', 'venta', 'oferta'] },
```

Si no se agrega, el menú aparece en la sección "Otros". El orden del arreglo define el orden en el menú lateral.

### Manejo de errores HTTP

El interceptor `core/interceptor/error.interceptor.ts` convierte cada error en `{ status, message }` con un mensaje en español, que los componentes muestran con `err.message`:

- En 400, 404, 409 y 422 usa el mensaje que envía el backend.
- En 0, 401, 403, 413 y 5xx usa un mensaje genérico.
- En 401 cierra la sesión y redirige a `/login?motivo=expirada`.
- Cancela las peticiones que tardan más de 30 segundos (`TIEMPO_ESPERA_MS`).

---

## Instalación y ejecución

### Requisitos

- **Node.js 24.15 o superior** (también sirven 22.22.3+ o 26+). Angular CLI 22 no arranca con versiones anteriores.
- npm

### Pasos

**1. Clonar el repositorio y entrar a la carpeta**

```bash
git clone https://github.com/AbrahamzzZ/Sistema-Supermercardo-Frontend.git
cd Sistema-Supermercardo-Frontend
```

**2. Instalar dependencias**

```bash
npm install
```

**3. Configurar las variables de entorno**

Editar `environments/environment.ts` (y `environments/environment.prod.ts` para producción):

```ts
export const environment = {
  production: false,
  API_URL: 'URL_API_AQUI',
  API_GOOGLE_MAPS: 'TU_API_KEY_AQUI'
};
```

> **Importante:** si no se va a usar Google Maps, dejar `API_GOOGLE_MAPS` vacío. El mapa de sucursales usará OpenStreetMap con Leaflet.
>
> No subas al repositorio tus claves reales de API ni de Google Maps.

**4. Ejecutar en modo desarrollo**

```bash
npm start
```

La aplicación queda disponible en `http://localhost:4200/MinimarketEase/`.

---

## Documentación

- Manual de usuario: `docs/Manual de Usuario - MinimarketEase.docx`
