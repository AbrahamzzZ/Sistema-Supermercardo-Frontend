import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IProveedor } from '../../../../core/interfaces/proveedor';
import { ProveedorService } from '../../../../core/services/proveedor.service';
import { ModalProveedorComponent } from './modal-proveedor.component';

describe('ModalProveedorComponent', () => {
  let component: ModalProveedorComponent;
  let fixture: ComponentFixture<ModalProveedorComponent>;
  let proveedorServiceMock: { lista: ReturnType<typeof vi.fn> };
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };

  const proveedores: IProveedor[] = [
    {
      id_Proveedor: 1,
      codigo: 'PRV-001',
      nombres: 'Marta',
      apellidos: 'López',
      cedula: '0102030405',
      telefono: '0991111111',
      correo_Electronico: 'marta@example.com',
      estado: true
    },
    {
      id_Proveedor: 2,
      codigo: 'PRV-002',
      nombres: 'Carlos',
      apellidos: 'Ruiz',
      cedula: '0203040506',
      telefono: '0992222222',
      correo_Electronico: 'carlos@example.com',
      estado: false
    },
    {
      id_Proveedor: 3,
      codigo: 'PRV-003',
      nombres: 'Julia',
      apellidos: 'Torres',
      cedula: '0304050607',
      telefono: '0993333333',
      correo_Electronico: 'julia@example.com',
      estado: true
    }
  ];

  beforeEach(async () => {
    proveedorServiceMock = { lista: vi.fn(() => of({ data: proveedores })) };
    dialogRefMock = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ModalProveedorComponent],
      providers: [
        { provide: ProveedorService, useValue: proveedorServiceMock },
        { provide: MatDialogRef, useValue: dialogRefMock }
      ]
    }).compileComponents();
  });

  function crearComponente(): void {
    fixture = TestBed.createComponent(ModalProveedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('loads only active suppliers', () => {
    crearComponente();

    expect(proveedorServiceMock.lista).toHaveBeenCalledOnce();
    expect(component.dataSource.data).toEqual([proveedores[0], proveedores[2]]);
  });

  it('filters suppliers by name, surname, and code without case sensitivity', () => {
    crearComponente();

    component.aplicarFiltro({ target: { value: '  LÓPEZ ' } } as unknown as Event);
    expect(component.dataSource.filteredData).toEqual([proveedores[0]]);

    component.aplicarFiltro({ target: { value: 'PRV-001' } } as unknown as Event);
    expect(component.dataSource.filteredData).toEqual([proveedores[0]]);
  });

  it('clears the input and resets the supplier filter', () => {
    crearComponente();
    component.aplicarFiltro({ target: { value: 'marta' } } as unknown as Event);
    const input = document.createElement('input');
    input.value = 'marta';

    component.limpiarFiltro(input);

    expect(input.value).toBe('');
    expect(component.filtro).toBe('');
    expect(component.dataSource.filteredData).toEqual([proveedores[0], proveedores[2]]);
  });

  it('closes with the selected supplier or without a value when dismissed', () => {
    crearComponente();

    component.seleccionarProveedor(proveedores[0]);
    component.cerrar();

    expect(dialogRefMock.close).toHaveBeenNthCalledWith(1, proveedores[0]);
    expect(dialogRefMock.close).toHaveBeenNthCalledWith(2);
  });

  it('maps supplier states to their user-facing labels', () => {
    crearComponente();

    expect(component.getEstado(true)).toBe('Activo');
    expect(component.getEstado(false)).toBe('No Activo');
  });

  it('logs a service error without throwing from the modal', () => {
    const error = new Error('Request failed');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    proveedorServiceMock.lista.mockReturnValue(throwError(() => error));

    expect(crearComponente).not.toThrow();
    expect(consoleError).toHaveBeenCalledWith(error);

    consoleError.mockRestore();
  });
});
