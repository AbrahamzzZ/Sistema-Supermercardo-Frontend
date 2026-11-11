# Sistema de Ventas - Frontend

Aplicación web para administrar las operaciones de un negocio. El frontend está desarrollado con Angular y se integra con una API REST en .NET 8, que puede ejecutarse como **monolito** o como **microservicios**.

## Funcionalidades principales

- Gestión de usuarios, sucursales, productos, categorías y contactos.
- Administración de compras, ventas e inventario.
- Reportes y estadísticas con opciones de exportación.
- Asistente inteligente para consultas sobre la información del negocio.

## Tecnologías

Angular, Angular Material, SCSS, Chart.js, Google Maps, Leaflet y JWT.

## Backend

El frontend funciona con cualquiera de las dos versiones del backend. Primero levanta el backend siguiendo el README de su repositorio:

| Versión | Repositorio | URL que usa el frontend |
|---|---|---|
| Microservicios (Ocelot, Kafka, Docker) | [Sistema-Supermercado-Backend-Gateway](https://github.com/AbrahamzzZ/Sistema-Supermercado-Backend-Gateway) | `http://localhost:8000/` (API Gateway) |
| Monolito | [Sistema-Supermercado-Backend](https://github.com/AbrahamzzZ/Sistema-Supermercado-Backend) | `http://localhost:5299/api/` |

En microservicios, el README del repositorio del Gateway explica cómo levantar todo el sistema con Docker y enlaza a los demás microservicios (Admin, Auth, Inventory y Order).

## Ejecución

Requiere Node.js 22.22.3 o superior (o 24.15 o superior).

```bash
npm install

# Con microservicios (API Gateway)
npm start

# Con el monolito
npm start -- --configuration monolito
```

La aplicación se abre en http://localhost:4200/MinimarketEase.

## Configuración de la API

Cada servicio de `src/app/core/services` indica a qué módulo del backend pertenece, y el archivo de entorno define a dónde apunta cada módulo:

```ts
// producto.service.ts
private readonly apiUrl = environment.API.admin + 'Producto';
```

| Archivo | Se usa con | `admin` | `auth` | `order` | `inventory` |
|---|---|---|---|---|---|
| `environments/environment.ts` | `npm start` (microservicios) | `:8000/admin/` | `:8000/auth/` | `:8000/order/` | `:8000/inventory/` |
| `environments/environment.monolito.ts` | `--configuration monolito` | `:5299/api/` | `:5299/api/` | `:5299/api/` | `:5299/api/` |
| `environments/environment.prod.ts` | `ng build` (producción) | Gateway publicado + `admin/` | + `auth/` | + `order/` | + `inventory/` |

Recursos de cada módulo:

| Módulo | Recursos |
|---|---|
| `admin` | Categoria, Cliente, Negocio, Oferta, Producto, Proveedor, Sucursal, Transportista |
| `auth` | Usuario (incluido el login), Menu, Rol |
| `order` | Compra, Venta, Log |
| `inventory` | ProductoStock, MovimientoStock |

Para cambiar entre monolito y microservicios no se modifica ningún servicio, solo la configuración con la que se ejecuta. Al agregar un servicio nuevo, usa el módulo al que pertenece el recurso: `environment.API.<modulo> + 'Recurso'`.

## Documentación

- [Manual de usuario](docs/Manual%20de%20Usuario.docx): guía de uso de la aplicación.
- [Manual técnico](docs/Manual%20Tecnico.docx): arquitectura, configuración y puesta en marcha.
