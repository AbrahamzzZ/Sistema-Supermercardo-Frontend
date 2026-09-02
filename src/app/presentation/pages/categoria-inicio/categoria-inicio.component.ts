import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CategoriaService } from '../../../core/services/categoria.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ICategoria } from '../../../core/interfaces/categoria';
import { MatDialog } from '@angular/material/dialog';
import { Metodos } from '../../../shared/utility/metodos';
import { DialogoConfirmacionComponent } from '../../components/dialog/dialogo-confirmacion/dialogo-confirmacion.component';
import { MaterialModule } from '../../../shared/ui/material-module';
import { DataTableComponent } from "../../../shared/utility/components/data-table/data-table.component";
import { TableColumn } from '../../../shared/utility/components/tableColumn';
import { BaseListComponent } from '../../../shared/utility/components/baseListComponent';

@Component({
  selector: 'app-categoria-inicio',
  standalone: true,
  imports: [
    MaterialModule,
    RouterOutlet,
    DataTableComponent
],
  templateUrl: './categoria-inicio.component.html',
  styleUrl: './categoria-inicio.component.scss'
})
export class CategoriaInicioComponent extends BaseListComponent<ICategoria> {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly categoriaServicio = inject(CategoriaService);
  private readonly snackBar = inject(MatSnackBar);
  readonly tituloExcel = 'Categorías';

  columns: TableColumn[] = [
    {key: 'id_Categoria', label: 'No.', type: 'text'},
    {key: 'codigo', label: 'Código', type: 'text'},
    {key: 'nombre_Categoria', label: 'Nombre', type: 'text'},
    {key: 'estado', label: 'Estado', type: 'status'},
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

    this.categoriaServicio.listaPaginada(pageNumber, pageSize, filtro).subscribe({
      next: (resp: any) => {
        const arr = resp.data.items ?? [];
        this.totalRegistros = resp.data.totalCount;
        this.listaData.data = arr;

        this.filtrosCache.set(cacheKey, {
          items: arr,
          totalCount: this.totalRegistros
        });
      },
      error: (err) => console.error(err.message)
    });
  }

  eliminar(categoria: ICategoria): void {
    const dialogRef = this.dialog.open(DialogoConfirmacionComponent, {
      width: '500px',
      data: {
        mensaje: `¿Está seguro de eliminar la categoría ${categoria.nombre_Categoria}?`
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.categoriaServicio.eliminar(categoria.id_Categoria).subscribe({
          next: (data) => {
            if (data.isSuccess) {
              this.limpiarCache();
              this.obtenerDatos(1, this.pageSize, this.filtroActual);
              this.mostrarMensaje('Categoría eliminado correctamente.', 'success');
            }
          },
          error: (err) => {
            console.log(err.message);
            this.mostrarMensaje('Error al eliminar la Categoría.', 'error');
          }
        });
      }
    });
  }

  nuevo(): void {
    this.router.navigate(['categoria/categoria-registro', 0]);
  }

  editar(categoria: ICategoria): void {
    this.router.navigate(['categoria/categoria-editar', categoria.id_Categoria]);
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
    const datos = this.listaData.data.map((categoria) => ({
      ID: categoria.id_Categoria,
      Código: categoria.codigo,
      Nombre: categoria.nombre_Categoria,
      Estado: this.getEstado(categoria.estado),
      'Fecha Creacion': this.getFechaRegistro(categoria.fecha_Creacion ?? '')
    }));

    if (!datos || datos.length === 0) {
      this.mostrarMensaje('No hay datos disponibles para exportar a Excel.', 'error');
      return;
    }

    Metodos.exportarExcel(this.tituloExcel, datos, [
      'ID',
      'Código',
      'Nombre',
      'Estado',
      'Fecha Creacion'
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