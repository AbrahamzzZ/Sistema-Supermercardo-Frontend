import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { OfertaService } from '../../core/services/oferta.service';
import { Subscription, interval } from 'rxjs';
import { FormatoFechaPipe } from '../../shared/pipes/formato-fecha.pipe';
import * as L from 'leaflet';
import { SucursalService } from '../../core/services/sucursal.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IOfertaProducto } from '../../core/interfaces/Dto/ioferta-producto';
import { ISucursalNegocio } from '../../core/interfaces/Dto/sucursal-negocio';
import { MaterialModule } from '../../shared/ui/material-module';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/images/marker-icon-2x.png',
  iconUrl: 'assets/images/marker-icon.png',
  shadowUrl: 'assets/images/marker-shadow.png'
});
@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [MaterialModule, FormatoFechaPipe],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioComponent implements OnInit, OnDestroy {
  private snackBar = inject(MatSnackBar);
  private ofertaServicio = inject(OfertaService);
  private sucursalServcio = inject(SucursalService);
  public sucursales: ISucursalNegocio[] = [];
  public ofertas: IOfertaProducto[] = [];
  public ofertaActual: IOfertaProducto | null = null;
  private subscripcion!: Subscription;
  private indiceOferta = 0;
  private map: L.Map | undefined;

  ngOnInit(): void {
    this.obtenerOfertas();
    this.obtenerSucursales();
    this.marcarSucursalesMapa();
  }

  obtenerOfertas() {
    this.ofertaServicio.lista().subscribe({
      next: (resp: any) => {
        this.ofertas = resp.data;
        if (this.ofertas.length > 0) {
          this.iniciarRotacion();
        }
      },
      error: (err) => {
        console.error('Error al obtener las ofertas:', err);
        this.mostrarMensaje('Error al obtener las ofertas.', 'error');
      }
    });
  }

  obtenerSucursales() {
    this.sucursalServcio.lista().subscribe({
      next: (resp: any) => {
        this.sucursales = resp.data;
        this.marcarSucursalesMapa();
      },
      error: (err) => {
        console.error('Error al obtener las sucursales:', err);
        this.mostrarMensaje('Error al obtener las sucursales.', 'error');
      }
    });
  }

  iniciarRotacion() {
    this.mostrarSiguienteOferta();
    this.subscripcion = interval(5000).subscribe(() => {
      this.mostrarSiguienteOferta();
    });
  }

  mostrarSiguienteOferta() {
    if (this.ofertas.length === 0) return;
    this.ofertaActual = this.ofertas[this.indiceOferta];
    this.indiceOferta = (this.indiceOferta + 1) % this.ofertas.length;
  }

  ngOnDestroy(): void {
    if (this.subscripcion) {
      this.subscripcion.unsubscribe();
    }
  }

  marcarSucursalesMapa(): void {
    const sucursalInicial = this.sucursales.find((s) => s.latitud && s.longitud);
    if (!sucursalInicial) return;

    if (!this.map) {
      this.map = L.map('map').setView([sucursalInicial.latitud, sucursalInicial.longitud], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);
    }

    this.sucursales.forEach((sucursal) => {
      if (sucursal.latitud && sucursal.longitud) {
        L.marker([sucursal.latitud, sucursal.longitud]).addTo(this.map!).bindPopup(`
            <strong>${sucursal.nombre_Sucursal}</strong><br>
            ${sucursal.direccion_Sucursal}<br>
            📍 ${sucursal.ciudad_Sucursal}
          `);
      }
    });
  }

  mostrarMensaje(mensaje: string, tipo: 'success' | 'error' = 'success') {
    const className = tipo === 'success' ? 'success-snackbar' : 'error-snackbar';

    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: [className]
    });
  }
}
