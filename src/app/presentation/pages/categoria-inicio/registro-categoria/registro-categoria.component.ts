import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Metodos } from '../../../../shared/utility/metodos';
import { Validaciones } from '../../../../shared/utility/validaciones';
import { HttpErrorResponse } from '@angular/common/http';
import { ICategoria } from '../../../../core/interfaces/categoria';
import { Observable } from 'rxjs';
import { CanComponentDeactive } from '../../../../core/guards/formulario-incompleto.guard';
import { MaterialModule } from '../../../../shared/ui/material-module';

@Component({
  selector: 'app-registro-categoria',
  standalone: true,
  imports: [
    MaterialModule
  ],
  templateUrl: './registro-categoria.component.html',
  styleUrl: './registro-categoria.component.scss'
})
export class RegistroCategoriaComponent implements OnInit, CanComponentDeactive {
  private idCategoria!: number;
  private route = inject(ActivatedRoute);
  private categoriaServicio = inject(CategoriaService);
  private snackBar = inject(MatSnackBar);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  public formCategoria = this.formBuilder.nonNullable.group({
    codigo: [Metodos.generarCodigo()],
    nombre: ['', [Validators.required, Validaciones.soloLetras(), Validators.maxLength(70)]],
    estado: [false]
  });

  @HostListener('window:beforeunload', ['$event'])
  onBeforeReload(e: BeforeUnloadEvent) {
    const camposEditables = ['nombreCompleto', 'clave', 'correoElectronico'];
    const camposConDatos = camposEditables.some(
      (campo) => this.formCategoria.get(campo)?.value !== ''
    );

    if (camposConDatos) {
      e.preventDefault();
      e.returnValue = ''; // Esto es necesario para mostrar el mensaje de confirmación en algunos navegadores.
    }
  }

  ngOnInit(): void {
    if (this.route.snapshot.params['id']) {
      this.idCategoria = parseInt(this.route.snapshot.params['id']);
    }
  }

  registrarCategoria() {
    const categoria: ICategoria = {
      id_Categoria: this.idCategoria || 0,
      codigo: Metodos.generarCodigo(),
      nombre_Categoria: this.formCategoria.value.nombre?.trim() ?? '',
      estado: this.formCategoria.value.estado ?? false,
      fecha_Creacion: Metodos.getFechaCreacion()
    };

    this.formCategoria.markAllAsTouched();

    if (!this.formCategoria.valid) {
      this.mostrarMensaje('Formulatio inválido', 'error');
      return;
    }

    this.categoriaServicio.registrar(categoria).subscribe({
      next: (data) => {
        if (data.isSuccess) {
          this.router.navigate(['/categoria'], { skipLocationChange: true });
          this.mostrarMensaje('¡Categoría registrada exitosamente!', 'success');
        }
      },
      error: (err: HttpErrorResponse) => {
        console.log('Error 400:', err.error);
        if (err.error?.errors) {
          Object.entries(err.error.errors).forEach(([campo, errores]) => {
            console.log(`Error en ${campo}:`, errores);
          });
          this.mostrarMensaje('Error al registrar la Categoría', 'error');
        }
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

  canDeactive(): boolean | Observable<boolean> {
    const camposEditables = ['nombre'];
    const camposVacios = camposEditables.some(
      (campo) => this.formCategoria.get(campo)?.value === ''
    );
    const camposConDatos = camposEditables.some(
      (campo) => this.formCategoria.get(campo)?.value !== ''
    );

    return camposConDatos && camposVacios ? false : true;
  }

  get nombreField(): FormControl<string> {
    return this.formCategoria.controls.nombre;
  }
}
