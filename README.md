# Sistema de Ventas - Frontend (Angular 17)

Aplicación web desarrollada en **Angular 17** que consume una API REST en .NET 8 para la gestión integral de un negocio.

Incluye administración de usuarios, ventas, compras, inventario, reportes y estadísticas con gráficos interactivos.

---

## Características principales

### Gestión de usuarios
- Roles: Administrador y Empleado
- Control de acceso a rutas mediante Guards
- Autenticación basada en JWT
- Interceptor HTTP para envío automático de token

---

### Módulos funcionales

- Usuarios
- Compras
- Ventas
- Proveedores
- Clientes
- Transportistas
- Sucursales (con geolocalización)
- Negocio
- Productos
- Categorías

---

### Reportes y estadísticas

- Gráficos dinámicos con Chart.js
- Exportación a PDF
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

- Angular 17
- Angular Material
- SCSS
- Chart.js
- Google Maps
- Leaflet
- JWT

---

## Arquitectura del proyecto

El proyecto está organizado en 3 carpetas principales:

### Core
Contiene elementos globales del sistema:

- Guards
- Interceptors
- Services
- Interfaces
- Configuración de API

---

### Shared
Componentes reutilizables y utilidades:

- Pipes
- Validators
- UI Components
- Helpers

---

### Presentación
Contiene la estructura visual de la aplicación:

- Pages
- Layout
- Modals
- Dialogs

---

## Instalación y ejecución

**Clonar repositorio**

git clone <https://github.com/AbrahamzzZ/Sistema-Supermercardo-Frontend.git>

**Entrar a la carpeta del frontend**

cd Frontend

**Instalar dependencias**

npm install

**Configurar variables de entorno**

cd Frontend/environments

export const environment = {
  production: false,
  apiUrl: 'URL_API_AQUI',
  API_GOOGLE_MAPS: 'TU_API_KEY_AQUI'
};

Importante

Si no se va a usar Google Maps, dejar googleMapsApiKey vacío. El proyecto está configurado para soportar tanto Google Maps como Leaflet.

**Ejecutar en modo desarrollo**

ng serve
