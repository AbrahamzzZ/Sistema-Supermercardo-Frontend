import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ISucursal } from '../../../../core/interfaces/sucursal';
import { SucursalService } from '../../../../core/services/sucursal.service';
import { ModalSucursalComponent } from './modal-sucursal.component';

describe('ModalSucursalComponent', () => {
  let component: ModalSucursalComponent;
  let fixture: ComponentFixture<ModalSucursalComponent>;
  let sucursalServiceMock: { lista: ReturnType<typeof vi.fn> };
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };

  const sucursales: ISucursal[] = [
    {
      id_Sucursal: 1,
      id_Negocio: 4,
      codigo: 'SUC-001',
      nombre_Sucursal: 'Centro',
      direccion_Sucursal: 'Av. Principal',
      latitud: -0.2,
      longitud: -78.5,
      ciudad_Sucursal: 'Quito',
      estado: true
    },
    {
      id_Sucursal: 2,
      id_Negocio: 4,
      codigo: 'SUC-002',
      nombre_Sucursal: 'Norte',
      direccion_Sucursal: 'Calle Secundaria',
      latitud: -0.1,
      longitud: -78.4,
      ciudad_Sucursal: 'Quito',
      estado: false
    },
    {
      id_Sucursal: 3,
      id_Negocio: 4,
      codigo: 'SUC-003',
      nombre_Sucursal: 'Sur',
      direccion_Sucursal: 'Av. del Parque',
      latitud: -0.3,
      longitud: -78.6,
      ciudad_Sucursal: 'Quito',
      estado: true
    }
  ];

  beforeEach(async () => {
    sucursalServiceMock = { lista: vi.fn(() => of({ data: sucursales })) };
    dialogRefMock = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ModalSucursalComponent],
      providers: [
        { provide: SucursalService, useValue: sucursalServiceMock },
        { provide: MatDialogRef, useValue: dialogRefMock }
      ]
    }).compileComponents();
  });

  function crearComponente(): void {
    fixture = TestBed.createComponent(ModalSucursalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('loads only open branches', () => {
    crearComponente();

    expect(sucursalServiceMock.lista).toHaveBeenCalledOnce();
    expect(component.dataSource.data).toEqual([sucursales[0], sucursales[2]]);
  });

  it('filters branches by name, address, and code', () => {
    crearComponente();

    component.aplicarFiltro({ target: { value: '  PRINCIPAL ' } } as unknown as Event);
    expect(component.dataSource.filteredData).toEqual([sucursales[0]]);

    component.aplicarFiltro({ target: { value: 'SUC-001' } } as unknown as Event);
    expect(component.dataSource.filteredData).toEqual([sucursales[0]]);
  });

  it('clears the input and resets the branch filter', () => {
    crearComponente();
    component.aplicarFiltro({ target: { value: 'centro' } } as unknown as Event);
    const input = document.createElement('input');
    input.value = 'centro';

    component.limpiarFiltro(input);

    expect(input.value).toBe('');
    expect(component.filtro).toBe('');
    expect(component.dataSource.filteredData).toEqual([sucursales[0], sucursales[2]]);
  });

  it('closes with the selected branch or without a value when dismissed', () => {
    crearComponente();

    component.seleccionarSucursal(sucursales[0]);
    component.cerrar();

    expect(dialogRefMock.close).toHaveBeenNthCalledWith(1, sucursales[0]);
    expect(dialogRefMock.close).toHaveBeenNthCalledWith(2);
  });

  it('maps branch states to their user-facing labels', () => {
    crearComponente();

    expect(component.getEstado(true)).toBe('Abierto');
    expect(component.getEstado(false)).toBe('Cerrado');
  });

  it('logs a service error without throwing from the modal', () => {
    const error = new Error('Request failed');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    sucursalServiceMock.lista.mockReturnValue(throwError(() => error));

    expect(crearComponente).not.toThrow();
    expect(consoleError).toHaveBeenCalledWith(error);

    consoleError.mockRestore();
  });
});
