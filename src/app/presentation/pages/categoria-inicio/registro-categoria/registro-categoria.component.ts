import { Component, HostListener, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Metodos } from '../../../../shared/utility/metodos';
import { Validaciones } from '../../../../shared/utility/validaciones';
import { ICategoria } from '../../../../core/interfaces/categoria';
import { CanComponentDeactive } from '../../../../core/guards/formulario-incompleto.guard';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { form, FormField, required, minLength, maxLength, submit } from '@angular/forms/signals';
@Component({
  selector: 'app-registro-categoria',
  imports: [MaterialModule, FormField],
  templateUrl: './registro-categoria.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './registro-categoria.component.scss'
})
export class RegistroCategoriaComponent implements OnInit, CanComponentDeactive {
  private readonly idCategoria = signal<number | undefined>(undefined);
  private readonly salidaAutorizada = signal(false);
  protected readonly guardando = signal(false);

  private readonly route = inject(ActivatedRoute);
  private readonly categoriaServicio = inject(CategoriaService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  protected readonly categoriaModel = signal({
    codigo: Metodos.generarCodigo(),
    nombre: '',
    estado: false
  });

  protected readonly categoriaForm = form(this.categoriaModel, (schema) => {
    required(schema.nombre, {message: 'Ingrese un nombre.'});
    minLength(schema.nombre, 4, {message: 'Nombre demasiado corto.'});
    maxLength(schema.nombre, 30, {message: 'Nombre demasiado largo.'});
    Validaciones.soloLetrasSignal(schema.nombre);
  });

  private tieneCambioSinGuardar() : boolean {
    return this.categoriaModel().nombre !== '';
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeReload(e: BeforeUnloadEvent) {

    if (this.tieneCambioSinGuardar()) {
      e.preventDefault();
      e.returnValue = ''; // Esto es necesario para mostrar el mensaje de confirmación en algunos navegadores.
    }
  }

  ngOnInit(): void {
   if(this.route.snapshot.params['id']){
    this.idCategoria.set(Number.parseInt(this.route.snapshot.params['id']));
   }
  }

  async registrarCategoria() {
    await submit(this.categoriaForm, async (form) => {
      const categoria: ICategoria = {
        id_Categoria: this.idCategoria() || 0,
        codigo: Metodos.generarCodigo(),
        nombre_Categoria: form().value().nombre.trim(),
        estado: form().value().estado
      };

      this.guardando.set(true);

      this.categoriaServicio.registrar(categoria).subscribe({
        next: (data) => {
          if(data.isSuccess){
            this.salidaAutorizada.set(true);
            this.router.navigate(['/categoria'], { skipLocationChange: true});
            this.mostrarMensaje('¡Categoría registrada exitosamente!', 'success');
          }
        },
        error: () => {
          this.mostrarMensaje('Error al registrar la categoría', 'error');
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

  canDeactive(): boolean {
    return this.salidaAutorizada() || !this.tieneCambioSinGuardar();
  }
}
