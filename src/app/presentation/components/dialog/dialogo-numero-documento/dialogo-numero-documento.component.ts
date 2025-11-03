import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dialogo-numero-documento',
  standalone: true,
  imports: [MatDialogModule, MatIcon, MatButtonModule],
  templateUrl: './dialogo-numero-documento.component.html',
  styleUrl: './dialogo-numero-documento.component.scss'
})
export class DialogoNumeroDocumentoComponent {
  private snackBar = inject(MatSnackBar);
  public data = inject<{ numeroDocumento: string }>(MAT_DIALOG_DATA);

  copiar() {
    navigator.clipboard.writeText(this.data.numeroDocumento).then(() => {
      this.mostrarMensaje('Número copiado al portapapeles.', 'success');
    });
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
