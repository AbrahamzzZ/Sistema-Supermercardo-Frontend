import {
  Component,
  inject,
  ChangeDetectionStrategy,
  effect,
  computed,
  signal
} from '@angular/core';
import { MaterialModule } from '../../../shared/ui/material-module';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { RouterOutlet } from '@angular/router';
import { Metodos } from '../../../shared/utility/metodos';
import { LogService, ParamsLog } from '../../../core/services/log.service';
import { ILog } from '../../../core/interfaces/log';
import { ModalLogComponent } from '../../components/modal/modal-log/modal-log.component';
import { DataTableComponent } from '../../../shared/utility/components/data-table/data-table.component';
import { TableColumn } from '../../../shared/utility/components/data-table/table-column';
import { BaseListComponent } from '../../../shared/directive/baseListComponent';

// Rango que se muestra al abrir la pantalla y tope para exportar a Excel
const DIAS_POR_DEFECTO = 30;
const MESES_MAXIMOS_EXPORTAR = 3;

// yyyy-MM-dd con la fecha local (toISOString usa UTC y puede cambiar el día)
function formatearFecha(fecha: Date | null): string {
  if (!fecha) return '';
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}

function sumarMeses(fecha: Date, meses: number): Date {
  const resultado = new Date(fecha);
  resultado.setMonth(resultado.getMonth() + meses);
  return resultado;
}

@Component({
  selector: 'app-log-inicio',
  imports: [MaterialModule, RouterOutlet, DataTableComponent],
  providers: [provideNativeDateAdapter(), { provide: MAT_DATE_LOCALE, useValue: 'es-EC' }],
  templateUrl: './log-inicio.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './log-inicio.component.scss'
})
export class LogInicioComponent extends BaseListComponent<ILog> {
  private readonly dialog = inject(MatDialog);
  private readonly logServicio = inject(LogService);
  private readonly snackBar = inject(MatSnackBar);
  readonly tituloExcel = 'Logs';

  readonly hoy = new Date();
  readonly desde = signal<Date | null>(
    new Date(this.hoy.getFullYear(), this.hoy.getMonth(), this.hoy.getDate() - DIAS_POR_DEFECTO)
  );
  readonly hasta = signal<Date | null>(
    new Date(this.hoy.getFullYear(), this.hoy.getMonth(), this.hoy.getDate())
  );

  private readonly paramsLog = computed<ParamsLog>(() => ({
    ...this.params(),
    desde: formatearFecha(this.desde()),
    hasta: formatearFecha(this.hasta())
  }));

  columns: TableColumn[] = [
    { key: 'codigo', label: 'Código', type: 'text' },
    { key: 'fecha', label: 'Fecha', type: 'date' },
    { key: 'servicio', label: 'Servicio', type: 'text' },
    { key: 'endpoint', label: 'Endpoint', type: 'text' },
    { key: 'metodo', label: 'Método', type: 'text' },
    { key: 'nivel', label: 'Nivel', type: 'text' },
    { key: 'accion', label: 'Acción', type: 'view' }
  ];

  protected readonly recurso = this.logServicio.listaPaginada(this.paramsLog);

  constructor() {
    super();

    effect(() => {
      if (this.recurso.error()) {
        this.mostrarMensaje('Error al cargar los logs.', 'error');
      }
    });
  }

  cambiarDesde(fecha: Date | null): void {
    this.desde.set(fecha);
    this.pagina.set(1);
  }

  cambiarHasta(fecha: Date | null): void {
    this.hasta.set(fecha);
    this.pagina.set(1);
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

  // El Excel usa el mismo rango y filtro de la pantalla; el rango debe ser de máximo 3 meses
  exportarExcel(): void {
    const desde = this.desde();
    const hasta = this.hasta();

    if (!desde || !hasta) {
      this.mostrarMensaje('Seleccione la fecha inicial y final para exportar el log.', 'error');
      return;
    }

    if (hasta > sumarMeses(desde, MESES_MAXIMOS_EXPORTAR)) {
      this.mostrarMensaje(
        `El rango para exportar no puede superar ${MESES_MAXIMOS_EXPORTAR} meses. Acote las fechas.`,
        'error'
      );
      return;
    }

    const rango = { desde: formatearFecha(desde), hasta: formatearFecha(hasta) };
    this.cargarTodosParaExportar((params) =>
      this.logServicio.obtenerPagina({ ...params, ...rango })
    ).subscribe({
      next: (registros) =>
        this.generarExcel(registros, `${this.tituloExcel} ${rango.desde} a ${rango.hasta}`),
      error: (err) =>
        this.mostrarMensaje(
          err?.message || 'No se pudo obtener la información para exportar.',
          'error'
        )
    });
  }

  private generarExcel(registros: ILog[], nombreArchivo: string): void {
    const datos = registros.map((log) => ({
      ID: log.id_Log,
      Código: log.codigo,
      Mensaje: log.mensaje,
      Detalle: log.detalle,
      'ID Usuario': log.id_Usuario,
      Fecha: Metodos.formatearFecha(log.fecha),
      Servicio: log.servicio ?? '',
      Endpoint: log.endpoint,
      Metodo: log.metodo,
      Nivel: log.nivel
    }));

    if (!datos || datos.length === 0) {
      this.mostrarMensaje('No hay datos disponibles para exportar a Excel.', 'error');
      return;
    }

    Metodos.exportarExcel(nombreArchivo, datos, [
      'ID',
      'Código',
      'Mensaje',
      'Detalle',
      'ID Usuario',
      'Fecha',
      'Servicio',
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
