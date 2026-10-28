import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CompraService } from '../../../core/services/compra.service';
import { LoginService } from '../../../core/services/login.service';
import { CompraInicioComponent } from './compra-inicio.component';
import { createPageFixture } from '../../../shared/utility/test';

describe('CompraInicioComponent', () => {
  let fixture: Awaited<ReturnType<typeof createPageFixture<CompraInicioComponent>>>;
  let snackBar: { open: ReturnType<typeof vi.fn> };
  let compraService: {
    obtenerNuevoNumeroDocumento: ReturnType<typeof vi.fn>;
    registrar: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    snackBar = { open: vi.fn() };
    compraService = {
      obtenerNuevoNumeroDocumento: vi.fn(() => of({ data: '00001' })),
      registrar: vi.fn(() => of({ isSuccess: true }))
    };
    fixture = await createPageFixture(CompraInicioComponent, [
      { provide: CompraService, useValue: compraService },
      { provide: LoginService, useValue: { obtenerDatosToken: vi.fn(() => null) } },
      { provide: MatSnackBar, useValue: snackBar },
      { provide: Router, useValue: { navigate: vi.fn() } },
      { provide: MatDialog, useValue: { open: vi.fn() } }
    ]);
  });

  it('rejects fractional quantities before adding a purchase line', () => {
    const component = fixture.componentInstance;
    component.productoSeleccionado = { id_Producto: 12, nombre_Producto: 'Arroz' } as never;
    component.producto = { precioCompra: 2.5, precioVenta: 3, cantidad: 1.5, subTotal: 0 };

    component.agregarProducto();

    expect(component.productosAgregados).toEqual([]);
    expect(snackBar.open).toHaveBeenCalledWith(
      'La cantidad debe ser un número entero.',
      'Cerrar',
      expect.objectContaining({ panelClass: ['error-snackbar'] })
    );
  });

  it('adds a valid product and calculates its purchase subtotal', () => {
    const component = fixture.componentInstance;
    component.productoSeleccionado = {
      id_Producto: 12,
      nombre_Producto: 'Arroz'
    } as never;
    component.producto = { precioCompra: 2.5, precioVenta: 3, cantidad: 3, subTotal: 0 };

    component.agregarProducto();

    expect(component.productosAgregados).toEqual([
      { id: 12, nombre: 'Arroz', precioCompra: 2.5, precioVenta: 3, cantidad: 3, subtotal: 7.5 }
    ]);
    expect(component.calcularTotal()).toBe(7.5);
    expect(component.productoSeleccionado).toBeNull();
  });

  it('requires a supplier before submitting a purchase', () => {
    fixture.componentInstance.registrarCompra();

    expect(compraService.registrar).not.toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith(
      'Debe seleccionar un proveedor.',
      'Cerrar',
      expect.objectContaining({ panelClass: ['error-snackbar'] })
    );
  });
});
