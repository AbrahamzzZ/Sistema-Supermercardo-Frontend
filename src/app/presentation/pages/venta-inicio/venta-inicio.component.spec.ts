import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginService } from '../../../core/services/login.service';
import { OfertaService } from '../../../core/services/oferta.service';
import { VentaService } from '../../../core/services/venta.service';
import { VentaInicioComponent } from './venta-inicio.component';
import { createPageFixture } from '../../../shared/utility/test';

describe('VentaInicioComponent', () => {
  let fixture: Awaited<ReturnType<typeof createPageFixture<VentaInicioComponent>>>;
  let snackBar: { open: ReturnType<typeof vi.fn> };
  let ventaService: {
    obtenerNuevoNumeroDocumento: ReturnType<typeof vi.fn>;
    registrar: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    snackBar = { open: vi.fn() };
    ventaService = {
      obtenerNuevoNumeroDocumento: vi.fn(() => of({ data: '00001' })),
      registrar: vi.fn(() => of({ isSuccess: true }))
    };
    fixture = await createPageFixture(VentaInicioComponent, [
      { provide: VentaService, useValue: ventaService },
      { provide: OfertaService, useValue: { lista: vi.fn(() => of({ data: [] })) } },
      { provide: LoginService, useValue: { obtenerDatosToken: vi.fn(() => null) } },
      { provide: MatSnackBar, useValue: snackBar },
      { provide: Router, useValue: { navigate: vi.fn() } },
      { provide: MatDialog, useValue: { open: vi.fn() } }
    ]);
  });

  it('applies the selected offer when adding a product', () => {
    const component = fixture.componentInstance;
    component.productoSeleccionado = {
      id_Producto: 4,
      nombre_Producto: 'Café',
      precio_Venta: 10,
      stock: 5
    } as never;
    component.ofertaSeleccionado = { descuento: 10 } as never;
    component.producto = { precioVenta: 10, cantidad: 2, subTotal: 0, descuento: 0 };

    component.agregarProducto();

    expect(component.productosAgregados).toEqual([
      { id: 4, nombre: 'Café', precioVenta: 10, cantidad: 2, descuento: 10, subtotal: 18 }
    ]);
    expect(component.calcularTotal()).toBe(18);
    expect(component.montoDescuento).toBe(2);
  });

  it('rejects quantities that exceed available stock', () => {
    const component = fixture.componentInstance;
    component.productoSeleccionado = {
      id_Producto: 4,
      nombre_Producto: 'Café',
      precio_Venta: 10,
      stock: 1
    } as never;
    component.producto = { precioVenta: 10, cantidad: 2, subTotal: 0, descuento: 0 };

    component.agregarProducto();

    expect(component.productosAgregados).toEqual([]);
    expect(snackBar.open).toHaveBeenCalledWith(
      'La cantidad acumulada supera al stock del producto.',
      'Cerrar',
      expect.objectContaining({ panelClass: ['error-snackbar'] })
    );
  });

  it('requires a customer before submitting a sale', () => {
    fixture.componentInstance.registrarVenta();

    expect(ventaService.registrar).not.toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith(
      'Debe seleccionar un cliente.',
      'Cerrar',
      expect.objectContaining({ panelClass: ['error-snackbar'] })
    );
  });
});
