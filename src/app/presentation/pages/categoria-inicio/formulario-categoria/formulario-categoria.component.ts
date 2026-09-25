import { Component, HostListener, inject, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Metodos } from '../../../../shared/utility/metodos';
import { Validaciones } from '../../../../shared/utility/validaciones';
import { ICategoria } from '../../../../core/interfaces/categoria';
import { CanComponentDeactive } from '../../../../core/guards/formulario-incompleto.guard';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { ESPACIO_FIJO_ERRORES } from '../../../../shared/ui/form-field-options';
import { form, FormField, required, minLength, maxLength, submit } from '@angular/forms/signals';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-formulario-categoria',
  imports: [MaterialModule, FormField],
  providers: [ESPACIO_FIJO_ERRORES],
  templateUrl: './formulario-categoria.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './formulario-categoria.component.scss'
})
export class FormularioCategoriaComponent implements OnInit, CanComponentDeactive {
  private readonly idCategoria = signal<number>(0);
  private readonly salidaAutorizada = signal(false);
  protected readonly guardando = signal(false);
  protected readonly esEdicion = computed(() => this.idCategoria() > 0);

  private readonly route = inject(ActivatedRoute);
  private readonly categoriaServicio = inject(CategoriaService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  protected readonly categoriaModel = signal({
    codigo: Metodos.generarCodigo(),
    nombre: '',
    estado: false
  });

  // Valores con los que se inició el formulario (vacíos al registrar, los de la categoría al editar).
  private valoresIniciales = this.categoriaModel();

  protected readonly categoriaForm = form(this.categoriaModel, (schema) => {
    required(schema.nombre, {message: 'Ingrese un nombre.'});
    minLength(schema.nombre, 4, {message: 'Nombre demasiado corto.'});
    maxLength(schema.nombre, 30, {message: 'Nombre demasiado largo.'});
    Validaciones.soloLetrasSignal(schema.nombre);
  });

  private tieneCambioSinGuardar(): boolean {
    const actual = this.categoriaModel();
    const inicial = this.valoresIniciales;
    return actual.nombre !== inicial.nombre
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
      this.idCategoria.set(id);
      this.cargarCategoria();
    }
  }

  private cargarCategoria(): void {
    this.categoriaServicio.obtener(this.idCategoria()).subscribe({
      next: (resp: any) => {
        if (resp?.data) {
          this.categoriaModel.set({
            codigo: resp.data.codigo,
            nombre: resp.data.nombre_Categoria,
            estado: resp.data.estado
          });
          this.valoresIniciales = this.categoriaModel();
        }
      },
      error: (err) => {
        this.mostrarMensaje('Error al cargar la infomación de la categoría.', 'error');
        console.error(err);
      }
    });
  }

  async guardar() {
    await submit(this.categoriaForm, async (form) => {
      const valores = form().value();
      const categoria: ICategoria = {
        id_Categoria: this.idCategoria(),
        codigo: valores.codigo,
        nombre_Categoria: valores.nombre.trim(),
        estado: valores.estado
      };

      const peticion = this.esEdicion()
        ? this.categoriaServicio.editar(categoria)
        : this.categoriaServicio.registrar(categoria);
      const accion = this.esEdicion() ? 'editada' : 'registrada';

      this.guardando.set(true);

      peticion.subscribe({
        next: (data) => {
          if (data.isSuccess) {
            this.salidaAutorizada.set(true);
            this.router.navigate(['/categoria'], { skipLocationChange: true });
            this.mostrarMensaje(`¡Categoría ${accion} exitosamente!`, 'success');
          }
        },
        error: (err) => {
          console.error(err);
          this.guardando.set(false);
          this.mostrarMensaje(this.esEdicion() ? 'Error al editar la categoría' : 'Error al registrar la categoría', 'error');
        },
        complete: () => this.guardando.set(false)
      });
    });
  }

  regresar() {
    this.router.navigate(['/categoria']);
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
