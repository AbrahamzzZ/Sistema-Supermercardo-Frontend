import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { LoginService } from '../../../../core/services/login.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-modal-inactividad',
  imports: [MatButtonModule, MatIcon],
  templateUrl: './modal-inactividad.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './modal-inactividad.component.scss'
})
export class ModalInactividadComponent {
  private servicio = inject(LoginService);
  private dialogRef = inject(MatDialogRef<ModalInactividadComponent>);
  public data = inject<{ tiempoRestante: number }>(MAT_DIALOG_DATA);

  continuar() {
    this.dialogRef.close(true);
    this.servicio.resetear();
  }
}
