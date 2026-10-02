import { Component, inject, ChangeDetectionStrategy, effect } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { IProveedor } from '../../../core/interfaces/proveedor';
import { DialogoConfirmacionComponent } from '../../components/dialog/dialogo-confirmacion/dialogo-confirmacion.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Metodos } from '../../../shared/utility/metodos';
import { MaterialModule } from '../../../shared/ui/material-module';
import { DataTableComponent } from '../../../shared/utility/components/data-table/data-table.component';
import { TableColumn } from '../../../shared/utility/components/data-table/table-column';
import { BaseListComponent } from '../../../shared/directive/baseListComponent';
import { filter, switchMap } from 'rxjs';

@Component({
  selector: 'app-proveedor-inicio',
  imports: [MaterialModule, RouterOutlet, DataTableComponent],
  templateUrl: './proveedor-inicio.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './proveedor-inicio.component.scss'
})
export class ProveedorInicioComponent extends BaseListComponent<IProveedor> {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly proveedorServicio = inject(ProveedorService);
  private readonly snackBar = inject(MatSnackBar);
  readonly tituloExcel = 'Proveedores';

  columns: TableColumn[] = [
    { key: 'id_Proveedor', label: 'No.', type: 'text' },
    { key: 'codigo', label: 'Código', type: 'text' },
    { key: 'nombres', label: 'Nombres', type: 'text' },
    { key: 'apellidos', label: 'Apellidos', type: 'text' },
    { key: 'cedula', label: 'Cédula', type: 'text' },
    { key: 'telefono', label: 'Teléfono', type: 'text' },
    { key: 'correo_Electronico', label: 'Correo Electrónico', type: 'text' },
    { key: 'estado', label: 'Estado', type: 'status' },
    { key: 'fecha_Creacion', label: 'Fecha de Creación', type: 'date' },
    { key: 'accion', label: 'Acción', type: 'actions' }
  ];

  protected readonly recurso = this.proveedorServicio.listaPaginada(this.params);

  constructor() {
    super();

    effect(() => {
      if (this.recurso.error()) {
        this.mostrarMensaje('Error al cargar los proveedores.', 'error');
      }
    });
  }

  eliminar(proveedor: IProveedor): void {
    this.dialog
      .open(DialogoConfirmacionComponent, {
        width: '500px',
        data: {
          mensaje: `¿Está seguro de eliminar al proveedor ${proveedor.nombres} ${proveedor.apellidos}?`
        }
      })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() => this.proveedorServicio.eliminar(proveedor.id_Proveedor))
      )
      .subscribe({
        next: (resp) => {
          if (resp.isSuccess) {
            this.refrescarDesdeInicio();
            this.mostrarMensaje('Proveedor eliminado correctamente.', 'success');
          }
        },
        error: () => this.mostrarMensaje('Error al eliminar el proveedor.', 'error')
      });
  }

  nuevo(): void {
    this.router.navigate(['proveedor/registro']);
  }

  editar(proveedor: IProveedor): void {
    this.router.navigate(['proveedor/editar', proveedor.id_Proveedor]);
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
    const datos = this.listaData.data.map((proveedor) => ({
      ID: proveedor.id_Proveedor,
      Código: proveedor.codigo,
      Nombres: proveedor.nombres,
      Apellidos: proveedor.apellidos,
      Cedula: proveedor.cedula,
      Telefono: proveedor.telefono,
      'Correo Electronico': proveedor.correo_Electronico,
      Estado: this.getEstado(proveedor.estado),
      'Fecha Creacion': Metodos.formatearFecha(proveedor.fecha_Creacion)
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
      'Estado',
      'Fecha Creacion'
    ]);
    this.mostrarMensaje('Excel generado exitosamente.', 'success');
  }

  getEstado(estado: boolean): string {
    return estado ? 'Activo' : 'No Activo';
  }
}
