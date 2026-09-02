import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../../shared/ui/material-module';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { Metodos } from '../../../shared/utility/metodos';
import { LogService } from '../../../core/services/log.service';
import { ILog } from '../../../core/interfaces/log';
import { ModalLogComponent } from '../../components/modal/modal-log/modal-log.component';
import { DataTableComponent } from "../../../shared/utility/components/data-table/data-table.component";
import { TableColumn } from '../../../shared/utility/components/tableColumn';
import { BaseListComponent } from '../../../shared/utility/components/baseListComponent';

@Component({
  selector: 'app-log-inicio',
  standalone: true,
  imports: [MaterialModule, RouterOutlet, DataTableComponent],
  templateUrl: './log-inicio.component.html',
  styleUrl: './log-inicio.component.scss'
})
export class LogInicioComponent extends BaseListComponent<ILog> {
  private readonly dialog = inject(MatDialog);
  private readonly logServicio = inject(LogService);
  private readonly snackBar = inject(MatSnackBar);
  readonly tituloExcel = 'Logs';

  columns: TableColumn[] = [
    {key: 'id_Log', label: 'No.', type: 'text'},
    {key: 'codigo_Error', label: 'Código de Error', type: 'text'},
    {key: 'fecha', label: 'Fecha', type: 'date'},
    {key: 'endpoint', label: 'Endpoint', type: 'text'},
    {key: 'metodo', label: 'Método', type: 'text'},
    {key: 'nivel', label: 'Nivel', type: 'text'},
    {key: 'accion', label: 'Acción', type: 'view'}
  ];

  override obtenerDatos(pageNumber: number, pageSize: number, filtro: string): void {
    const cacheKey = `${pageNumber}-${pageSize}-${filtro}`;

    if (this.filtrosCache.has(cacheKey)) {
      const cached = this.filtrosCache.get(cacheKey);
      this.listaData.data = cached.items;
      this.totalRegistros = cached.totalCount;
      return;
    }

    this.logServicio.listaPaginada(pageNumber, pageSize, filtro).subscribe({
      next: (resp: any) => {
        const arr = resp.data.items ?? [];
        this.totalRegistros = resp.data.totalCount;
        this.listaData.data = arr.map((l: ILog) => {
          return l;
        });

        this.filtrosCache.set(cacheKey, {
          items: arr,
          totalCount: this.totalRegistros
        });
      },
      error: (err) => console.error(err.message)
    });
  }

  mostrarMensaje(mensaje: string, tipo: 'success' | 'error' = 'success'): void {
    const className = tipo === 'success' ? 'success-snackbar' : 'error-snackbar';

    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: [className]
    });
  }

  exportarExcel(): void {
    const datos = this.listaData.data.map((log) => ({
      ID: log.id_Log,
      'Código Error': log.codigo_Error,
      'Mensaje Error': log.mensaje_Error,
      'Detalle Error': log.detalle_Error,
      'ID Usuario': log.id_Usuario,
      Fecha: this.getFechaRegistro(log.fecha ?? ''),
      Endpoint: log.endpoint,
      Metodo: log.metodo,
      Nivel: log.nivel
    }));

    if (!datos || datos.length === 0) {
      this.mostrarMensaje('No hay datos disponibles para exportar a Excel.', 'error');
      return;
    }

    Metodos.exportarExcel(this.tituloExcel, datos, [
      'ID',
      'Código Error',
      'Mensaje Error',
      'Detalle Error',
      'ID Usuario',
      'Fecha',
      'EndPoint',
      'Metodo',
      'Nivel'
    ]);
    this.mostrarMensaje('Excel generado exitosamente.', 'success');
  }

  getFechaRegistro(fecha: string): string {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  ver(log: ILog): void {
    this.dialog.open(ModalLogComponent, {
      width: '650px',
      maxHeight: '80vh',
      data: log
    });
  }
}