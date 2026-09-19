import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-dialogo-formulario-incompleto',
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './dialogo-formulario-incompleto.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './dialogo-formulario-incompleto.component.scss'
})
export class DialogoFormularioIncompletoComponent {}
