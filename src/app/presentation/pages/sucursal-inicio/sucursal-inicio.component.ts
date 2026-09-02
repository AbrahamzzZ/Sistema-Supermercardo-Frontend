import { Component, inject } from '@angular/core';
import { SucursalService } from '../../../core/services/sucursal.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogoConfirmacionComponent } from '../../components/dialog/dialogo-confirmacion/dialogo-confirmacion.component';
import { Metodos } from '../../../shared/utility/metodos';
import { ISucursalNegocio } from '../../../core/interfaces/Dto/sucursal-negocio';
import { ISucursal } from '../../../core/interfaces/sucursal';
import { MaterialModule } from '../../../shared/ui/material-module';
import { DataTableComponent } from "../../../shared/utility/components/data-table/data-table.component";
import { TableColumn } from '../../../shared/utility/components/tableColumn';
import { BaseListComponent } from '../../../shared/utility/components/baseListComponent';

@Component({
  selector: 'app-sucursal-inicio',
  standalone: true,
  imports: [
    MaterialModule,
    RouterOutlet,
    DataTableComponent
],
  templateUrl: './sucursal-inicio.component.html',
  styleUrl: './sucursal-inicio.component.scss'
})
export class SucursalInicioComponent extends BaseListComponent<ISucursalNegocio> {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly sucursalServicio = inject(SucursalService);
  private readonly snackBar = inject(MatSnackBar);
  readonly tituloExcel = 'Sucursales';

  columns: TableColumn[] = [
    {key: 'id_Sucursal', label: 'No.', type: 'text'},
    {key: 'codigo', label: 'Código', type: 'text'},
    {key: 'nombre_Sucursal', label: 'Nombre', type: 'text'},
    {key: 'direccion_Sucursal', label: 'Dirección', type: 'text'},
    {key: 'latitud', label: 'Latitud', type: 'text'},
    {key: 'longitud', label: 'Longitud', type: 'text'},
    {key: 'ciudad_Sucursal', label: 'Ciudad', type: 'text'},
    {key: 'estado', label: 'Estado', type: 'status'},
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

    this.sucursalServicio.listaPaginada(pageNumber, pageSize, filtro).subscribe({
      next: (resp: any) => {
        const arr = resp.data.items ?? [];
        this.totalRegistros = resp.data.totalCount;
        this.listaData.data = arr.map((c: ISucursal) => {
          return c;
        });

        this.filtrosCache.set(cacheKey, {
          items: arr,
          totalCount: this.totalRegistros
        });
      },
      error: (err) => console.error(err.message)
    });
  }

  eliminar(sucursal: ISucursalNegocio): void {
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
              this.limpiarCache();
              this.obtenerDatos(1, this.pageSize, this.filtroActual);
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

  nuevo(): void {
    this.router.navigate(['sucursal/sucursal-registro', 0]);
  }

  editar(sucursal: ISucursalNegocio): void {
    this.router.navigate(['sucursal/sucursal-editar', sucursal.id_Sucursal]);
  }

  verMapa(): void {
    this.router.navigate(['sucursal/mapa']);
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
    const datos = this.listaData.data.map((sucursal) => ({
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