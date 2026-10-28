import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ICliente } from '../../../../core/interfaces/cliente';
import { ClienteService } from '../../../../core/services/cliente.service';
import { ModalClienteComponent } from './modal-cliente.component';

describe('ModalClienteComponent', () => {
  let component: ModalClienteComponent;
  let fixture: ComponentFixture<ModalClienteComponent>;
  let clienteServiceMock: { lista: ReturnType<typeof vi.fn> };
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };

  const clientes: Array<ICliente & { estado?: boolean }> = [
    {
      id_Cliente: 1,
      codigo: 'CLI-001',
      nombres: 'Ana',
      apellidos: 'Pérez',
      cedula: '0102030405',
      telefono: '0991111111',
      correo_Electronico: 'ana@example.com',
      estado: true
    },
    {
      id_Cliente: 2,
      codigo: 'CLI-002',
      nombres: 'Luis',
      apellidos: 'Gómez',
      cedula: '0203040506',
      telefono: '0992222222',
      correo_Electronico: 'luis@example.com',
      estado: false
    },
    {
      id_Cliente: 3,
      codigo: 'CLI-003',
      nombres: 'Sofía',
      apellidos: 'Méndez',
      cedula: '0304050607',
      telefono: '0993333333',
      correo_Electronico: 'sofia@example.com',
      estado: true
    }
  ];

  beforeEach(async () => {
    clienteServiceMock = { lista: vi.fn(() => of({ data: clientes })) };
    dialogRefMock = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ModalClienteComponent],
      providers: [
        { provide: ClienteService, useValue: clienteServiceMock },
        { provide: MatDialogRef, useValue: dialogRefMock }
      ]
    }).compileComponents();
  });

  function crearComponente(): void {
    fixture = TestBed.createComponent(ModalClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('loads clients and excludes records explicitly marked inactive', () => {
    crearComponente();

    expect(clienteServiceMock.lista).toHaveBeenCalledOnce();
    expect(component.dataSource.data).toEqual([clientes[0], clientes[2]]);
  });

  it('accepts a direct array response from the client service', () => {
    clienteServiceMock.lista.mockReturnValue(of([clientes[0]]));
    crearComponente();

    expect(component.dataSource.data).toEqual([clientes[0]]);
  });

  it('filters by case-insensitive name, surname, and identity number', () => {
    crearComponente();

    component.aplicarFiltro({ target: { value: '  PÉREZ ' } } as unknown as Event);
    expect(component.filtro).toBe('  PÉREZ ');
    expect(component.dataSource.filteredData).toEqual([clientes[0]]);

    component.aplicarFiltro({ target: { value: '0102030405' } } as unknown as Event);
    expect(component.dataSource.filteredData).toEqual([clientes[0]]);
  });

  it('clears both the search input and the applied filter', () => {
    crearComponente();
    component.aplicarFiltro({ target: { value: 'ana' } } as unknown as Event);
    const input = document.createElement('input');
    input.value = 'ana';

    component.limpiarFiltro(input);

    expect(input.value).toBe('');
    expect(component.filtro).toBe('');
    expect(component.dataSource.filteredData).toEqual([clientes[0], clientes[2]]);
  });

  it('closes with the selected client or without a value when dismissed', () => {
    crearComponente();

    component.seleccionarCliente(clientes[0]);
    component.cerrar();

    expect(dialogRefMock.close).toHaveBeenNthCalledWith(1, clientes[0]);
    expect(dialogRefMock.close).toHaveBeenNthCalledWith(2);
  });

  it('logs a service error without throwing from the modal', () => {
    const error = new Error('Request failed');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    clienteServiceMock.lista.mockReturnValue(throwError(() => error));

    expect(crearComponente).not.toThrow();
    expect(consoleError).toHaveBeenCalledWith(error);

    consoleError.mockRestore();
  });
});
