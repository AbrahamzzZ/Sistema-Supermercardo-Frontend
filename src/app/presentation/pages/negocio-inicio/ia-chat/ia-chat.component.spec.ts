import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NegocioService } from '../../../../core/services/negocio.service';
import { IaChatComponent } from './ia-chat.component';
import { createPageFixture } from '../../../../shared/utility/test';

describe('IaChatComponent', () => {
  let fixture: Awaited<ReturnType<typeof createPageFixture<IaChatComponent>>>;
  let consultarIA: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    consultarIA = vi.fn(() => of({ data: 'Revisa el inventario de bebidas.' }));
    fixture = await createPageFixture(IaChatComponent, [
      { provide: NegocioService, useValue: { consultarIA } }
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

  it('ignores blank messages and clears the conversation on request', () => {
    const component = fixture.componentInstance;
    component.enviar('   ');

    expect(consultarIA).not.toHaveBeenCalled();
    component.enviar('Hola');
    component.limpiar();
    expect((component as any).mensajes()).toEqual([]);
  });
});
