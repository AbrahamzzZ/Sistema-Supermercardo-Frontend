import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-dialogo-formulario-incompleto',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './dialogo-formulario-incompleto.component.html',
  styleUrl: './dialogo-formulario-incompleto.component.scss'
})
export class DialogoFormularioIncompletoComponent {}
