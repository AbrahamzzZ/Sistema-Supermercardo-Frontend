import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginService } from '../../../core/services/login.service';
import { OfertaService } from '../../../core/services/oferta.service';
import { ProductoService } from '../../../core/services/producto.service';
import { InicioComponent } from './inicio.component';
import { createPageFixture } from '../../../shared/utility/test';

describe('InicioComponent', () => {
  let fixture: Awaited<ReturnType<typeof createPageFixture<InicioComponent>>>;
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    router = { navigate: vi.fn() };
    fixture = await createPageFixture(InicioComponent, [
      { provide: MatSnackBar, useValue: { open: vi.fn() } },
      { provide: OfertaService, useValue: { lista: vi.fn(() => of({ data: [] })) } },
      {
        provide: ProductoService,
        useValue: {
          lista: vi.fn(() =>
            of({
              data: [
                { id_Producto: 1, estado: true, stock: 3 },
                { id_Producto: 2, estado: false, stock: 2 },
                { id_Producto: 3, estado: true, stock: 10 }
              ]
            })
          )
        }
      },
      {
        provide: LoginService,
        useValue: {
          esAdministrador: vi.fn(() => true),
          obtenerDatosToken: vi.fn(() => ({ unique_name: 'Ana', role: 'Administrador' }))
        }
      },
      { provide: Router, useValue: router }
    ]);
    fixture.detectChanges();
  });

  it('shows only active products below the stock threshold', () => {
    expect((fixture.componentInstance as any).productosStockBajo()).toEqual([
      { id_Producto: 1, estado: true, stock: 3 }
    ]);
  });

  it('uses the selected business and quick-action route', () => {
    const component = fixture.componentInstance;
    component.alCargarNegocio({ nombre: 'Mercado Central' } as never);
    component.irA('/producto/registro');

    expect((component as any).nombreNegocio()).toBe('Mercado Central');
    expect(router.navigate).toHaveBeenCalledWith(['/producto/registro']);
  });
});
