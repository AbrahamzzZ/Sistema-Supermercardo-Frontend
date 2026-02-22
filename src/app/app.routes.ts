import { Routes } from '@angular/router';
import { InicioComponent } from './presentation/pages/inicio/inicio.component';
import { UsuarioInicioComponent } from './presentation/pages/usuario-inicio/usuario-inicio.component';
import { ClienteInicioComponent } from './presentation/pages/cliente-inicio/cliente-inicio.component';
import { PaginaNoEncontradaComponent } from './presentation/pages/pagina-no-encontrada/pagina-no-encontrada.component';
import { TransportistaInicioComponent } from './presentation/pages/transportista-inicio/transportista-inicio.component';
import { ProveedorInicioComponent } from './presentation/pages/proveedor-inicio/proveedor-inicio.component';
import { ProductoInicioComponent } from './presentation/pages/producto-inicio/producto-inicio.component';
import { RegistroProductoComponent } from './presentation/pages/producto-inicio/registro-producto/registro-producto.component';
import { RegistroClienteComponent } from './presentation/pages/cliente-inicio/registro-cliente/registro-cliente.component';
import { RegistroUsuarioComponent } from './presentation/pages/usuario-inicio/registro-usuario/registro-usuario.component';
import { RegistroTransportistaComponent } from './presentation/pages/transportista-inicio/registro-transportista/registro-transportista.component';
import { RegistroProveedorComponent } from './presentation/pages/proveedor-inicio/registro-proveedor/registro-proveedor.component';
import { ProductoEditarComponent } from './presentation/pages/producto-inicio/producto-editar/producto-editar.component';
import { EditarProveedorComponent } from './presentation/pages/proveedor-inicio/editar-proveedor/editar-proveedor.component';
import { EditarTransportistaComponent } from './presentation/pages/transportista-inicio/editar-transportista/editar-transportista.component';
import { EditarUsuarioComponent } from './presentation/pages/usuario-inicio/editar-usuario/editar-usuario.component';
import { EditarClienteComponent } from './presentation/pages/cliente-inicio/editar-cliente/editar-cliente.component';
import { FormularioIncompleto } from './core/guards/formulario-incompleto.guard';
import { OfertaInicioComponent } from './presentation/pages/oferta-inicio/oferta-inicio.component';
import { RegistroOfertaComponent } from './presentation/pages/oferta-inicio/registro-oferta/registro-oferta.component';
import { EditarOfertaComponent } from './presentation/pages/oferta-inicio/editar-oferta/editar-oferta.component';
import { LoginLayoutComponent } from './presentation/components/layouts/login-layout/login-layout.component';
import { LoginComponent } from './presentation/pages/login/login.component';
import { MainLayoutComponent } from './presentation/components/layouts/main-layout/main-layout.component';
import { Autenticacion } from './core/guards/autenticacion.guard';
import { RolGuard } from './core/guards/rol.guard';
import { CategoriaInicioComponent } from './presentation/pages/categoria-inicio/categoria-inicio.component';
import { RegistroCategoriaComponent } from './presentation/pages/categoria-inicio/registro-categoria/registro-categoria.component';
import { EditarCategoriaComponent } from './presentation/pages/categoria-inicio/editar-categoria/editar-categoria.component';
import { CompraInicioComponent } from './presentation/pages/compra-inicio/compra-inicio.component';
import { VentaInicioComponent } from './presentation/pages/venta-inicio/venta-inicio.component';
import { DetalleCompraComponent } from './presentation/pages/compra-inicio/detalle-compra/detalle-compra.component';
import { DetalleVentaComponent } from './presentation/pages/venta-inicio/detalle-venta/detalle-venta.component';
import { NegocioInicioComponent } from './presentation/pages/negocio-inicio/negocio-inicio.component';
import { SucursalInicioComponent } from './presentation/pages/sucursal-inicio/sucursal-inicio.component';
import { RegistrarSucursalComponent } from './presentation/pages/sucursal-inicio/registrar-sucursal/registrar-sucursal.component';
import { EditarSucursalComponent } from './presentation/pages/sucursal-inicio/editar-sucursal/editar-sucursal.component';
import { EstadisticaNegocioComponent } from './presentation/pages/negocio-inicio/estadistica-negocio/estadistica-negocio.component';
import { LogInicioComponent } from './presentation/pages/log-inicio/log-inicio.component';
import { MapaSucursalComponent } from './presentation/pages/sucursal-inicio/mapa-sucursal/mapa-sucursal.component';

