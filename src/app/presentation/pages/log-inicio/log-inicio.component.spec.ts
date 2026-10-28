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
    fixture = await createPageFixture(LogInicioComponent, [
      { provide: LogService, useValue: { listaPaginada: vi.fn(() => resource) } },
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

  it('reports when there are no logs to export', () => {
    fixture.componentInstance.exportarExcel();

    expect(snackBar.open).toHaveBeenCalledWith(
      'No hay datos disponibles para exportar a Excel.',
      'Cerrar',
      expect.objectContaining({ panelClass: ['error-snackbar'] })
    );
  });
});
