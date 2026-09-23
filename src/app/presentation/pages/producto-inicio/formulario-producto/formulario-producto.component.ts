import { Component, HostListener, inject, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
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
import { ERRORES_DINAMICOS } from '../../../../shared/ui/form-field-options';
import { form, FormField, maxLength, minLength, required, submit } from '@angular/forms/signals';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-formulario-producto',
  imports: [MaterialModule, FormField],
  providers: [ERRORES_DINAMICOS],
  templateUrl: './formulario-producto.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './formulario-producto.component.scss'
})
export class FormularioProductoComponent implements OnInit, CanComponentDeactive {
  private readonly idProducto = signal<number>(0);
  private readonly salidaAutorizada = signal(false);
  protected readonly guardando = signal(false);
  protected readonly esEdicion = computed(() => this.idProducto() > 0);

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

  // Valores con los que se inició el formulario (vacíos al registrar, los del producto al editar).
  private valoresIniciales = this.productoModel();

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
    const actual = this.productoModel();
    const inicial = this.valoresIniciales;
    return actual.nombre !== inicial.nombre
      || actual.descripcion !== inicial.descripcion
      || actual.categoria !== inicial.categoria
      || actual.paisOrigen !== inicial.paisOrigen
      || actual.estado !== inicial.estado;
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
      this.idProducto.set(id);
      this.cargarProducto();
    }

    this.categoriaServicio.lista().subscribe({
      next: (resp: any) => {
        this.categorias.set(resp.data);
      },
      error: (err) => {
        this.mostrarMensaje('Error al cargar las categorías.', 'error');
        console.error('Error al obtener las categorías:', err);
      }
    });
  }

  private cargarProducto(): void {
    this.productoServicio.obtener(this.idProducto()).subscribe({
      next: (resp: any) => {
        if (resp?.data) {
          this.productoModel.set({
            codigo: resp.data.codigo,
            nombre: resp.data.nombre_Producto,
            descripcion: resp.data.descripcion,
            categoria: resp.data.id_Categoria,
            paisOrigen: resp.data.pais_Origen,
            estado: resp.data.estado
          });
          this.valoresIniciales = this.productoModel();
        }
      },
      error: (err) => {
        this.mostrarMensaje('Error al cargar la infomación del producto.', 'error');
        console.error(err);
      }
    });
  }

  async guardar() {
    await submit(this.productoForm, async (form) => {
      const valores = form().value();
      const producto: IProducto = {
        id_Producto: this.idProducto(),
        codigo: valores.codigo,
        nombre_Producto: valores.nombre.trim(),
        descripcion: valores.descripcion.trim(),
        id_Categoria: valores.categoria,
        pais_Origen: valores.paisOrigen.trim(),
        estado: valores.estado
      };

      const peticion = this.esEdicion()
        ? this.productoServicio.editar(producto)
        : this.productoServicio.registrar(producto);
      const accion = this.esEdicion() ? 'editado' : 'registrado';

      this.guardando.set(true);

      peticion.subscribe({
        next: (data) => {
          if (data.isSuccess) {
            this.salidaAutorizada.set(true);
            this.router.navigate(['/producto'], { skipLocationChange: true });
            this.mostrarMensaje(`¡Producto ${accion} exitosamente!`, 'success');
          }
        },
        error: (err) => {
          console.error(err);
          this.guardando.set(false);
          this.mostrarMensaje(this.esEdicion() ? 'Error al editar el producto' : 'Error al registrar el producto', 'error');
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

  canDeactive(): boolean | Observable<boolean> {
    return this.salidaAutorizada() || !this.tieneCambioSinGuardar();
  }
}
