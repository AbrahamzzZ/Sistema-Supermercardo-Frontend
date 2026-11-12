import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IProducto } from '../../../../core/interfaces/producto';
import { ProductoService } from '../../../../core/services/producto.service';
import { ARQUITECTURA_BACKEND } from '../../../../core/services/producto-stock.service';
import { ModalProductoComponent } from './modal-producto.component';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../../../../environments/environment';

describe('ModalProductoComponent', () => {
  let component: ModalProductoComponent;
  let fixture: ComponentFixture<ModalProductoComponent>;
  let productoServiceMock: { lista: ReturnType<typeof vi.fn> };
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };

  const productos: IProducto[] = [
    {
      id_Producto: 1,
      codigo: 'PRO-001',
      descripcion: 'Café molido',
      nombre_Producto: 'Café',
      pais_Origen: 'Ecuador',
      stock: 0,
      precio_Compra: 1,
      precio_Venta: 2,
      estado: false
    },
    {
      id_Producto: 2,
      codigo: 'PRO-002',
      descripcion: 'Té negro',
      nombre_Producto: 'Té',
      pais_Origen: 'India',
      stock: 8,
      precio_Compra: 1,
      precio_Venta: 2,
      estado: true
    },
    {
      id_Producto: 3,
      codigo: 'PRO-003',
      descripcion: 'Arroz integral',
      nombre_Producto: 'Arroz',
      pais_Origen: 'Ecuador',
      stock: 0,
      precio_Compra: 1,
      precio_Venta: 2,
      estado: false
    }
  ];

  beforeEach(async () => {
    productoServiceMock = { lista: vi.fn(() => of({ data: productos })) };
    dialogRefMock = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ModalProductoComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ProductoService, useValue: productoServiceMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
        // Por defecto como el monolito: los productos ya traen stock y precios
        { provide: ARQUITECTURA_BACKEND, useValue: 'monolito' }
      ]
    }).compileComponents();
  });

  it('microservices: fills the stock from Inventory with a single request', () => {
    const sinStock = productos.map(
      ({ stock, precio_Compra, precio_Venta, ...p }) => p as IProducto
    );
    productoServiceMock.lista.mockReturnValue(of({ data: sinStock }));
    TestBed.overrideProvider(ARQUITECTURA_BACKEND, { useValue: 'microservicios' });
    const http = TestBed.inject(HttpTestingController);

    crearComponente();
    http.expectOne(`${environment.API.inventory}ProductoStock`).flush({
      isSuccess: true,
      data: [{ idProducto: 1, stock: 15, precioCompra: 1, precioVenta: 1.5 }]
    });

    // El producto 3 nunca se compró: no tiene registro en Inventory y queda en 0
    expect(component.dataSource.data.map((p) => [p.id_Producto, p.stock])).toEqual([
      [1, 15],
      [3, 0]
    ]);
    http.verify();
  });

  function crearComponente(): void {
    fixture = TestBed.createComponent(ModalProductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('loads products whose state is false for selection', () => {
    crearComponente();

    expect(productoServiceMock.lista).toHaveBeenCalledOnce();
    expect(component.dataSource.data).toEqual([productos[0], productos[2]]);
  });

  it('filters the available products by name and code', () => {
    crearComponente();

    component.aplicarFiltro({ target: { value: '  CAFÉ ' } } as unknown as Event);
    expect(component.dataSource.filteredData).toEqual([productos[0]]);

    component.aplicarFiltro({ target: { value: 'PRO-001' } } as unknown as Event);
    expect(component.dataSource.filteredData).toEqual([productos[0]]);
  });

  it('clears the input and resets the product filter', () => {
    crearComponente();
    component.aplicarFiltro({ target: { value: 'café' } } as unknown as Event);
    const input = document.createElement('input');
    input.value = 'café';

    component.limpiarFiltro(input);

    expect(input.value).toBe('');
    expect(component.filtro).toBe('');
    expect(component.dataSource.filteredData).toEqual([productos[0], productos[2]]);
  });

  it('closes with the selected product or without a value when dismissed', () => {
    crearComponente();

    component.seleccionarProducto(productos[0]);
    component.cerrar();

    expect(dialogRefMock.close).toHaveBeenNthCalledWith(1, productos[0]);
    expect(dialogRefMock.close).toHaveBeenNthCalledWith(2);
  });

  it('maps product availability to its display label', () => {
    crearComponente();

    expect(component.getEstado(true)).toBe('Agotado');
    expect(component.getEstado(false)).toBe('No Agotado');
  });

  it('logs a service error without throwing from the modal', () => {
    const error = new Error('Request failed');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    productoServiceMock.lista.mockReturnValue(throwError(() => error));

    expect(crearComponente).not.toThrow();
    expect(consoleError).toHaveBeenCalledWith(error);

    consoleError.mockRestore();
  });
});
