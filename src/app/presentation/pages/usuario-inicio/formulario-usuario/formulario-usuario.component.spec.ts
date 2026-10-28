import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FormularioUsuarioComponent } from './formulario-usuario.component';
import { createPageFixture } from '../../../../shared/utility/test';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { RolService } from '../../../../core/services/rol.service';

describe('FormularioUsuarioComponent', () => {
  let fixture: Awaited<ReturnType<typeof createPageFixture<FormularioUsuarioComponent>>>;
  let serviceMocks: ReturnType<typeof vi.fn>[];

  beforeEach(async () => {
    serviceMocks = [vi.fn()];
    fixture = await createPageFixture(FormularioUsuarioComponent, [
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { params: {} }, queryParams: { subscribe: vi.fn() } }
      },
      { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } },
      { provide: MatSnackBar, useValue: { open: vi.fn() } },
      {
        provide: UsuarioService,
        useValue: { registrar: serviceMocks[0], editar: serviceMocks[0] }
      },
      { provide: RolService, useValue: { registrar: serviceMocks[0], editar: serviceMocks[0] } }
    ]);
  });

  it('allows leaving an untouched form', () => {
    expect(fixture.componentInstance.canDeactive()).toBe(true);
  });

  it('blocks leaving after a form value changes', () => {
    const model = (fixture.componentInstance as any).usuarioModel;
    model.update((value: any) => ({ ...value, nombre_Completo: 'Updated value' }));
    expect(fixture.componentInstance.canDeactive()).toBe(false);
  });

  it('does not call the save service while required fields are empty', async () => {
    await fixture.componentInstance.guardar();
    for (const serviceMock of serviceMocks) {
      expect(serviceMock).not.toHaveBeenCalled();
    }
  });
});
