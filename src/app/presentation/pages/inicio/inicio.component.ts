import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IOfertaProducto } from '../../../core/interfaces/Dto/ioferta-producto';
import { IProductoCategoria } from '../../../core/interfaces/Dto/iproducto-categoria';
import { INegocio } from '../../../core/interfaces/negocio';
import { OfertaService } from '../../../core/services/oferta.service';
import { ProductoService } from '../../../core/services/producto.service';
import { LoginService } from '../../../core/services/login.service';
import { FormatoFechaPipe } from '../../../shared/pipes/formato-fecha.pipe';
import { MaterialModule } from '../../../shared/ui/material-module';
import { CabeceraNegocioComponent } from '../negocio-inicio/cabecera-negocio/cabecera-negocio.component';
import {
  ClaveEstadistica,
  ContextoEstadistica,
  PanelEstadisticasComponent
} from '../negocio-inicio/panel-estadisticas/panel-estadisticas.component';
import { IaChatComponent } from '../negocio-inicio/ia-chat/ia-chat.component';

interface AccionRapida {
  titulo: string;
  icono: string;
  ruta: string;
}

@Component({
  selector: 'app-inicio',
  imports: [MaterialModule, FormatoFechaPipe, CabeceraNegocioComponent, PanelEstadisticasComponent, IaChatComponent],
  templateUrl: './inicio.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./inicio.component.scss']
})
export class InicioComponent implements OnInit {
  private readonly snackBar = inject(MatSnackBar);
  private readonly ofertaServicio = inject(OfertaService);
  private readonly productoServicio = inject(ProductoService);
  private readonly loginServicio = inject(LoginService);
  private readonly router = inject(Router);

  protected readonly esAdministrador = this.loginServicio.esAdministrador();
  protected readonly nombreUsuario = this.loginServicio.obtenerDatosToken()?.unique_name ?? '';
  protected readonly rolUsuario = this.loginServicio.obtenerDatosToken()?.role ?? '';
  protected readonly estadisticasPermitidas: ClaveEstadistica[] | null = this.esAdministrador
    ? null
    : ['comprados', 'vendidos'];

  protected readonly accionesRapidas: AccionRapida[] = [
    { titulo: 'Registrar venta', icono: 'point_of_sale', ruta: '/venta' },
    { titulo: 'Registrar producto', icono: 'inventory_2', ruta: '/producto/registro' },
    { titulo: 'Registrar oferta', icono: 'local_offer', ruta: '/oferta/registro' }
  ];

  protected readonly stockMinimo = 10;
  protected readonly ofertas = signal<IOfertaProducto[]>([]);
  protected readonly productosStockBajo = signal<IProductoCategoria[]>([]);
  protected readonly nombreNegocio = signal('');
  protected readonly contexto = signal<ContextoEstadistica>({ titulo: '', datos: '' });

  get animationDuration(): string {
    return `${this.ofertas().length * 3}s`;
  }

  ngOnInit(): void {
    this.obtenerOfertas();
    this.obtenerProductosStockBajo();
  }

  private obtenerOfertas(): void {
    this.ofertaServicio.lista().subscribe({
      next: (resp: any) => this.ofertas.set(resp.data ?? []),
      error: (err) => {
        console.error('Error al obtener las ofertas:', err);
        this.mostrarMensaje('Error al obtener las ofertas.');
      }
    });
  }

  private obtenerProductosStockBajo(): void {
    this.productoServicio.lista().subscribe({
      next: (resp: any) => {
        const productos: IProductoCategoria[] = resp.data ?? [];
        this.productosStockBajo.set(
          productos.filter((producto) => producto.estado && producto.stock < this.stockMinimo)
        );
      },
      error: (err) => console.error('Error al obtener el stock de productos:', err)
    });
  }

  alCargarNegocio(negocio: INegocio): void {
    this.nombreNegocio.set(negocio.nombre);
  }

  alCambiarEstadistica(contexto: ContextoEstadistica): void {
    this.contexto.set(contexto);
  }

  irA(ruta: string): void {
    this.router.navigate([ruta]);
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
  }
}
