import { Component, HostListener, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { Validaciones } from '../../../../shared/utility/validaciones';
import { ActivatedRoute, Router } from '@angular/router';
import { IProducto } from '../../../../core/interfaces/producto';
import { Metodos } from '../../../../shared/utility/metodos';
import { ProductoService } from '../../../../core/services/producto.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CanComponentDeactive } from '../../../../core/guards/formulario-incompleto.guard';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { ICategoria } from '../../../../core/interfaces/categoria';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { form, FormField, maxLength, minLength, required, submit } from '@angular/forms/signals';

@Component({
  selector: 'app-producto',
  imports: [MaterialModule, FormField],
  templateUrl: './registro-producto.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './registro-producto.component.scss'
})
export class RegistroProductoComponent implements OnInit, CanComponentDeactive {
  private readonly idProducto = signal<number | undefined>(undefined);
  private readonly salidaAutorizada = signal(false);
  protected readonly guardando = signal(false);
  private readonly route = inject(ActivatedRoute);
  private readonly productoServicio = inject(ProductoService);
  private readonly categoriaServicio = inject(CategoriaService);
  protected readonly categorias = signal<ICategoria[]>([]);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  protected readonly productoModel = signal({
    codigo: Metodos.generarCodigo(),
    nombre: '',
    descripcion: '',
    categoria: 0,
    paisOrigen: '',
    estado: false
  });

  protected readonly productoForm = form(this.productoModel, (schema) => {
    required(schema.nombre, { message: 'Ingrese un nombre.' });
    minLength(schema.nombre, 5, { message: 'El nombre del producto es demasiado corto.' });
    maxLength(schema.nombre, 30, { message: 'El nombre del producto es demasiado largo.' });
    required(schema.descripcion, { message: 'Ingrese una descripción.' });
    minLength(schema.descripcion, 4, { message: 'Descripción demasiado corta.' });
    maxLength(schema.descripcion, 50, { message: 'Descripción demasiado larga.' });
    required(schema.categoria, { message: 'Debe seleccionar una categoría.' });
    required(schema.paisOrigen, { message: 'Ingrese un país.' });
    minLength(schema.paisOrigen, 3, { message: 'El país es demasiado corto.' });
    maxLength(schema.paisOrigen, 30, { message: 'El país es demasiado largo.' });
    Validaciones.soloLetrasSignal(schema.nombre);
    Validaciones.soloLetrasSignal(schema.paisOrigen);
    Validaciones.categoriaRequeridaSignal(schema.categoria);
  });

  private tieneCambioSinGuardar(): boolean {
    const modelo = this.productoModel();
    return modelo.nombre !== '' || modelo.descripcion !== '' || modelo.categoria !== 0 || modelo.paisOrigen !== '';
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeReload(e: BeforeUnloadEvent) {
    const modelo = this.productoModel();
    const camposConDatos = modelo.nombre !== '' || modelo.descripcion !== '' || modelo.categoria !== 0 || modelo.paisOrigen !== '';

    if (camposConDatos) {
      e.preventDefault();
      e.returnValue = ''; // Esto es necesario para mostrar el mensaje de confirmación en algunos navegadores.
    }
  }

  ngOnInit(): void {
    if (this.route.snapshot.params['id']) {
      this.idProducto.set(parseInt(this.route.snapshot.params['id']));
    }

    this.categoriaServicio.lista().subscribe({
      next: (resp: any) => {
        this.categorias.set(resp.data);
      },
      error: (err) => {
        console.error('Error al obtener las categorías:', err);
      }
    });
  }

  async registrarProducto() {
    await submit(this.productoForm, async (form) => {
      const producto: IProducto = {
        id_Producto: this.idProducto() || 0,
        codigo: Metodos.generarCodigo(),
        nombre_Producto: form().value().nombre.trim(),
        descripcion: form().value().descripcion.trim(),
        id_Categoria: form().value().categoria,
        pais_Origen: form().value().paisOrigen.trim(),
        estado: form().value().estado
      };

      this.guardando.set(true);
      this.productoServicio.registrar(producto).subscribe({
      next: (data) => {
        if (data.isSuccess) {
          this.salidaAutorizada.set(true);
          this.router.navigate(['/producto'], { skipLocationChange: true });
          this.mostrarMensaje('¡Producto registrado exitosamente!', 'success');
        }
      },
      error: () => {
        this.mostrarMensaje('Error al registrar el Producto', 'error');
      },
      complete: () => this.guardando.set(false)
    });
    });
  }

  regresar() {
    this.router.navigate(['/producto']);
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

  canDeactive(): boolean {
    return this.salidaAutorizada() || !this.tieneCambioSinGuardar();
  }
}
