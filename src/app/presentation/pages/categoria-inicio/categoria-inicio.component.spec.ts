import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ICategoria } from '../../../core/interfaces/categoria';
import { ApiPaginado } from '../../../core/setting/api/apiPaginado';
import { ApiResponse } from '../../../core/setting/api/apiResponse';
import { CategoriaService } from '../../../core/services/categoria.service';
import { CategoriaInicioComponent } from './categoria-inicio.component';

describe('CategoriaInicioComponent', () => {
  let component: CategoriaInicioComponent;
  let fixture: ComponentFixture<CategoriaInicioComponent>;

  const categorias: ICategoria[] = [
    {
      id_Categoria: 7,
      codigo: 'CAT-007',
      nombre_Categoria: 'Bebidas',
      estado: true,
      fecha_Creacion: '2026-01-15'
    }
  ];

  const recurso = {
    hasValue: signal(true),
    value: signal<ApiResponse<ApiPaginado<ICategoria>> | undefined>({
      isSuccess: true,
      message: '',
      data: {
        items: categorias,
        totalCount: categorias.length,
        pageNumber: 1,
        pageSize: 5
      }
    }),
    isLoading: signal(false),
    error: signal<Error | undefined>(undefined),
    reload: vi.fn()
  };

  let respuestaDialogo: boolean | undefined;
  let categoriaServiceMock: {
    listaPaginada: ReturnType<typeof vi.fn>;
    eliminar: ReturnType<typeof vi.fn>;
  };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let dialogMock: { open: ReturnType<typeof vi.fn> };
  let snackBarMock: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    recurso.hasValue.set(true);
    recurso.value.set({
      isSuccess: true,
      message: '',
      data: {
        items: categorias,
        totalCount: categorias.length,
        pageNumber: 1,
        pageSize: 5
      }
    });
    recurso.isLoading.set(false);
    recurso.error.set(undefined);
    recurso.reload.mockClear();
    respuestaDialogo = undefined;

    categoriaServiceMock = {
      listaPaginada: vi.fn(() => recurso),
      eliminar: vi.fn(() => of({ isSuccess: true, message: '', data: true }))
    };
    routerMock = { navigate: vi.fn().mockResolvedValue(true) };
    dialogMock = {
      open: vi.fn(() => ({
        afterClosed: () => of(respuestaDialogo)
      }))
    };
    snackBarMock = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [CategoriaInicioComponent],
      providers: [
        { provide: CategoriaService, useValue: categoriaServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: MatSnackBar, useValue: snackBarMock }
      ]
    }).compileComponents();
  });

  function crearComponente(): void {
    fixture = TestBed.createComponent(CategoriaInicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    crearComponente();

    expect(component).toBeTruthy();
  });

  it('loads categories into the component list', () => {
    crearComponente();

    expect(component.items()).toEqual(categorias);
    expect(component.listaData.data).toEqual(categorias);
  });

  it('navigates to the category registration form', () => {
    crearComponente();

    component.nuevo();

    expect(routerMock.navigate).toHaveBeenCalledWith(['categoria/registro']);
  });

  it('navigates to the selected category edit form', () => {
    crearComponente();

    component.editar(categorias[0]);

    expect(routerMock.navigate).toHaveBeenCalledWith(['categoria/editar', 7]);
  });

  it('does not delete a category when the confirmation is canceled', () => {
    respuestaDialogo = false;
    crearComponente();

    component.eliminar(categorias[0]);

    expect(categoriaServiceMock.eliminar).not.toHaveBeenCalled();
    expect(snackBarMock.open).not.toHaveBeenCalled();
  });

  it('deletes a confirmed category, reloads the list, and shows a success message', () => {
    respuestaDialogo = true;
    crearComponente();

    component.eliminar(categorias[0]);

    expect(categoriaServiceMock.eliminar).toHaveBeenCalledWith(7);
    expect(recurso.reload).toHaveBeenCalled();
    expect(snackBarMock.open).toHaveBeenCalledWith(
      'CategorÃ­a eliminada correctamente.',
      'Cerrar',
      expect.objectContaining({ panelClass: ['success-snackbar'] })
    );
  });

  it('shows an error message when loading categories fails', () => {
    recurso.error.set(new Error('Request failed'));

    crearComponente();

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Error al cargar las categorÃ­as.',
      'Cerrar',
      expect.objectContaining({ panelClass: ['error-snackbar'] })
    );
  });

  it('shows an error message when deleting a category fails', () => {
    respuestaDialogo = true;
    categoriaServiceMock.eliminar.mockReturnValue(throwError(() => new Error('Request failed')));
    crearComponente();

    component.eliminar(categorias[0]);

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Error al eliminar la categorÃ­a.',
      'Cerrar',
      expect.objectContaining({ panelClass: ['error-snackbar'] })
    );
  });
});
