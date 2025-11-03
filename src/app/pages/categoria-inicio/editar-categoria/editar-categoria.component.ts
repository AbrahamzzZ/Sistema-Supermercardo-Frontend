import { Component, HostListener, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriaService } from '../../../core/services/categoria.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Validaciones } from '../../../shared/utility/validaciones';
import { ICategoria } from '../../../core/interfaces/categoria';
import { MaterialModule } from '../../../shared/ui/material-module';

@Component({
  selector: 'app-editar-categoria',
  standalone: true,
  imports: [
    MaterialModule
  ],
  templateUrl: './editar-categoria.component.html',
  styleUrl: './editar-categoria.component.scss'
})
export class EditarCategoriaComponent implements OnInit {
  private categoriaServicio = inject(CategoriaService);
  private activatedRoute = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  idCategoria!: number;

  formCategoria = this.formBuilder.nonNullable.group({
    nombre: ['', [Validators.required, Validaciones.soloLetras(), Validators.maxLength(70)]],
    estado: [false]
  });

  @HostListener('window:beforeunload', ['$event'])
  onBeforeReload(e: BeforeUnloadEvent) {
    const camposEditables = ['nombre'];
    const camposConDatos = camposEditables.some(
      (campo) => this.formCategoria.get(campo)?.value !== ''
    );

    if (camposConDatos) {
      e.preventDefault();
      e.returnValue = ''; // Esto es necesario para mostrar el mensaje de confirmación en algunos navegadores.
    }
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.idCategoria = +params['id'];
      if (this.idCategoria) {
        this.cargarCategoria();
      }
    });
  }

  cargarCategoria(): void {
    this.categoriaServicio.obtener(this.idCategoria).subscribe({
      next: (resp: any) => {
        if (resp) {
          this.formCategoria.patchValue({
            nombre: resp.data.nombre_Categoria,
            estado: resp.data.estado
          });
        }
      },
      error: (err) => {
        this.mostrarMensaje('Error al cargar la infomación de la categoría.');
        console.error(err);
      }
    });
  }

  editarCategoria(): void {
    const categoria: Partial<ICategoria> = {
      id_Categoria: this.idCategoria,
      nombre_Categoria: this.formCategoria.value.nombre!,
      estado: this.formCategoria.value.estado
    };

    this.formCategoria.markAllAsTouched();

    if (!this.formCategoria.valid) {
      this.mostrarMensaje('Formulatio inválido', 'error');
      return;
    }

    this.categoriaServicio.editar(categoria).subscribe({
      next: (data) => {
        if (data.isSuccess) {
          this.router.navigate(['/categoria']);
          this.mostrarMensaje('¡Categoría editada exitosamente!', 'success');
        }
      },
      error: (err) => {
        console.error(err);
        this.mostrarMensaje('Error al editar la Categoría', 'error');
      }
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

  get nombreField(): FormControl<string> {
    return this.formCategoria.controls.nombre;
  }
}
