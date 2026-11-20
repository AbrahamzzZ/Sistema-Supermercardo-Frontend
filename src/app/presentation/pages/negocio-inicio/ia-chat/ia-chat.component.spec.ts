import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NegocioService } from '../../../../core/services/negocio.service';
import { IaChatComponent } from './ia-chat.component';
import { createPageFixture } from '../../../../shared/utility/test';

describe('IaChatComponent', () => {
  let fixture: Awaited<ReturnType<typeof createPageFixture<IaChatComponent>>>;
  let consultarIA: ReturnType<typeof vi.fn>;
  let resumirGraficoIA: ReturnType<typeof vi.fn>;
  let snackBarOpen: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    consultarIA = vi.fn(() =>
      of({
        isSuccess: true,
        message: 'Análisis generado exitosamente.',
        data: 'Revisa el inventario de bebidas.'
      })
    );
    resumirGraficoIA = vi.fn(() =>
      of({
        isSuccess: true,
        message: 'Análisis generado exitosamente.',
        data: 'Saco de papa: 2 unidades compradas.'
      })
    );
    snackBarOpen = vi.fn();
    fixture = await createPageFixture(IaChatComponent, [
      { provide: NegocioService, useValue: { consultarIA, resumirGraficoIA } },
      { provide: MatSnackBar, useValue: { open: snackBarOpen } }
    ]);
  });

  it('sends trimmed questions and appends the user and assistant replies', () => {
    const component = fixture.componentInstance;

    component.enviar('  ¿Qué debo reabastecer?  ');

    expect(consultarIA).toHaveBeenCalledWith('¿Qué debo reabastecer?');
    expect((component as any).mensajes()).toEqual([
      { rol: 'usuario', texto: '¿Qué debo reabastecer?' },
      { rol: 'ia', texto: 'Revisa el inventario de bebidas.' }
    ]);
    expect((component as any).cargando()).toBe(false);
  });

  it('uses the explicit chart key instead of sending chart summaries through prompt detection', () => {
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('contexto', 'Saco de papa: 2');
    fixture.componentRef.setInput('tituloContexto', 'Productos más comprados');
    fixture.componentRef.setInput('claveContexto', 'comprados');

    component.resumirGrafico();

    expect(resumirGraficoIA).toHaveBeenCalledWith('comprados');
    expect(consultarIA).not.toHaveBeenCalled();
    expect((component as any).mensajes()).toEqual([
      { rol: 'usuario', texto: 'Resume la estadística "Productos más comprados"' },
      { rol: 'ia', texto: 'Saco de papa: 2 unidades compradas.' }
    ]);
  });

  it('shows the backend error in a snackbar without presenting it as an assistant reply', () => {
    const mensaje = 'El servicio de IA no está disponible en este momento.';
    consultarIA.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { isSuccess: false, message: mensaje, data: null }
          })
      )
    );
    const component = fixture.componentInstance;

    component.enviar('¿Qué productos debería reabastecer?');

    expect(snackBarOpen).toHaveBeenCalledWith(
      mensaje,
      'Cerrar',
      expect.objectContaining({ panelClass: ['error-snackbar'] })
    );
    expect((component as any).mensajes()).toEqual([
      { rol: 'usuario', texto: '¿Qué productos debería reabastecer?' }
    ]);
    expect((component as any).cargando()).toBe(false);
  });

  it('uses a connection fallback when the error has no backend message', () => {
    consultarIA.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    const component = fixture.componentInstance;

    component.enviar('¿Qué productos debería reabastecer?');

    expect(snackBarOpen).toHaveBeenCalledWith(
      'No se pudo conectar con el asistente. Intenta nuevamente.',
      'Cerrar',
      expect.objectContaining({ panelClass: ['error-snackbar'] })
    );
  });

  it('ignores blank messages and clears the conversation on request', () => {
    const component = fixture.componentInstance;
    component.enviar('   ');

    expect(consultarIA).not.toHaveBeenCalled();
    component.enviar('Hola');
    component.limpiar();
    expect((component as any).mensajes()).toEqual([]);
  });
});
