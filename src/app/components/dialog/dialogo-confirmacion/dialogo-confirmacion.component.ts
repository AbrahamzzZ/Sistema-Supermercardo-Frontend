import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../shared/ui/material-module';

@Component({
  selector: 'app-dialogo-confirmacion',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './dialogo-confirmacion.component.html',
  styleUrl: './dialogo-confirmacion.component.scss'
})
export class DialogoConfirmacionComponent {
  public dialogRef = inject(MatDialogRef<DialogoConfirmacionComponent>);
  public data = inject<{ mensaje: string }>(MAT_DIALOG_DATA);

  cerrar(): void {
    this.dialogRef.close(false);
  }

  eliminar(): void {
    this.dialogRef.close(true);
  }
}
