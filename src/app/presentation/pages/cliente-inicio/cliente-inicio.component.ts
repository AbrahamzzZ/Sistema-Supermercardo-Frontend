import { Component, inject, ChangeDetectionStrategy, effect } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ClienteService } from '../../../core/services/cliente.service';
import { ICliente } from '../../../core/interfaces/cliente';
import { MatDialog } from '@angular/material/dialog';
import { DialogoConfirmacionComponent } from '../../components/dialog/dialogo-confirmacion/dialogo-confirmacion.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Metodos } from '../../../shared/utility/metodos';
import { MaterialModule } from '../../../shared/ui/material-module';
import { TableColumn } from '../../../shared/utility/components/data-table/table-column';
import { DataTableComponent } from '../../../shared/utility/components/data-table/data-table.component';
import { BaseListComponent } from '../../../shared/directive/baseListComponent';
import { filter, switchMap } from 'rxjs';

@Component({
  selector: 'app-cliente-inicio',
  imports: [MaterialModule, RouterOutlet, DataTableComponent],
  templateUrl: './cliente-inicio.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './cliente-inicio.component.scss'
})
export class ClienteInicioComponent extends BaseListComponent<ICliente> {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly clienteServicio = inject(ClienteService);
  private readonly snackBar = inject(MatSnackBar);
  readonly tituloExcel = 'Clientes';

  columns: TableColumn[] = [
    { key: 'id_Cliente', label: 'No.', type: 'text' },
    { key: 'codigo', label: 'Código', type: 'text' },
    { key: 'nombres', label: 'Nombres', type: 'text' },
    { key: 'apellidos', label: 'Apellidos', type: 'text' },
    { key: 'cedula', label: 'Cédula', type: 'text' },
    { key: 'telefono', label: 'Teléfono', type: 'text' },
    { key: 'correo_Electronico', label: 'Correo Electrónico', type: 'text' },
    { key: 'fecha_Creacion', label: 'Fecha de Registro', type: 'date' },
    { key: 'accion', label: 'Acción', type: 'actions' }
  ];

  protected readonly recurso = this.clienteServicio.listaPaginada(this.params);

  constructor() {
    super();

    effect(() => {
      if (this.recurso.error()) {
        this.mostrarMensaje('Error al cargar los clientes.', 'error');
      }
    });
  }

  eliminar(cliente: ICliente): void {
    this.dialog
      .open(DialogoConfirmacionComponent, {
        width: '500px',
        data: {
          mensaje: `¿Está seguro de eliminar al cliente ${cliente.nombres} ${cliente.apellidos}?`
        }
      })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() => this.clienteServicio.eliminar(cliente.id_Cliente))
      )
      .subscribe({
        next: (resp) => {
          if (resp.isSuccess) {
            this.refrescarDesdeInicio();
            this.mostrarMensaje('Cliente eliminada correctamente.', 'success');
          }
        },
        error: () => this.mostrarMensaje('Error al eliminar el cliente.', 'error')
      });
  }

  nuevo(): void {
    this.router.navigate(['cliente/registro'])
    .catch(() => this.mostrarMensaje('No se pudo abrir el formulario de registro.', 'error'));
  }

  editar(cliente: ICliente): void {
    this.router.navigate(['cliente/editar', cliente.id_Cliente])
    .catch(() => this.mostrarMensaje('No se pudo abrir el formulario de edición.', 'error'));
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
    const datos = this.listaData.data.map((cliente) => ({
      ID: cliente.id_Cliente,
      Código: cliente.codigo,
      Nombres: cliente.nombres,
      Apellidos: cliente.apellidos,
      Cedula: cliente.cedula,
      Telefono: cliente.telefono,
      'Correo Electronico': cliente.correo_Electronico,
      'Fecha Creacion': Metodos.formatearFecha(cliente.fecha_Creacion)
    }));

    if (!datos || datos.length === 0) {
      this.mostrarMensaje('No hay datos disponibles para exportar a Excel.', 'error');
      return;
    }

    Metodos.exportarExcel(this.tituloExcel, datos, [
      'ID',
      'Código',
      'Nombres',
      'Apellidos',
      'Cedula',
      'Telefono',
      'Correo Electronico',
      'Fecha Creacion'
    ]);
    this.mostrarMensaje('Excel generado exitosamente.', 'success');
  }
}
