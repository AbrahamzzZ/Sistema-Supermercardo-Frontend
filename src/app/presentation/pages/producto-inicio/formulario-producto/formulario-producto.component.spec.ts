import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FormularioProductoComponent } from './formulario-producto.component';
import { createPageFixture } from '../../../../shared/utility/test';
import { ProductoService } from '../../../../core/services/producto.service';
import { CategoriaService } from '../../../../core/services/categoria.service';

describe('FormularioProductoComponent', () => {
  let fixture: Awaited<ReturnType<typeof createPageFixture<FormularioProductoComponent>>>;
  let serviceMocks: ReturnType<typeof vi.fn>[];

  beforeEach(async () => {
    serviceMocks = [vi.fn()];
    fixture = await createPageFixture(FormularioProductoComponent, [
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { params: {} }, queryParams: { subscribe: vi.fn() } }
      },
      { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } },
      { provide: MatSnackBar, useValue: { open: vi.fn() } },
      {
        provide: ProductoService,
        useValue: { registrar: serviceMocks[0], editar: serviceMocks[0] }
      },
      {
        provide: CategoriaService,
        useValue: { registrar: serviceMocks[0], editar: serviceMocks[0] }
      }
    ]);
  });

  it('allows leaving an untouched form', () => {
    expect(fixture.componentInstance.canDeactive()).toBe(true);
  });

  it('blocks leaving after a form value changes', () => {
    const model = (fixture.componentInstance as any).productoModel;
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
