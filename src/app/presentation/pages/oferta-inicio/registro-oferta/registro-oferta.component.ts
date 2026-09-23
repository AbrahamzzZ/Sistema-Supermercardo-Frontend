import { Component, HostListener, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OfertaService } from '../../../../core/services/oferta.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Metodos } from '../../../../shared/utility/metodos';
import { Validaciones } from '../../../../shared/utility/validaciones';
import { IOferta } from '../../../../core/interfaces/oferta';
import { Observable } from 'rxjs';
import { ProductoService } from '../../../../core/services/producto.service';
import { IProducto } from '../../../../core/interfaces/producto';
import { CanComponentDeactive } from '../../../../core/guards/formulario-incompleto.guard';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { form, FormField, max, maxLength, min, minLength, required, submit } from '@angular/forms/signals';

@Component({
  selector: 'app-registro-oferta',
  imports: [MaterialModule, FormField],
  templateUrl: './registro-oferta.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './registro-oferta.component.scss'
})
export class RegistroOfertaComponent implements OnInit, CanComponentDeactive {
  private readonly idOferta = signal<number | undefined>(undefined);
  private readonly salidaAutorizada = signal(false);
  private readonly guardando = signal(false);

  private readonly route = inject(ActivatedRoute);
  private readonly ofertaServicio = inject(OfertaService);
  private readonly productoServicio = inject(ProductoService);
  protected readonly productos = signal<IProducto[]>([]);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  protected readonly ofertaModel = signal({
    codigo: Metodos.generarCodigo(),
    nombre: '',
    descripcion: '',
    fecha_Inicio: new Date(),
    fecha_Fin: new Date(),
    producto: 0,
    descuento: 0,
    estado: false
  });

  protected readonly ofertaForm = form(this.ofertaModel, (schema) => {
    required(schema.nombre, {message: 'Ingrese un nombre.'});
    required(schema.descripcion, {message: 'Ingrese una descripción.'});
    required(schema.descuento, {message: 'Ingrese un número para el descuento.'});
    required(schema.fecha_Inicio, {message: 'Ingrese una fecha inicio.'});
    required(schema.fecha_Fin, {message: 'Ingrese una fecha fin.'});
    maxLength(schema.nombre, 30, {message: 'El nombrees demasiado largo.'});
    minLength(schema.descripcion, 3, {message: 'El nombrees demasiado corto.'});
    max(schema.descuento, 100 , {message: 'El descuento no valido.'});
    min(schema.descuento, 1, {message: 'El descuento tiene que ser mayor que 0.'});
    Validaciones.productoRequeridoSignal(schema.producto);
    Validaciones.fechaFinValidaSignal(schema.fecha_Fin, schema.fecha_Inicio);
  });

  private tieneCambioSinGuardar() : boolean {
    return this.ofertaModel().nombre !== '' || this.ofertaModel().descripcion !== '' || this.ofertaModel().descuento !== 0;
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeReload(e: BeforeUnloadEvent) {
    if (this.tieneCambioSinGuardar()) {
      e.preventDefault();
      e.returnValue = ''; // Esto es necesario para mostrar el mensaje de confirmación en algunos navegadores.
    }
  }

  ngOnInit(): void {
    if (this.route.snapshot.params['id']) {
      this.idOferta.set(Number.parseInt(this.route.snapshot.params['id']));
    }

    this.productoServicio.lista().subscribe({
      next: (resp: any) => {
        this.productos.set(resp.data);
      },
      error: (err) => {
        console.error('Error al obtener los productos:', err);
      }
    });
  }

  async registrarOferta() {
    await submit(this.ofertaForm, async (form) => {
      const oferta: IOferta = {
        id_Oferta : this.idOferta() || 0,
        codigo: Metodos.generarCodigo(),
        nombre_Oferta: form().value().nombre.trim(),
        descripcion: form().value().descripcion.trim(),
        fecha_Inicio: this.formatearFecha(form().value().fecha_Inicio),
        fecha_Fin: this.formatearFecha(form().value().fecha_Fin),
        id_Producto: form().value().producto || 0,
        descuento: form().value().descuento,
        estado: form().value().estado,
        fecha_Creacion: this.formatearFecha(new Date())
      }

      this.guardando.set(true);

      this.ofertaServicio.registrar(oferta).subscribe({
        next: (data) => {
          if (data.isSuccess) {
            this.salidaAutorizada.set(true);
            this.router.navigate(['/oferta'], { skipLocationChange: true });
            this.mostrarMensaje('¡Oferta registrado exitosamente!', 'success');
          }
        },
        error: () => {
          this.mostrarMensaje('Error al registrar la Oferta', 'error');
        },
        complete: () => this.guardando.set(false)
      });
    });
  }

  regresar() {
    this.router.navigate(['/oferta']);
  }

  private formatearFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
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

  canDeactive(): boolean | Observable<boolean> {
    return this.salidaAutorizada() || !this.tieneCambioSinGuardar();
  }
}
