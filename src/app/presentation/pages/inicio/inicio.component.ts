import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IOfertaProducto } from '../../../core/interfaces/Dto/ioferta-producto';
import { OfertaService } from '../../../core/services/oferta.service';
import { FormatoFechaPipe } from '../../../shared/pipes/formato-fecha.pipe';
import { MaterialModule } from '../../../shared/ui/material-module';

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
  public ofertas: IOfertaProducto[] = [];
  public ofertaActual: IOfertaProducto | null = null;
  private subscripcion!: Subscription;
  private indiceOferta = 0;

  ngOnInit(): void {
    this.obtenerOfertas();
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
