import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OfertaService } from '../../../core/services/oferta.service';
import { VentaService } from '../../../core/services/venta.service';
import { VentaInicioComponent } from './venta-inicio.component';
import { createPageFixture } from '../../../shared/utility/test';

describe('VentaInicioComponent', () => {
  let fixture: Awaited<ReturnType<typeof createPageFixture<VentaInicioComponent>>>;
  let snackBar: { open: ReturnType<typeof vi.fn> };
  let dialog: { open: ReturnType<typeof vi.fn> };
  let ventaService: {
    obtenerNuevoNumeroDocumento: ReturnType<typeof vi.fn>;
    registrar: ReturnType<typeof vi.fn>;
  };

  const oferta = (
    id_Producto: number,
    descuento: number,
    inicio: string,
    fin: string,
    estado = true
  ) => ({
    id_Oferta: descuento,
    codigo: 'OF',
    nombre_Oferta: `Oferta ${descuento}%`,
    id_Producto,
    nombre_Producto: 'x',
    descripcion: 'x',
    fecha_Inicio: inicio,
    fecha_Fin: fin,
    descuento,
    estado,
    fecha_Creacion: '2026-01-01'
  });

  beforeEach(async () => {
    snackBar = { open: vi.fn() };
    dialog = { open: vi.fn() };
    ventaService = {
      obtenerNuevoNumeroDocumento: vi.fn(() => of({ isSuccess: true, data: '00001' })),
      registrar: vi.fn(() =>
        of({
          isSuccess: true,
          message: 'Se registró correctamente.',
          data: {
            numero_Documento: '00007',
            monto_Total: 18,
            descuento: 2,
            monto_Pago: 20,
            monto_Cambio: 2
          }
        })
      )
    };
    const ofertas = [
      oferta(4, 10, '2000-01-01', '2999-12-31'), // vigente para el producto 4
      oferta(4, 50, '2000-01-01', '2000-01-31'), // vencida: no se aplica
      oferta(4, 70, '2000-01-01', '2999-12-31', false), // inactiva: no se aplica
      oferta(9, 30, '2000-01-01', '2999-12-31') // de otro producto: no se aplica
    ];
    fixture = await createPageFixture(VentaInicioComponent, [
      { provide: VentaService, useValue: ventaService },
      { provide: OfertaService, useValue: { lista: vi.fn(() => of({ data: ofertas })) } },
      { provide: MatSnackBar, useValue: snackBar },
      { provide: Router, useValue: { navigate: vi.fn() } },
      { provide: MatDialog, useValue: dialog }
    ]);
    fixture.componentInstance.ngOnInit();
  });

  const agregarCafe = (cantidad = 2) => {
    const component = fixture.componentInstance;
    component.productoSeleccionado = {
      id_Producto: 4,
      nombre_Producto: 'Café',
      precio_Venta: 10,
      stock: 5
    } as never;
    component.producto = { precioVenta: 10, cantidad, subTotal: 0, descuento: 0 };
    component.agregarProducto();
  };

  it('applies only the active offer of the product automatically', () => {
    const component = fixture.componentInstance;

    agregarCafe();

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

  describe('al registrar', () => {
    beforeEach(() => {
      const component = fixture.componentInstance;
      component.clienteSeleccionado = { id_Cliente: 1 } as never;
      component.sucursalSelecionada = { id_Sucursal: 2 } as never;
      agregarCafe();
    });

    it('rejects a payment lower than the total', () => {
      fixture.componentInstance.pagaCon = 10;

      fixture.componentInstance.registrarVenta();

      expect(ventaService.registrar).not.toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalledWith(
        'El monto ingresado en "Paga con" es insuficiente.',
        'Cerrar',
        expect.objectContaining({ panelClass: ['error-snackbar'] })
      );
    });

    it('sends only products and quantities, and shows the document number returned by the server', () => {
      fixture.componentInstance.pagaCon = 20;

      fixture.componentInstance.registrarVenta();

      expect(ventaService.registrar).toHaveBeenCalledWith({
        id_Sucursal: 2,
        id_Cliente: 1,
        tipo_Documento: 'Boleta',
        monto_Pago: 20,
        detalles: [{ id_Producto: 4, cantidad: 2 }]
      });
      expect(dialog.open).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ data: { numeroDocumento: '00007' } })
      );
      expect(fixture.componentInstance.productosAgregados).toEqual([]);
      expect(fixture.componentInstance.pagaCon).toBe(0);
    });

    it('shows the backend message when the sale is rejected', () => {
      ventaService.registrar.mockReturnValue(
        throwError(() => ({
          status: 400,
          message: 'Stock insuficiente: Café (disponible 1, solicitado 2)'
        }))
      );
      fixture.componentInstance.pagaCon = 20;

      fixture.componentInstance.registrarVenta();

      expect(snackBar.open).toHaveBeenCalledWith(
        'Stock insuficiente: Café (disponible 1, solicitado 2)',
        'Cerrar',
        expect.objectContaining({ panelClass: ['error-snackbar'] })
      );
      expect(fixture.componentInstance.productosAgregados.length).toBe(1);
      expect(fixture.componentInstance.registrando).toBe(false);
    });
  });
});
