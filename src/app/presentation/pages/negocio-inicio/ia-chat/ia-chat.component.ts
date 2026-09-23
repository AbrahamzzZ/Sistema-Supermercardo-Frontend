import { Component, ElementRef, inject, input, signal, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { NegocioService } from '../../../../core/services/negocio.service';

interface MensajeChat {
  rol: 'usuario' | 'ia';
  texto: string;
  error?: boolean;
}

@Component({
  selector: 'app-ia-chat',
  imports: [MaterialModule, FormsModule],
  templateUrl: './ia-chat.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './ia-chat.component.scss'
})
export class IaChatComponent {
  private readonly negocioServicio = inject(NegocioService);
  private readonly contenedor = viewChild<ElementRef<HTMLElement>>('mensajesContenedor');

  readonly contexto = input('');
  readonly tituloContexto = input('');

  protected prompt = '';
  protected readonly cargando = signal(false);
  protected readonly mensajes = signal<MensajeChat[]>([]);

  protected readonly sugerencias = [
    '¿Qué productos debería reabastecer?',
    '¿Cómo puedo aumentar mis ventas?',
    '¿Qué clientes debería fidelizar?'
  ];

  resumirGrafico(): void {
    if (!this.contexto()) return;
    this.enviar(
      `Analiza y resume la estadística "${this.tituloContexto()}" de mi negocio y dame recomendaciones. Datos: ${this.contexto()}`,
      `Resume la estadística "${this.tituloContexto()}"`
    );
  }

  enviar(pregunta = this.prompt, textoVisible = pregunta): void {
    const texto = pregunta.trim();
    if (!texto || this.cargando()) return;

    this.agregarMensaje({ rol: 'usuario', texto: textoVisible.trim() });
    this.prompt = '';
    this.cargando.set(true);

    this.negocioServicio.consultarIA(texto).subscribe({
      next: (resp) => {
        this.cargando.set(false);
        this.agregarMensaje({ rol: 'ia', texto: resp.data });
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.agregarMensaje({
          rol: 'ia',
          error: true,
          texto: err.status === 400
            ? 'Solo puedo responder preguntas relacionadas con tu negocio.'
            : 'No se pudo conectar con el asistente. Intenta nuevamente.'
        });
      }
    });
  }

  alPresionarTecla(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviar();
    }
  }

  limpiar(): void {
    this.mensajes.set([]);
  }

  private agregarMensaje(mensaje: MensajeChat): void {
    this.mensajes.update((lista) => [...lista, mensaje]);
    setTimeout(() => {
      const el = this.contenedor()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }
}
