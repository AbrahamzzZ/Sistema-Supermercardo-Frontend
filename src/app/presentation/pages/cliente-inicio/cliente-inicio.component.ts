import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ClienteService } from '../../../core/services/cliente.service';
import { ICliente } from '../../../core/interfaces/cliente';
import { MatDialog } from '@angular/material/dialog';
import { DialogoConfirmacionComponent } from '../../components/dialog/dialogo-confirmacion/dialogo-confirmacion.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Metodos } from '../../../shared/utility/metodos';
import { MaterialModule } from '../../../shared/ui/material-module';
import { TableColumn } from '../../../shared/utility/components/tableColumn';
import { DataTableComponent } from "../../../shared/utility/components/data-table/data-table.component";
import { BaseListComponent } from '../../../shared/utility/components/baseListComponent';

@Component({
  selector: 'app-cliente-inicio',
  standalone: true,
  imports: [
    MaterialModule,
    RouterOutlet,
    DataTableComponent
],
  templateUrl: './cliente-inicio.component.html',
  styleUrl: './cliente-inicio.component.scss'
})
export class ClienteInicioComponent extends BaseListComponent<ICliente> {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly clienteServicio = inject(ClienteService);
  private readonly snackBar = inject(MatSnackBar);
  readonly tituloExcel = 'Clientes';

  columns: TableColumn[] = [
    {key: 'id_Cliente', label: 'No.', type: 'text'},
    {key: 'codigo', label: 'Código', type: 'text'},
    {key: 'nombres', label: 'Nombres', type: 'text'},
    {key: 'apellidos', label: 'Apellidos', type: 'text'},
    {key: 'cedula', label: 'Cédula', type: 'text'},
    {key: 'telefono', label: 'Teléfono', type: 'text'},
    {key: 'correo_Electronico', label: 'Correo Electrónico', type: 'text'},
    {key: 'fecha_Creacion', label: 'Fecha de Registro', type: 'date'},
    {key: 'accion', label: 'Acción', type: 'actions'}
  ];

  override obtenerDatos(pageNumber: number, pageSize: number, filtro: string): void {
    const cacheKey = `${pageNumber}-${pageSize}-${filtro}`;

    if (this.filtrosCache.has(cacheKey)) {
      const cached = this.filtrosCache.get(cacheKey);
      this.listaData.data = cached.items;
      this.totalRegistros = cached.totalCount;
      return;
    }

    this.clienteServicio.listaPaginada(pageNumber, pageSize, filtro).subscribe({
      next: (resp: any) => {
        const arr = resp.data.items ?? [];
        this.totalRegistros = resp.data.totalCount;
        this.listaData.data = arr.map((cl: ICliente) => {
          return cl;
        });

        this.filtrosCache.set(cacheKey, {
          items: arr,
          totalCount: this.totalRegistros
        });
      },
      error: (err) => console.error(err.message)
    });
  }

  eliminar(cliente: ICliente): void {
    const dialogRef = this.dialog.open(DialogoConfirmacionComponent, {
      width: '500px',
      data: {
        mensaje: `¿Está seguro de eliminar al cliente ${cliente.nombres} ${cliente.apellidos}?`
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.clienteServicio.eliminar(cliente.id_Cliente).subscribe({
          next: (data) => {
            if (data.isSuccess) {
              this.limpiarCache();
              this.obtenerDatos(1, this.pageSize, this.filtroActual);
              this.mostrarMensaje('Cliente eliminado correctamente.', 'success');
            }
          },
          error: (err) => {
            console.log(err.message);
            this.mostrarMensaje('Error al eliminar al Cliente.', 'error');
          }
        });
      }
    });
  }

  nuevo(): void {
    this.router.navigate(['cliente/cliente-registro', 0]);
  }

  editar(cliente: ICliente): void {
    this.router.navigate(['cliente/cliente-editar', cliente.id_Cliente]);
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
      'Fecha Creacion': this.getFechaRegistro(cliente.fecha_Creacion ?? '')
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

  getFechaRegistro(fecha: string): string {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}