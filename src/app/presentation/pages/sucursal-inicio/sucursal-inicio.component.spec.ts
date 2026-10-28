import { signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SucursalService } from '../../../core/services/sucursal.service';
import { SucursalInicioComponent } from './sucursal-inicio.component';
import { createPageFixture } from '../../../shared/utility/test';

describe('SucursalInicioComponent', () => {
  const rows = [{ id_Sucursal: 7, nombre_Sucursal: 'Sucursal' }];
  const resource = {
    hasValue: signal(true),
    value: signal<any>({
      data: { items: rows, totalCount: rows.length, pageNumber: 1, pageSize: 5 }
    }),
    isLoading: signal(false),
    error: signal<any>(undefined),
    reload: vi.fn()
  };
  let fixture: Awaited<ReturnType<typeof createPageFixture<SucursalInicioComponent>>>;
  let serviceMock: { listaPaginada: ReturnType<typeof vi.fn>; eliminar: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let dialogMock: { open: ReturnType<typeof vi.fn> };
  let snackBarMock: { open: ReturnType<typeof vi.fn> };
  let confirmar: boolean;

  beforeEach(async () => {
    resource.hasValue.set(true);
    resource.value.set({
      data: { items: rows, totalCount: rows.length, pageNumber: 1, pageSize: 5 }
    });
    resource.reload.mockClear();
    confirmar = true;
    serviceMock = {
      listaPaginada: vi.fn(() => resource),
      eliminar: vi.fn(() => of({ isSuccess: true }))
    };
    routerMock = { navigate: vi.fn().mockResolvedValue(true) };
    dialogMock = { open: vi.fn(() => ({ afterClosed: () => of(confirmar) })) };
    snackBarMock = { open: vi.fn() };
    fixture = await createPageFixture(SucursalInicioComponent, [
      { provide: SucursalService, useValue: serviceMock },
      { provide: Router, useValue: routerMock },
      { provide: MatDialog, useValue: dialogMock },
      { provide: MatSnackBar, useValue: snackBarMock }
    ]);
    fixture.detectChanges();
  });

  it('shows records returned by the paginated service', () => {
    expect(fixture.componentInstance.items()).toEqual(rows);
    expect(fixture.componentInstance.listaData.data).toEqual(rows);
  });

  it('opens the registration route', () => {
    fixture.componentInstance.nuevo();
    expect(routerMock.navigate).toHaveBeenCalledWith(['sucursal/registro']);
  });

  it('deletes only after confirmation and refreshes the list', () => {
    fixture.componentInstance.eliminar(rows[0] as never);
    expect(serviceMock.eliminar).toHaveBeenCalledWith(7);
    expect(resource.reload).toHaveBeenCalled();
    expect(snackBarMock.open).toHaveBeenCalledWith(
      expect.stringContaining('eliminad'),
      'Cerrar',
      expect.objectContaining({ panelClass: ['success-snackbar'] })
    );
  });

  it('does not delete when confirmation is canceled', () => {
    confirmar = false;
    fixture.componentInstance.eliminar(rows[0] as never);
    expect(serviceMock.eliminar).not.toHaveBeenCalled();
    expect(resource.reload).not.toHaveBeenCalled();
  });
});
