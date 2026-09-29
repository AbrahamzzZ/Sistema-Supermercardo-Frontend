import { Component, inject, ChangeDetectionStrategy, effect } from '@angular/core';
import { MaterialModule } from '../../../shared/ui/material-module';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { Metodos } from '../../../shared/utility/metodos';
import { LogService } from '../../../core/services/log.service';
import { ILog } from '../../../core/interfaces/log';
import { ModalLogComponent } from '../../components/modal/modal-log/modal-log.component';
import { DataTableComponent } from '../../../shared/utility/components/data-table/data-table.component';
import { TableColumn } from '../../../shared/utility/components/data-table/table-column';
import { BaseListComponent } from '../../../shared/directive/baseListComponent';

@Component({
  selector: 'app-log-inicio',
  imports: [MaterialModule, RouterOutlet, DataTableComponent],
  templateUrl: './log-inicio.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './log-inicio.component.scss'
})
export class LogInicioComponent extends BaseListComponent<ILog> {
  private readonly dialog = inject(MatDialog);
  private readonly logServicio = inject(LogService);
  private readonly snackBar = inject(MatSnackBar);
  readonly tituloExcel = 'Logs';

  columns: TableColumn[] = [
    { key: 'id_Log', label: 'No.', type: 'text' },
    { key: 'codigo', label: 'Código de Error', type: 'text' },
    { key: 'fecha', label: 'Fecha', type: 'date' },
    { key: 'endpoint', label: 'Endpoint', type: 'text' },
    { key: 'metodo', label: 'Método', type: 'text' },
    { key: 'nivel', label: 'Nivel', type: 'text' },
    { key: 'accion', label: 'Acción', type: 'view' }
  ];

  protected readonly recurso = this.logServicio.listaPaginada(this.params);

  constructor() {
    super();

    effect(() => {
      if(this.recurso.error()){
        this.mostrarMensaje('Error al cargar los logs.', 'error');
      }
    })
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
      Código: log.codigo,
      Mensaje: log.mensaje,
      Detalle: log.detalle,
      'ID Usuario': log.id_Usuario,
      Fecha: Metodos.formatearFecha(log.fecha),
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
      'Código',
      'Mensaje',
      'Detalle',
      'ID Usuario',
      'Fecha',
      'EndPoint',
      'Metodo',
      'Nivel'
    ]);
    this.mostrarMensaje('Excel generado exitosamente.', 'success');
  }

  ver(log: ILog): void {
    this.dialog.open(ModalLogComponent, {
      width: '650px',
      maxHeight: '80vh',
      data: log
    });
  }
}
