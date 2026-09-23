import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { email, form, FormField, maxLength, minLength, required, submit } from '@angular/forms/signals';
import { INegocio } from '../../../../core/interfaces/negocio';
import { NegocioService } from '../../../../core/services/negocio.service';
import { Validaciones } from '../../../../shared/utility/validaciones';
import { Metodos } from '../../../../shared/utility/metodos';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { ERRORES_DINAMICOS } from '../../../../shared/ui/form-field-options';

@Component({
  selector: 'app-editar-negocio-dialog',
  imports: [MaterialModule, FormField],
  providers: [ERRORES_DINAMICOS],
  templateUrl: './editar-negocio-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './editar-negocio-dialog.component.scss'
})
export class EditarNegocioDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<EditarNegocioDialogComponent, INegocio>);
  private readonly negocio = inject<INegocio>(MAT_DIALOG_DATA);
  private readonly negocioServicio = inject(NegocioService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly guardando = signal(false);
  protected readonly imagenURL = signal<string | null>(
    this.negocio.logo ? Metodos.base64AImagen(this.negocio.logo) : null
  );

  protected readonly negocioModel = signal({
    nombre: this.negocio.nombre ?? '',
    telefono: this.negocio.telefono ?? '',
    ruc: this.negocio.ruc ?? '',
    direccion: this.negocio.direccion ?? '',
    correo_Electronico: this.negocio.correo_Electronico ?? '',
    logo: this.negocio.logo ?? ''
  });

  protected readonly negocioForm = form(this.negocioModel, (schema) => {
    required(schema.nombre, { message: 'Ingrese el nombre del negocio.' });
    minLength(schema.nombre, 3, { message: 'El nombre es demasiado corto.' });
    maxLength(schema.nombre, 60, { message: 'El nombre es demasiado largo.' });
    required(schema.telefono, { message: 'Ingrese el teléfono.' });
    Validaciones.soloNumerosSignal(schema.telefono, 10);
    required(schema.ruc, { message: 'Ingrese el RUC.' });
    Validaciones.soloNumerosSignal(schema.ruc, 13);
    required(schema.direccion, { message: 'Ingrese la dirección.' });
    required(schema.correo_Electronico, { message: 'Ingrese el correo electrónico.' });
    email(schema.correo_Electronico, { message: 'Ingrese un correo válido.' });
    required(schema.logo, { message: 'Es obligatorio subir el logo del negocio.' });
  });

  subirImagen(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      this.imagenURL.set(dataUri);
      this.negocioModel.update((modelo) => ({ ...modelo, logo: dataUri.split(',')[1] ?? '' }));
      this.negocioForm.logo().markAsTouched();
    };
    reader.readAsDataURL(file);
  }

  eliminarImagen(): void {
    this.imagenURL.set(null);
    this.negocioModel.update((modelo) => ({ ...modelo, logo: '' }));
  }

  async guardar(): Promise<void> {
    await submit(this.negocioForm, async (form) => {
      const valores = form().value();
      const payload: Partial<INegocio> = {
        id_Negocio: this.negocio.id_Negocio,
        nombre: valores.nombre.trim(),
        telefono: valores.telefono.trim(),
        ruc: valores.ruc.trim(),
        direccion: valores.direccion.trim(),
        correo_Electronico: valores.correo_Electronico.trim(),
        logo: '',
        imagenBase64: valores.logo
      };

      this.guardando.set(true);

      this.negocioServicio.editar(payload).subscribe({
        next: (resp) => {
          this.guardando.set(false);
          if (resp.isSuccess) {
            this.mostrarMensaje('¡Información del negocio actualizada!', 'success');
            this.dialogRef.close({ ...this.negocio, ...payload, logo: valores.logo } as INegocio);
          }
        },
        error: (err) => {
          console.error(err);
          this.guardando.set(false);
          this.mostrarMensaje('Error al editar la información del negocio.', 'error');
        }
      });
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error'): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: [tipo === 'success' ? 'success-snackbar' : 'error-snackbar']
    });
  }
}
