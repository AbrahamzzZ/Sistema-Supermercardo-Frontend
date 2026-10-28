import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NegocioService } from '../../../../core/services/negocio.service';
import { VentaService } from '../../../../core/services/venta.service';
import { DetalleVentaComponent } from './detalle-venta.component';
import { createPageFixture } from '../../../../shared/utility/test';

describe('DetalleVentaComponent', () => {
  let fixture: Awaited<ReturnType<typeof createPageFixture<DetalleVentaComponent>>>;
  let ventaService: {
    obtener: ReturnType<typeof vi.fn>;
    obtenerDetalleVenta: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    ventaService = {
      obtener: vi.fn(() => of({ data: undefined })),
      obtenerDetalleVenta: vi.fn(() => of({ data: [] }))
    };
    fixture = await createPageFixture(DetalleVentaComponent, [
      { provide: VentaService, useValue: ventaService },
      {
        provide: NegocioService,
        useValue: { obtener: vi.fn(() => of({ data: { nombre: 'Tienda' } })) }
      },
      { provide: MatSnackBar, useValue: { open: vi.fn() } }
    ]);
    fixture.detectChanges();
  });

  it('shows a validation message without querying a malformed document number', () => {
    const component = fixture.componentInstance;

    component.filtrarVenta('123');

    expect(component.mensajeBusqueda).toBe(
      'No existe ningún detalle de venta con ese número de documento.'
    );
    expect(ventaService.obtener).not.toHaveBeenCalled();
  });

  it('does not make a request for a blank document number', () => {
    const component = fixture.componentInstance;

    component.filtrarVenta('  ');

    expect(component.mensajeBusqueda).toBe('');
    expect(ventaService.obtener).not.toHaveBeenCalled();
  });
});
