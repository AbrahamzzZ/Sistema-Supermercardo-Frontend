import { Routes } from '@angular/router';
import { InicioComponent } from './presentation/pages/inicio/inicio.component';
import { UsuarioInicioComponent } from './presentation/pages/usuario-inicio/usuario-inicio.component';
import { ClienteInicioComponent } from './presentation/pages/cliente-inicio/cliente-inicio.component';
import { PaginaNoEncontradaComponent } from './presentation/pages/pagina-no-encontrada/pagina-no-encontrada.component';
import { TransportistaInicioComponent } from './presentation/pages/transportista-inicio/transportista-inicio.component';
import { ProveedorInicioComponent } from './presentation/pages/proveedor-inicio/proveedor-inicio.component';
import { ProductoInicioComponent } from './presentation/pages/producto-inicio/producto-inicio.component';
import { FormularioProductoComponent } from './presentation/pages/producto-inicio/formulario-producto/formulario-producto.component';
import { FormularioClienteComponent } from './presentation/pages/cliente-inicio/formulario-cliente/formulario-cliente.component';
import { FormularioUsuarioComponent } from './presentation/pages/usuario-inicio/formulario-usuario/formulario-usuario.component';
import { FormularioTransportistaComponent } from './presentation/pages/transportista-inicio/formulario-transportista/formulario-transportista.component';
import { FormularioProveedorComponent } from './presentation/pages/proveedor-inicio/formulario-proveedor/formulario-proveedor.component';
import { FormularioIncompleto } from './core/guards/formulario-incompleto.guard';
import { OfertaInicioComponent } from './presentation/pages/oferta-inicio/oferta-inicio.component';
import { FormularioOfertaComponent } from './presentation/pages/oferta-inicio/formulario-oferta/formulario-oferta.component';
import { LoginLayoutComponent } from './presentation/components/layouts/login-layout/login-layout.component';
import { LoginComponent } from './presentation/pages/login/login.component';
import { MainLayoutComponent } from './presentation/components/layouts/main-layout/main-layout.component';
import { Autenticacion } from './core/guards/autenticacion.guard';
import { RolGuard } from './core/guards/rol.guard';
import { CategoriaInicioComponent } from './presentation/pages/categoria-inicio/categoria-inicio.component';
import { FormularioCategoriaComponent } from './presentation/pages/categoria-inicio/formulario-categoria/formulario-categoria.component';
import { CompraInicioComponent } from './presentation/pages/compra-inicio/compra-inicio.component';
import { VentaInicioComponent } from './presentation/pages/venta-inicio/venta-inicio.component';
import { DetalleCompraComponent } from './presentation/pages/compra-inicio/detalle-compra/detalle-compra.component';
import { DetalleVentaComponent } from './presentation/pages/venta-inicio/detalle-venta/detalle-venta.component';
import { NegocioInicioComponent } from './presentation/pages/negocio-inicio/negocio-inicio.component';
import { SucursalInicioComponent } from './presentation/pages/sucursal-inicio/sucursal-inicio.component';
import { FormularioSucursalComponent } from './presentation/pages/sucursal-inicio/formulario-sucursal/formulario-sucursal.component';
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
        path: 'usuario/registro',
        canActivate: [Autenticacion],
        canDeactivate: [FormularioIncompleto],
        component: FormularioUsuarioComponent,
        title: 'Registro de Usuarios'
      },
      {
        path: 'usuario/editar/:id',
        canActivate: [Autenticacion],
        canDeactivate: [FormularioIncompleto],
        component: FormularioUsuarioComponent,
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
        path: 'cliente/registro',
        canActivate: [Autenticacion],
        canDeactivate: [FormularioIncompleto],
        component: FormularioClienteComponent,
        title: 'Registro de Clientes'
      },
      {
        path: 'cliente/editar/:id',
        canActivate: [Autenticacion],
        canDeactivate: [FormularioIncompleto],
        component: FormularioClienteComponent,
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
        path: 'transportista/registro',
        canActivate: [Autenticacion],
        canDeactivate: [FormularioIncompleto],
        component: FormularioTransportistaComponent,
        title: 'Registro de Transportistas'
      },
      {
        path: 'transportista/editar/:id',
        canActivate: [Autenticacion],
        canDeactivate: [FormularioIncompleto],
        component: FormularioTransportistaComponent,
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
        path: 'proveedor/registro',
        canActivate: [Autenticacion],
        canDeactivate: [FormularioIncompleto],
        component: FormularioProveedorComponent,
        title: 'Registro de Proveedores'
      },
      {
        path: 'proveedor/editar/:id',
        canActivate: [Autenticacion],
        canDeactivate: [FormularioIncompleto],
        component: FormularioProveedorComponent,
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
        path: 'categoria/registro',
        canActivate: [Autenticacion],
        canDeactivate: [FormularioIncompleto],
        component: FormularioCategoriaComponent,
        title: 'Registro de Categorías'
      },
      {
        path: 'categoria/editar/:id',
        canActivate: [Autenticacion],
        canDeactivate: [FormularioIncompleto],
        component: FormularioCategoriaComponent,
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
        path: 'producto/registro',
        canActivate: [Autenticacion],
        canDeactivate: [FormularioIncompleto],
        component: FormularioProductoComponent,
        title: 'Registro de Productos'
      },
      {
        path: 'producto/editar/:id',
        canActivate: [Autenticacion],
        canDeactivate: [FormularioIncompleto],
        component: FormularioProductoComponent,
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
        path: 'oferta/registro',
        canActivate: [Autenticacion],
        canDeactivate: [FormularioIncompleto],
        component: FormularioOfertaComponent,
        title: 'Registro de Ofertas'
      },
      {
        path: 'oferta/editar/:id',
        canActivate: [Autenticacion],
        canDeactivate: [FormularioIncompleto],
        component: FormularioOfertaComponent,
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
        path: 'sucursal/registro',
        component: FormularioSucursalComponent,
        canActivate: [Autenticacion],
        canDeactivate: [FormularioIncompleto],
        title: 'Registar Sucursal'
      },
      {
        path: 'sucursal/editar/:id',
        component: FormularioSucursalComponent,
        canActivate: [Autenticacion],
        canDeactivate: [FormularioIncompleto],
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
