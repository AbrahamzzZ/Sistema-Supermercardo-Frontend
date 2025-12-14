import { Component, EventEmitter, inject, Output } from '@angular/core';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { NegocioService } from '../../../../core/services/negocio.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ia-chat',
  standalone: true,
  imports: [MaterialModule, FormsModule],
  templateUrl: './ia-chat.component.html',
  styleUrl: './ia-chat.component.scss'
})
export class IaChatComponent {
  prompt = '';
  respuesta = '';
  loading = false;
  private readonly negocio = inject(NegocioService);

  @Output() cerrarIA = new EventEmitter<void>();

  volver() {
    this.cerrarIA.emit();
  }
  
  generar() {
    this.loading = true;
    this.respuesta = '';

    this.negocio.consultarIA(this.prompt).subscribe({
      next: (resp: any) => {
        this.respuesta = resp.data;
        this.loading = false;
      },
      error: () => {
        this.respuesta = 'Debe preguntar cosas relacionadas al negocio.';
        this.loading = false;
      }
    });
  }
}