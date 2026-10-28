import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IOfertaProducto } from '../../../../core/interfaces/Dto/ioferta-producto';
import { OfertaService } from '../../../../core/services/oferta.service';
import { ModalOfertaComponent } from './modal-oferta.component';

describe('ModalOfertaComponent', () => {
  let component: ModalOfertaComponent;
  let fixture: ComponentFixture<ModalOfertaComponent>;
  let ofertaServiceMock: { lista: ReturnType<typeof vi.fn> };
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };

  const ofertas: IOfertaProducto[] = [
    {
      id_Oferta: 1,
      codigo: 'OFE-001',
      nombre_Oferta: 'Descuento de café',
      id_Producto: 9,
      nombre_Producto: 'Café',
      descripcion: 'Oferta de temporada',
      fecha_Inicio: '2026-01-01',
      fecha_Fin: '2026-12-31',
      descuento: 10,
      estado: true,
      fecha_Creacion: '2026-01-01'
    },
    {
      id_Oferta: 2,
      codigo: 'OFE-002',
      nombre_Oferta: 'Oferta vencida',
      id_Producto: 10,
      nombre_Producto: 'Té',
      descripcion: 'Oferta anterior',
      fecha_Inicio: '2025-01-01',
      fecha_Fin: '2025-12-31',
      descuento: 5,
      estado: false,
      fecha_Creacion: '2025-01-01'
    },
    {
      id_Oferta: 3,
      codigo: 'OFE-003',
      nombre_Oferta: 'Descuento de arroz',
      id_Producto: 11,
      nombre_Producto: 'Arroz',
      descripcion: 'Oferta de granos',
      fecha_Inicio: '2026-02-01',
      fecha_Fin: '2026-12-31',
      descuento: 8,
      estado: true,
      fecha_Creacion: '2026-02-01'
    }
  ];

  beforeEach(async () => {
    ofertaServiceMock = { lista: vi.fn(() => of({ data: ofertas })) };
    dialogRefMock = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ModalOfertaComponent],
      providers: [
        { provide: OfertaService, useValue: ofertaServiceMock },
        { provide: MatDialogRef, useValue: dialogRefMock }
      ]
    }).compileComponents();
  });

  function crearComponente(): void {
    fixture = TestBed.createComponent(ModalOfertaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('loads only active offers', () => {
    crearComponente();

    expect(ofertaServiceMock.lista).toHaveBeenCalledOnce();
    expect(component.dataSource.data).toEqual([ofertas[0], ofertas[2]]);
  });

  it('filters active offers by offer name, product name, and code', () => {
    crearComponente();

    component.aplicarFiltro({ target: { value: '  CAFÉ ' } } as unknown as Event);
    expect(component.dataSource.filteredData).toEqual([ofertas[0]]);

    component.aplicarFiltro({ target: { value: 'OFE-001' } } as unknown as Event);
    expect(component.dataSource.filteredData).toEqual([ofertas[0]]);
  });

  it('clears the input and resets the offer filter', () => {
    crearComponente();
    component.aplicarFiltro({ target: { value: 'café' } } as unknown as Event);
    const input = document.createElement('input');
    input.value = 'café';

    component.limpiarFiltro(input);

    expect(input.value).toBe('');
    expect(component.filtro).toBe('');
    expect(component.dataSource.filteredData).toEqual([ofertas[0], ofertas[2]]);
  });

  it('closes with the selected offer or without a value when dismissed', () => {
    crearComponente();

    component.seleccionarOferta(ofertas[0]);
    component.cerrar();

    expect(dialogRefMock.close).toHaveBeenNthCalledWith(1, ofertas[0]);
    expect(dialogRefMock.close).toHaveBeenNthCalledWith(2);
  });

  it('maps offer states to their user-facing labels', () => {
    crearComponente();

    expect(component.getEstado(true)).toBe('Activo');
    expect(component.getEstado(false)).toBe('No Activo');
  });

  it('logs a service error without throwing from the modal', () => {
    const error = new Error('Request failed');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    ofertaServiceMock.lista.mockReturnValue(throwError(() => error));

    expect(crearComponente).not.toThrow();
    expect(consoleError).toHaveBeenCalledWith(error);

    consoleError.mockRestore();
  });
});
