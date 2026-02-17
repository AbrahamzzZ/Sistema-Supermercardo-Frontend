import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { SucursalService } from '../../../core/services/sucursal.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Router, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DialogoConfirmacionComponent } from '../../components/dialog/dialogo-confirmacion/dialogo-confirmacion.component';
import { Metodos } from '../../../shared/utility/metodos';
import { ISucursalNegocio } from '../../../core/interfaces/Dto/sucursal-negocio';
import { ISucursal } from '../../../core/interfaces/sucursal';
import { MaterialModule } from '../../../shared/ui/material-module';

@Component({
  selector: 'app-sucursal-inicio',
  standalone: true,
  imports: [
    MaterialModule,
    RouterOutlet,
    NgClass,
  ],
  templateUrl: './sucursal-inicio.component.html',
  styleUrl: './sucursal-inicio.component.scss'
})
export class SucursalInicioComponent implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly sucursalServicio = inject(SucursalService);
  private readonly snackBar = inject(MatSnackBar);
  public listaSucursal = new MatTableDataSource<ISucursalNegocio>();
  public tituloExcel = 'Sucursales';
  public totalRegistros = 0;
  public pageSize = 5;
  public displayedColumns: string[] = [
    'id',
    'codigo',
    'nombre',
    'direccion',
    'latitud',
    'longitud',
    'ciudad',
    'estado',
    'accion'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => {
      this.obtenerSucursales(this.paginator.pageIndex + 1, this.paginator.pageSize);
      if (this.listaSucursal.data.length === 0 && this.paginator.hasPreviousPage()) {
        this.paginator.previousPage();
      }
    });
    this.obtenerSucursales(1, this.pageSize);
  }

  obtenerSucursales(pageNumber: number, pageSize: number) {
    this.sucursalServicio.listaPaginada(pageNumber, pageSize).subscribe({
      next: (resp: any) => {
        const arr = resp.data.items ?? [];
        this.totalRegistros = resp.data.totalCount;
        this.listaSucursal.data = arr.map((c: ISucursal) => {
          return c;
        });
      },
      error: (err) => console.error(err.message)
    });
  }

  eliminar(sucursal: ISucursalNegocio) {
    const dialogRef = this.dialog.open(DialogoConfirmacionComponent, {
      width: '500px',
      data: {
        mensaje: `¿Está seguro de eliminar la sucursal ${sucursal.nombre_Sucursal}?`
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.sucursalServicio.eliminar(sucursal.id_Sucursal).subscribe({
          next: (data) => {
            if (data.isSuccess) {
              this.obtenerSucursales(this.paginator.pageIndex + 1, this.paginator.pageSize);
              this.mostrarMensaje('Sucursal eliminada correctamente.', 'success');
            }
          },
          error: (err) => {
            console.log(err.message);
            this.mostrarMensaje('Error al eliminar la Sucursal.', 'error');
          }
        });
      }
    });
  }

  nuevo() {
    this.router.navigate(['sucursal/sucursal-registro', 0]);
  }

  editar(sucursal: ISucursalNegocio) {
    this.router.navigate(['sucursal/sucursal-editar', sucursal.id_Sucursal]);
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

  filtrarSucursales(termino: string) {
    this.listaSucursal.filter = termino.trim().toLowerCase();
    if (this.listaSucursal.paginator) {
      this.listaSucursal.paginator.firstPage();
    }
  }

  exportarExcel() {
    const datos = this.listaSucursal.data.map((sucursal) => ({
      ID: sucursal.id_Sucursal,
      Código: sucursal.codigo,
      Nombres: sucursal.nombre_Sucursal,
      Direccion: sucursal.direccion_Sucursal,
      Latitud: sucursal.latitud,
      Longitud: sucursal.longitud,
      Ciudad: sucursal.ciudad_Sucursal,
      Estado: this.getEstado(sucursal.estado)
    }));

    if (!datos || datos.length === 0) {
      this.mostrarMensaje('No hay datos disponibles para exportar a Excel.', 'error');
      return;
    }

    Metodos.exportarExcel(this.tituloExcel, datos, [
      'ID',
      'Código',
      'Nombres',
      'Direccion',
      'Latitud',
      'Longitud',
      'Ciudad',
      'Estado'
    ]);
    this.mostrarMensaje('Excel generado exitosamente.', 'success');
  }

  getEstado(estado: boolean): string {
    return estado ? 'Activo' : 'No Activo';
  }
}
