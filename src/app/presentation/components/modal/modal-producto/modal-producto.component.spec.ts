import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IProducto } from '../../../../core/interfaces/producto';
import { ProductoService } from '../../../../core/services/producto.service';
import { ModalProductoComponent } from './modal-producto.component';

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
      estado: false
    },
    {
      id_Producto: 2,
      codigo: 'PRO-002',
      descripcion: 'Té negro',
      nombre_Producto: 'Té',
      pais_Origen: 'India',
      stock: 8,
      estado: true
    },
    {
      id_Producto: 3,
      codigo: 'PRO-003',
      descripcion: 'Arroz integral',
      nombre_Producto: 'Arroz',
      pais_Origen: 'Ecuador',
      stock: 0,
      estado: false
    }
  ];

  beforeEach(async () => {
    productoServiceMock = { lista: vi.fn(() => of({ data: productos })) };
    dialogRefMock = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ModalProductoComponent],
      providers: [
        { provide: ProductoService, useValue: productoServiceMock },
        { provide: MatDialogRef, useValue: dialogRefMock }
      ]
    }).compileComponents();
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