export const routes: Routes = [
  {
    path: '',
    component: LoginLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent, title: 'Iniciar Sesión' }
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'home', component: InicioComponent, canActivate: [Autenticacion], title: 'Inicio' },

      //Modulo Usuario
      {
        path: 'usuario',
        component: UsuarioInicioComponent,
        canMatch: [RolGuard],
        canActivate: [Autenticacion],
        title: 'Usuarios'
      },
      {
        path: 'usuario/usuario-registro/:id',
        canActivate: [Autenticacion],
        canDeactivate: [FormularioIncompleto],
        component: RegistroUsuarioComponent,
        title: 'Registro de Usuarios'
      },
      {
        path: 'usuario/usuario-editar/:id',
        canActivate: [Autenticacion],
        component: EditarUsuarioComponent,
        title: 'Editar Usuario'
      },

      //Modulo Cliente
      {
        path: 'cliente',
        component: ClienteInicioComponent,
        canMatch: [RolGuard],
        canActivate: [Autenticacion],
        title: 'Clientes'
      },
      {
        path: 'cliente/cliente-registro/:id',
        canActivate: [Autenticacion],
        canDeactivate: [FormularioIncompleto],
        component: RegistroClienteComponent,
        title: 'Registro de Clientes'
      },
      {
        path: 'cliente/cliente-editar/:id',
        canActivate: [Autenticacion],
        component: EditarClienteComponent,
        title: 'Editar Cliente'
      },

      //Modulo Transportista
      {
        path: 'transportista',
        component: TransportistaInicioComponent,
        canMatch: [RolGuard],
        canActivate: [Autenticacion],
        title: 'Transportistas'
      },
      {
        path: 'transportista/transportista-registro/:id',
        canActivate: [Autenticacion],
        canDeactivate: [FormularioIncompleto],
        component: RegistroTransportistaComponent,
        title: 'Registro de Transportistas'
      },
      {
        path: 'transportista/transportista-editar/:id',
        canActivate: [Autenticacion],
        component: EditarTransportistaComponent,
        title: 'Editar Transportista'
      },

      //Modulo Proveedor
      {
        path: 'proveedor',
        component: ProveedorInicioComponent,
        canMatch: [RolGuard],
        canActivate: [Autenticacion],
        title: 'Proveedor'
      },
      {
        path: 'proveedor/proveedor-registro/:id',
        canActivate: [Autenticacion],
        canDeactivate: [FormularioIncompleto],
        component: RegistroProveedorComponent,
        title: 'Registro de Proveedores'
      },
      {
        path: 'proveedor/proveedor-editar/:id',
        canActivate: [Autenticacion],
        component: EditarProveedorComponent,
        title: 'Editar Proveedor'
      },

      //Modulo Categoría
      {
        path: 'categoria',
        component: CategoriaInicioComponent,
        canActivate: [Autenticacion],
        title: 'Categoria'
      },
      {
        path: 'categoria/categoria-registro/:id',
        canActivate: [Autenticacion],
        canDeactivate: [FormularioIncompleto],
        component: RegistroCategoriaComponent,
        title: 'Registro de Categorías'
      },
      {
        path: 'categoria/categoria-editar/:id',
        canActivate: [Autenticacion],
        component: EditarCategoriaComponent,
        title: 'Editar Categoría'
      },

      //Modulo Producto
      {
        path: 'producto',
        component: ProductoInicioComponent,
        canActivate: [Autenticacion],
        title: 'Producto'
      },
      {
        path: 'producto/producto-registro/:id',
        canActivate: [Autenticacion],
        canDeactivate: [FormularioIncompleto],
        component: RegistroProductoComponent,
        title: 'Registro de Productos'
      },
      {
        path: 'producto/producto-editar/:id',
        canActivate: [Autenticacion],
        component: ProductoEditarComponent,
        title: 'Editar Producto'
      },

      //Modulo Oferta
      {
        path: 'oferta',
        component: OfertaInicioComponent,
        canActivate: [Autenticacion],
        title: 'Oferta'
      },
      {
        path: 'oferta/oferta-registro/:id',
        canActivate: [Autenticacion],
        canDeactivate: [FormularioIncompleto],
        component: RegistroOfertaComponent,
        title: 'Registro de Ofertas'
      },
      {
        path: 'oferta/oferta-editar/:id',
        canActivate: [Autenticacion],
        component: EditarOfertaComponent,
        title: 'Editar Oferta'
      },

      //Modulo Compra
      {
        path: 'compra',
        component: CompraInicioComponent,
        canActivate: [Autenticacion],
        title: 'Registrar Compras'
      },
      {
        path: 'compra/detalle-compra',
        canActivate: [Autenticacion],
        component: DetalleCompraComponent,
        title: 'Ver el detalle de la compra'
      },

      //Modulo Venta
      {
        path: 'venta',
        component: VentaInicioComponent,
        canActivate: [Autenticacion],
        title: 'Registrar Ventas'
      },
      {
        path: 'venta/detalle-venta',
        canActivate: [Autenticacion],
        component: DetalleVentaComponent,
        title: 'Ver el detalle de la venta'
      },

      //Modulo Sucursal
      {
        path: 'sucursal',
        component: SucursalInicioComponent,
        canMatch: [RolGuard],
        canActivate: [Autenticacion],
        title: 'Sucursales nacionales'
      },
      {
        path: 'sucursal/sucursal-registro/:id',
        component: RegistrarSucursalComponent,
        canActivate: [Autenticacion],
        canDeactivate: [FormularioIncompleto],
        title: 'Registar Sucursal'
      },
      {
        path: 'sucursal/sucursal-editar/:id',
        component: EditarSucursalComponent,
        canActivate: [Autenticacion],
        title: 'Editar Sucursal'
      },
      {
        path: 'sucursal/mapa',
        component: MapaSucursalComponent,
        canActivate: [Autenticacion],
        title: 'Mapa de sucursales'
      },

      //Modulo Negocio
      {
        path: 'negocio/1',
        component: NegocioInicioComponent,
        canMatch: [RolGuard],
        canActivate: [Autenticacion],
        title: 'Información del negocio'
      },
      {
        path: 'negocio/1/estadistica',
        component: EstadisticaNegocioComponent,
        canMatch: [RolGuard],
        canActivate: [Autenticacion],
        title: 'Estadisticas del negocio'
      },

      //Modulo Log
      {
        path: 'log',
        component: LogInicioComponent,
        canMatch: [RolGuard],
        canActivate: [Autenticacion],
        title: 'Log'
      }
    ]
  },
  { path: '**', component: PaginaNoEncontradaComponent, title: 'Página no encontrada' }
];
