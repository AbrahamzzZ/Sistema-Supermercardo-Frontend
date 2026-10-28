import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FormularioOfertaComponent } from './formulario-oferta.component';
import { createPageFixture } from '../../../../shared/utility/test';
import { OfertaService } from '../../../../core/services/oferta.service';
import { ProductoService } from '../../../../core/services/producto.service';

describe('FormularioOfertaComponent', () => {
  let fixture: Awaited<ReturnType<typeof createPageFixture<FormularioOfertaComponent>>>;
  let serviceMocks: ReturnType<typeof vi.fn>[];

  beforeEach(async () => {
    serviceMocks = [vi.fn()];
    fixture = await createPageFixture(FormularioOfertaComponent, [
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { params: {} }, queryParams: { subscribe: vi.fn() } }
      },
      { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } },
      { provide: MatSnackBar, useValue: { open: vi.fn() } },
      { provide: OfertaService, useValue: { registrar: serviceMocks[0], editar: serviceMocks[0] } },
      {
        provide: ProductoService,
        useValue: { registrar: serviceMocks[0], editar: serviceMocks[0] }
      }
    ]);
  });

  it('allows leaving an untouched form', () => {
    expect(fixture.componentInstance.canDeactive()).toBe(true);
  });

  it('blocks leaving after a form value changes', () => {
    const model = (fixture.componentInstance as any).ofertaModel;
    model.update((value: any) => ({ ...value, nombre: 'Updated value' }));
    expect(fixture.componentInstance.canDeactive()).toBe(false);
  });

  it('does not call the save service while required fields are empty', async () => {
    await fixture.componentInstance.guardar();
    for (const serviceMock of serviceMocks) {
      expect(serviceMock).not.toHaveBeenCalled();
    }
  });
});
