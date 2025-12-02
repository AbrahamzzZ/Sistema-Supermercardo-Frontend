import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../shared/ui/material-module';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Router, RouterOutlet } from '@angular/router';
import { ICliente } from '../../../core/interfaces/cliente';
import { Metodos } from '../../../shared/utility/metodos';
import { LogService } from '../../../core/services/log.service';
import { ILog } from '../../../core/interfaces/log';

@Component({
  selector: 'app-log-inicio',
  standalone: true,
  imports: [MaterialModule, RouterOutlet],
  templateUrl: './log-inicio.component.html',
  styleUrl: './log-inicio.component.scss'
})
export class LogInicioComponent implements AfterViewInit{
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private logServicio = inject(LogService);
  private snackBar = inject(MatSnackBar);
  public listaLog = new MatTableDataSource<ILog>();
  public tituloExcel = 'Logs';
  public totalRegistros = 0;
  public pageSize = 5;
  displayedColumns: string[] = [
    'id',
    'codigo_Error',
    'mensaje_Error',
    'detalle_Error',
    'fecha',
    'endpoint',
    'metodo',
    'nivel',
    'accion'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => {
      this.obtenerLogs(this.paginator.pageIndex + 1, this.paginator.pageSize);
      if (this.listaLog.data.length === 0 && this.paginator.hasPreviousPage()) {
        this.paginator.previousPage();
      }
    });
    this.obtenerLogs(1, this.pageSize);
  }

  obtenerLogs(pageNumber: number, pageSize: number) {
    this.logServicio.listaPaginada(pageNumber, pageSize).subscribe({
      next: (resp: any) => {
        const arr = resp.data.items ?? [];
        this.totalRegistros = resp.data.totalCount;
        this.listaLog.data = arr.map((l: ILog) => {
          return l;
        });
      },
      error: (err) => console.error(err.message)
    });
  }

  ver(cliente: ICliente) {
    this.router.navigate(['cliente/cliente-editar', cliente.id_Cliente]);
  }

  mostrarMensaje(mensaje: string, tipo: 'success' | 'error' = 'success') {
    const className = tipo === 'success' ? 'success-snackbar' : 'error-snackbar';

    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: [className]
    });
  }

  filtrarLogs(termino: string) {
    this.listaLog.filter = termino.trim().toLowerCase();
    if (this.listaLog.paginator) {
      this.listaLog.paginator.firstPage();
    }
  }

  exportarExcel() {
    const datos = this.listaLog.data.map((log) => ({
      ID: log.id_log,
      Código: log.codigo_error,
      Mensaje: log.mensaje_error,
      Detalle: log.detalle_error,
      'ID Usuario': log.id_usuario,
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

  getFechaRegistro(fecha: string): string {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
