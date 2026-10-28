import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CompraService } from '../../../../core/services/compra.service';
import { NegocioService } from '../../../../core/services/negocio.service';
import { DetalleCompraComponent } from './detalle-compra.component';
import { createPageFixture } from '../../../../shared/utility/test';

describe('DetalleCompraComponent', () => {
  let fixture: Awaited<ReturnType<typeof createPageFixture<DetalleCompraComponent>>>;
  let compraService: {
    obtener: ReturnType<typeof vi.fn>;
    obtenerDetalleCompra: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    compraService = {
      obtener: vi.fn(() => of({ data: undefined })),
      obtenerDetalleCompra: vi.fn(() => of({ data: [] }))
    };
    fixture = await createPageFixture(DetalleCompraComponent, [
      { provide: CompraService, useValue: compraService },
      {
        provide: NegocioService,
        useValue: { obtener: vi.fn(() => of({ data: { nombre: 'Tienda' } })) }
      },
      { provide: MatSnackBar, useValue: { open: vi.fn() } }
    ]);
    fixture.detectChanges();
  });

  it('rejects document numbers that are not five characters long', () => {
    const component = fixture.componentInstance;

    component.filtrarCompra('123');

    expect(component.mensajeBusqueda).toBe('El número de documento debe tener 5 dígitos.');
    expect(compraService.obtener).not.toHaveBeenCalled();
    expect(component.dataSource.data).toEqual([]);
  });

  it('clears the current search when the document number is blank', () => {
    const component = fixture.componentInstance;
    component.compra.patchValue({ numeroDocumento: '54321' });
    component.dataSource.data = [{ id: 1 }];

    component.filtrarCompra('  ');

    expect(component.compra.get('numeroDocumento')?.value).toBeNull();
    expect(component.dataSource.data).toEqual([]);
    expect(compraService.obtener).not.toHaveBeenCalled();
  });
});
