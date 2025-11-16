import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router, RouterOutlet } from '@angular/router';
import { ClienteService } from '../../../core/services/cliente.service';
import { ICliente } from '../../../core/interfaces/cliente';
import { MatDialog } from '@angular/material/dialog';
import { DialogoConfirmacionComponent } from '../../components/dialog/dialogo-confirmacion/dialogo-confirmacion.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Metodos } from '../../../shared/utility/metodos';
import { MatPaginator} from '@angular/material/paginator';
import { MaterialModule } from '../../../shared/ui/material-module';

@Component({
  selector: 'app-cliente-inicio',
  standalone: true,
  imports: [
    MaterialModule,
    RouterOutlet,
  ],
  templateUrl: './cliente-inicio.component.html',
  styleUrl: './cliente-inicio.component.scss'
})
export class ClienteInicioComponent implements AfterViewInit {
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private clienteServicio = inject(ClienteService);
  private snackBar = inject(MatSnackBar);
  public listaCliente = new MatTableDataSource<ICliente>();
  public tituloExcel = 'Clientes';
  public totalRegistros = 0;
  public pageSize = 5;
  displayedColumns: string[] = [
    'id',
    'codigo',
    'nombres',
    'apellidos',
    'cedula',
    'telefono',
    'correo_Electronico',
    'fecha_Registro',
    'accion'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => {
      this.obtenerClientes(this.paginator.pageIndex + 1, this.paginator.pageSize);
      if (this.listaCliente.data.length === 0 && this.paginator.hasPreviousPage()) {
        this.paginator.previousPage();
      }
    });
    this.obtenerClientes(1, this.pageSize);
  }

  obtenerClientes(pageNumber: number, pageSize: number) {
    this.clienteServicio.listaPaginada(pageNumber, pageSize).subscribe({
      next: (resp: any) => {
        const arr = resp.data.items ?? [];
        this.totalRegistros = resp.data.totalCount;
        this.listaCliente.data = arr.map((cl: ICliente) => {
          return cl;
        });
      },
      error: (err) => console.error(err.message)
    });
  }

  eliminar(cliente: ICliente) {
    const dialogRef = this.dialog.open(DialogoConfirmacionComponent, {
      width: '350px',
      data: {
        mensaje: `¿Está seguro de eliminar al cliente ${cliente.nombres} ${cliente.apellidos}?`
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.clienteServicio.eliminar(cliente.id_Cliente).subscribe({
          next: (data) => {
            if (data.isSuccess) {
              this.obtenerClientes(this.paginator.pageIndex + 1, this.paginator.pageSize);
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

  nuevo() {
    this.router.navigate(['cliente/cliente-registro', 0]);
  }

  editar(cliente: ICliente) {
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

  filtrarClientes(termino: string) {
    this.listaCliente.filter = termino.trim().toLowerCase();
    if (this.listaCliente.paginator) {
      this.listaCliente.paginator.firstPage();
    }
  }

  exportarExcel() {
    const datos = this.listaCliente.data.map((cliente) => ({
      ID: cliente.id_Cliente,
      Código: cliente.codigo,
      Nombres: cliente.nombres,
      Apellidos: cliente.apellidos,
      Cedula: cliente.cedula,
      Telefono: cliente.telefono,
      'Correo Electronico': cliente.correo_Electronico,
      'Fecha Registro': this.getFechaRegistro(cliente.fecha_Registro ?? '')
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
      'Fecha Registro'
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
