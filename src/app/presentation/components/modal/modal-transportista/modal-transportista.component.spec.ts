import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ITransportista } from '../../../../core/interfaces/transportista';
import { TransportistaService } from '../../../../core/services/transportista.service';
import { ModalTransportistaComponent } from './modal-transportista.component';

describe('ModalTransportistaComponent', () => {
  let component: ModalTransportistaComponent;
  let fixture: ComponentFixture<ModalTransportistaComponent>;
  let transportistaServiceMock: { lista: ReturnType<typeof vi.fn> };
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };

  const transportistas: ITransportista[] = [
    {
      id_Transportista: 1,
      codigo: 'TRA-001',
      nombres: 'Elena',
      apellidos: 'Vega',
      cedula: '0102030405',
      telefono: '0991111111',
      correo_Electronico: 'elena@example.com',
      estado: true
    },
    {
      id_Transportista: 2,
      codigo: 'TRA-002',
      nombres: 'Pedro',
      apellidos: 'Mora',
      cedula: '0203040506',
      telefono: '0992222222',
      correo_Electronico: 'pedro@example.com',
      estado: false
    },
    {
      id_Transportista: 3,
      codigo: 'TRA-003',
      nombres: 'Sonia',
      apellidos: 'Rivas',
      cedula: '0304050607',
      telefono: '0993333333',
      correo_Electronico: 'sonia@example.com',
      estado: true
    }
  ];

  beforeEach(async () => {
    transportistaServiceMock = { lista: vi.fn(() => of({ data: transportistas })) };
    dialogRefMock = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ModalTransportistaComponent],
      providers: [
        { provide: TransportistaService, useValue: transportistaServiceMock },
        { provide: MatDialogRef, useValue: dialogRefMock }
      ]
    }).compileComponents();
  });

  function crearComponente(): void {
    fixture = TestBed.createComponent(ModalTransportistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('loads only active carriers', () => {
    crearComponente();

    expect(transportistaServiceMock.lista).toHaveBeenCalledOnce();
    expect(component.dataSource.data).toEqual([transportistas[0], transportistas[2]]);
  });

  it('filters carriers by name, surname, and code', () => {
    crearComponente();

    component.aplicarFiltro({ target: { value: '  VEGA ' } } as unknown as Event);
    expect(component.dataSource.filteredData).toEqual([transportistas[0]]);

    component.aplicarFiltro({ target: { value: 'TRA-001' } } as unknown as Event);
    expect(component.dataSource.filteredData).toEqual([transportistas[0]]);
  });

  it('clears the input and resets the carrier filter', () => {
    crearComponente();
    component.aplicarFiltro({ target: { value: 'elena' } } as unknown as Event);
    const input = document.createElement('input');
    input.value = 'elena';

    component.limpiarFiltro(input);

    expect(input.value).toBe('');
    expect(component.filtro).toBe('');
    expect(component.dataSource.filteredData).toEqual([transportistas[0], transportistas[2]]);
  });

  it('closes with the selected carrier or without a value when dismissed', () => {
    crearComponente();

    component.seleccionarTransportista(transportistas[0]);
    component.cerrar();

    expect(dialogRefMock.close).toHaveBeenNthCalledWith(1, transportistas[0]);
    expect(dialogRefMock.close).toHaveBeenNthCalledWith(2);
  });

  it('maps carrier states to their user-facing labels', () => {
    crearComponente();

    expect(component.getEstado(true)).toBe('Activo');
    expect(component.getEstado(false)).toBe('No Activo');
  });

  it('logs a service error without throwing from the modal', () => {
    const error = new Error('Request failed');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    transportistaServiceMock.lista.mockReturnValue(throwError(() => error));

    expect(crearComponente).not.toThrow();
    expect(consoleError).toHaveBeenCalledWith(error);

    consoleError.mockRestore();
  });
});
