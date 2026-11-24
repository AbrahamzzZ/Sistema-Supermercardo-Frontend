import {
  Component,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  private readonly snackBar = inject(MatSnackBar);
  private readonly contenedor = viewChild<ElementRef<HTMLElement>>('mensajesContenedor');

  readonly contexto = input('');
  readonly tituloContexto = input('');
  readonly claveContexto = input<string | null>(null);

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
    const clave = this.claveContexto();
    if (!clave) {
      this.mostrarError('No se pudo identificar la estadística seleccionada.');
      return;
    }

    this.enviar(
      `Resume la estadística "${this.tituloContexto()}" de mi negocio.`,
      `Resume la estadística "${this.tituloContexto()}"`,
      clave
    );
  }

  enviar(pregunta = this.prompt, textoVisible = pregunta, claveEstadistica?: string): void {
    const texto = pregunta.trim();
    if (!texto || this.cargando()) return;

    this.agregarMensaje({ rol: 'usuario', texto: textoVisible.trim() });
    this.prompt = '';
    this.cargando.set(true);

    const consulta = claveEstadistica
      ? this.negocioServicio.resumirGraficoIA(claveEstadistica)
      : this.negocioServicio.consultarIA(texto);

    consulta.subscribe({
      next: (resp) => {
        this.cargando.set(false);
        if (!resp.isSuccess) {
          this.mostrarError(resp.message);
          return;
        }

        this.agregarMensaje({ rol: 'ia', texto: resp.data });
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        const mensaje = this.obtenerMensajeError(err);
        this.mostrarError(mensaje);
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

  private obtenerMensajeError(error: HttpErrorResponse): string {
    const mensajeBackend = error.error?.message;
    if (typeof mensajeBackend === 'string' && mensajeBackend.trim()) {
      return mensajeBackend;
    }

    return error.status === 0
      ? 'No se pudo conectar con el asistente. Intenta nuevamente.'
      : 'No se pudo completar la consulta al asistente. Intenta nuevamente.';
  }

  private mostrarError(mensaje: string | null | undefined): void {
    this.snackBar.open(
      mensaje?.trim() || 'No se pudo completar la consulta al asistente. Intenta nuevamente.',
      'Cerrar',
      {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar']
      }
    );
  }
}
