import { Component, HostListener, inject, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
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
import { ESPACIO_FIJO_ERRORES } from '../../../../shared/ui/form-field-options';
import { form, FormField, max, maxLength, min, minLength, required, submit } from '@angular/forms/signals';

@Component({
  selector: 'app-formulario-oferta',
  imports: [MaterialModule, FormField],
  providers: [ESPACIO_FIJO_ERRORES],
  templateUrl: './formulario-oferta.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './formulario-oferta.component.scss'
})
export class FormularioOfertaComponent implements OnInit, CanComponentDeactive {
  private readonly idOferta = signal<number>(0);
  private readonly salidaAutorizada = signal(false);
  protected readonly guardando = signal(false);
  protected readonly esEdicion = computed(() => this.idOferta() > 0);

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

  // Valores con los que se inició el formulario (vacíos al registrar, los de la oferta al editar).
  private valoresIniciales = this.ofertaModel();

  protected readonly ofertaForm = form(this.ofertaModel, (schema) => {
    required(schema.nombre, {message: 'Ingrese un nombre.'});
    required(schema.descripcion, {message: 'Ingrese una descripción.'});
    required(schema.descuento, {message: 'Ingrese un número para el descuento.'});
    required(schema.fecha_Inicio, {message: 'Ingrese una fecha inicio.'});
    required(schema.fecha_Fin, {message: 'Ingrese una fecha fin.'});
    maxLength(schema.nombre, 30, {message: 'El nombre es demasiado largo.'});
    minLength(schema.descripcion, 3, {message: 'La descripción es demasiado corta.'});
    maxLength(schema.descripcion, 250, {message: 'La descripción es demasiado larga.'});
    max(schema.descuento, 100 , {message: 'El descuento no valido.'});
    min(schema.descuento, 1, {message: 'El descuento tiene que ser mayor que 0.'});
    Validaciones.productoRequeridoSignal(schema.producto);
    Validaciones.fechaFinValidaSignal(schema.fecha_Fin, schema.fecha_Inicio);
  });

  private tieneCambioSinGuardar(): boolean {
    const actual = this.ofertaModel();
    const inicial = this.valoresIniciales;
    return actual.nombre !== inicial.nombre
      || actual.descripcion !== inicial.descripcion
      || actual.producto !== inicial.producto
      || actual.descuento !== inicial.descuento
      || actual.estado !== inicial.estado
      || this.fechaDistinta(actual.fecha_Inicio, inicial.fecha_Inicio)
      || this.fechaDistinta(actual.fecha_Fin, inicial.fecha_Fin);
  }

  private fechaDistinta(a: Date | null, b: Date | null): boolean {
    return (a?.getTime() ?? null) !== (b?.getTime() ?? null);
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeReload(e: BeforeUnloadEvent) {
    if (this.tieneCambioSinGuardar()) {
      e.preventDefault();
      e.returnValue = ''; // Esto es necesario para mostrar el mensaje de confirmación en algunos navegadores.
    }
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.params['id']);
    if (id > 0) {
      this.idOferta.set(id);
      this.cargarOferta();
    }

    this.productoServicio.lista().subscribe({
      next: (resp: any) => {
        this.productos.set(resp.data);
      },
      error: (err) => {
        this.mostrarMensaje('Error al cargar los productos.', 'error');
        console.error('Error al obtener los productos:', err);
      }
    });
  }

  private cargarOferta(): void {
    this.ofertaServicio.obtener(this.idOferta()).subscribe({
      next: (resp: any) => {
        if (resp?.data) {
          this.ofertaModel.set({
            codigo: resp.data.codigo,
            nombre: resp.data.nombre_Oferta,
            descripcion: resp.data.descripcion,
            fecha_Inicio: resp.data.fecha_Inicio ? new Date(resp.data.fecha_Inicio) : new Date(),
            fecha_Fin: resp.data.fecha_Fin ? new Date(resp.data.fecha_Fin) : new Date(),
            producto: resp.data.id_Producto,
            descuento: resp.data.descuento,
            estado: resp.data.estado
          });
          this.valoresIniciales = this.ofertaModel();
        }
      },
      error: (err) => {
        this.mostrarMensaje('Error al cargar la infomación de la oferta.', 'error');
        console.error(err);
      }
    });
  }

  async guardar() {
    await submit(this.ofertaForm, async (form) => {
      const valores = form().value();
      // Al editar se envía lo mismo que antes (sin fecha_Creacion) más el código real de la oferta.
      const datos: Omit<IOferta, 'fecha_Creacion'> = {
        id_Oferta: this.idOferta(),
        codigo: valores.codigo,
        nombre_Oferta: valores.nombre.trim(),
        descripcion: valores.descripcion.trim(),
        fecha_Inicio: this.formatearFecha(valores.fecha_Inicio),
        fecha_Fin: this.formatearFecha(valores.fecha_Fin),
        id_Producto: valores.producto || 0,
        descuento: valores.descuento,
        estado: valores.estado
      };

      const peticion = this.esEdicion()
        ? this.ofertaServicio.editar(datos)
        : this.ofertaServicio.registrar({ ...datos, fecha_Creacion: this.formatearFecha(new Date()) });
      const accion = this.esEdicion() ? 'editada' : 'registrada';

      this.guardando.set(true);

      peticion.subscribe({
        next: (data) => {
          if (data.isSuccess) {
            this.salidaAutorizada.set(true);
            this.router.navigate(['/oferta'], { skipLocationChange: true });
            this.mostrarMensaje(`¡Oferta ${accion} exitosamente!`, 'success');
          }
        },
        error: (err) => {
          console.error(err);
          this.guardando.set(false);
          this.mostrarMensaje(this.esEdicion() ? 'Error al editar la oferta' : 'Error al registrar la oferta', 'error');
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
