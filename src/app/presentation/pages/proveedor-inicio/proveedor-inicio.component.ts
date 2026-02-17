import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MatTableDataSource} from '@angular/material/table';
import { Router, RouterOutlet } from '@angular/router';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { IProveedor } from '../../../core/interfaces/proveedor';
import { DialogoConfirmacionComponent } from '../../components/dialog/dialogo-confirmacion/dialogo-confirmacion.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgClass } from '@angular/common';
import { Metodos } from '../../../shared/utility/metodos';
import { MatPaginator } from '@angular/material/paginator';
import { MaterialModule } from '../../../shared/ui/material-module';

@Component({
  selector: 'app-proveedor-inicio',
  standalone: true,
  imports: [
    MaterialModule,
    RouterOutlet,
    NgClass,
  ],
  templateUrl: './proveedor-inicio.component.html',
  styleUrl: './proveedor-inicio.component.scss'
})
export class ProveedorInicioComponent implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly proveedorServicio = inject(ProveedorService);
  private readonly snackBar = inject(MatSnackBar);
  public listaProveedor = new MatTableDataSource<IProveedor>();
  public tituloExcel = 'Proveedores';
  public totalRegistros = 0;
  public pageSize = 5;
  public displayedColumns: string[] = [
    'id',
    'codigo',
    'nombres',
    'apellidos',
    'cedula',
    'telefono',
    'correo_Electronico',
    'estado',
    'fecha_Registro',
    'accion'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => {
      this.obtenerProveedores(this.paginator.pageIndex + 1, this.paginator.pageSize);
      if (this.listaProveedor.data.length === 0 && this.paginator.hasPreviousPage()) {
        this.paginator.previousPage();
      }
    });
    this.obtenerProveedores(1, this.pageSize);
  }

  obtenerProveedores(pageNumber: number, pageSize: number) {
    this.proveedorServicio.listaPaginada(pageNumber, pageSize).subscribe({
      next: (resp: any) => {
        const arr = resp.data.items ?? [];
        this.totalRegistros = resp.data.totalCount;
        this.listaProveedor.data = arr.map((c: IProveedor) => {
          return c;
        });
      },
      error: (err) => console.error(err.message)
    });
  }

  eliminar(proveedor: IProveedor) {
    const dialogRef = this.dialog.open(DialogoConfirmacionComponent, {
      width: '500px',
      data: {
        mensaje: `¿Está seguro de eliminar al proveedor ${proveedor.nombres} ${proveedor.apellidos}?`
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.proveedorServicio.eliminar(proveedor.id_Proveedor).subscribe({
          next: (data) => {
            if (data.isSuccess) {
              this.obtenerProveedores(this.paginator.pageIndex + 1, this.paginator.pageSize);
              this.mostrarMensaje('Proveedor eliminado correctamente.', 'success');
            }
          },
          error: (err) => {
            console.log(err.message);
            this.mostrarMensaje('Error al eliminar el Proveedor.', 'error');
          }
        });
      }
    });
  }

  nuevo() {
    this.router.navigate(['proveedor/proveedor-registro', 0]);
  }

  editar(proveedor: IProveedor) {
    this.router.navigate(['proveedor/proveedor-editar', proveedor.id_Proveedor]);
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

  filtrarProveedores(termino: string) {
    this.listaProveedor.filter = termino.trim().toLowerCase();
    if (this.listaProveedor.paginator) {
      this.listaProveedor.paginator.firstPage();
    }
  }

  exportarExcel() {
    const datos = this.listaProveedor.data.map((proveedor) => ({
      ID: proveedor.id_Proveedor,
      Código: proveedor.codigo,
      Nombres: proveedor.nombres,
      Apellidos: proveedor.apellidos,
      Cedula: proveedor.cedula,
      Telefono: proveedor.telefono,
      'Correo Electronico': proveedor.correo_Electronico,
      Estado: this.getEstado(proveedor.estado),
      'Fecha Registro': this.getFechaRegistro(proveedor.fecha_Registro ?? '')
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
      'Fecha Registro'
    ]);
    this.mostrarMensaje('Excel generado exitosamente.', 'success');
  }

  getEstado(estado: boolean): string {
    return estado ? 'Activo' : 'No Activo';
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
