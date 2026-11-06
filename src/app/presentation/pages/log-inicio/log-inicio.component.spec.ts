import { signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LogService } from '../../../core/services/log.service';
import { ILog } from '../../../core/interfaces/log';
import { LogInicioComponent } from './log-inicio.component';
import { createPageFixture } from '../../../shared/utility/test';

describe('LogInicioComponent', () => {
  let fixture: Awaited<ReturnType<typeof createPageFixture<LogInicioComponent>>>;
  let dialog: { open: ReturnType<typeof vi.fn> };
  let snackBar: { open: ReturnType<typeof vi.fn> };
  let listaPaginada: ReturnType<typeof vi.fn>;
  let obtenerPagina: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    const resource = {
      hasValue: signal(true),
      value: signal<any>({ data: { items: [], totalCount: 0, pageNumber: 1, pageSize: 5 } }),
      isLoading: signal(false),
      error: signal<any>(undefined),
      reload: vi.fn()
    };
    dialog = { open: vi.fn() };
    snackBar = { open: vi.fn() };
    listaPaginada = vi.fn(() => resource);
    obtenerPagina = vi.fn();
    fixture = await createPageFixture(LogInicioComponent, [
      { provide: LogService, useValue: { listaPaginada, obtenerPagina } },
      { provide: MatDialog, useValue: dialog },
      { provide: MatSnackBar, useValue: snackBar }
    ]);
    fixture.detectChanges();
  });

  it('opens the selected log in the log detail dialog', () => {
    const log = { id_Log: 9, codigo: 'ERR-9', mensaje: 'Request failed' } as ILog;

    fixture.componentInstance.ver(log);

    expect(dialog.open).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ width: '650px', data: log })
    );
  });

  it('loads the last 30 days by default', () => {
    const params = listaPaginada.mock.calls[0][0]();

    expect(params.desde).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(params.hasta).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const dias = (new Date(params.hasta).getTime() - new Date(params.desde).getTime()) / 86_400_000;
    expect(Math.round(dias)).toBe(30);
  });

  it('rejects exporting a range longer than 3 months', () => {
    const component = fixture.componentInstance;
    component.cambiarDesde(new Date(2026, 0, 1));
    component.cambiarHasta(new Date(2026, 4, 1));

    component.exportarExcel();

    expect(obtenerPagina).not.toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith(
      'El rango para exportar no puede superar 3 meses. Acote las fechas.',
      'Cerrar',
      expect.objectContaining({ panelClass: ['error-snackbar'] })
    );
  });

  it('asks for both dates before exporting', () => {
    fixture.componentInstance.cambiarHasta(null);

    fixture.componentInstance.exportarExcel();

    expect(obtenerPagina).not.toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith(
      'Seleccione la fecha inicial y final para exportar el log.',
      'Cerrar',
      expect.objectContaining({ panelClass: ['error-snackbar'] })
    );
  });

  it('reports when there are no logs to export', () => {
    fixture.componentInstance.exportarExcel();

    expect(snackBar.open).toHaveBeenCalledWith(
      'No hay datos disponibles para exportar a Excel.',
      'Cerrar',
      expect.objectContaining({ panelClass: ['error-snackbar'] })
    );
  });
});
