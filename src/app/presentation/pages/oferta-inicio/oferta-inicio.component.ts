import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { OfertaService } from '../../../core/services/oferta.service';
import { IOferta } from '../../../core/interfaces/oferta';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DialogoConfirmacionComponent } from '../../../presentation/components/dialog/dialogo-confirmacion/dialogo-confirmacion.component';
import { Metodos } from '../../../shared/utility/metodos';
import { IOfertaProducto } from '../../../core/interfaces/Dto/ioferta-producto';
import { DataTableComponent } from "../../../shared/utility/components/data-table/data-table.component";
import { TableColumn } from '../../../shared/utility/components/tableColumn';
import { BaseListComponent } from '../../../shared/utility/components/baseListComponent';
import { MaterialModule } from '../../../shared/ui/material-module';

@Component({
  selector: 'app-oferta-inicio',
  standalone: true,
  imports: [
    MaterialModule,
    RouterOutlet,
    DataTableComponent
],
  templateUrl: './oferta-inicio.component.html',
  styleUrl: './oferta-inicio.component.scss'
})
export class OfertaInicioComponent extends BaseListComponent<IOfertaProducto> {
  private readonly ofertaServicio = inject(OfertaService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  readonly tituloExcel = 'Ofertas';

  columns: TableColumn[] = [
    {key: 'id_Oferta', label: 'No.', type: 'text'},
    {key: 'codigo', label: 'Código', type: 'text'},
    {key: 'nombre_Oferta', label: 'Nombre', type: 'text'},
    {key: 'nombre_Producto', label: 'Producto', type: 'text'},
    {key: 'fecha_Inicio', label: 'Fecha de Inicio', type: 'date'},
    {key: 'fecha_Fin', label: 'Fecha de Fin', type: 'date'},
    {key: 'descuento', label: 'Descuento', type: 'number'},
    {key: 'estado', label: 'Estado', type: 'status'},
    {key: 'accion', label: 'Acción', type: 'actions'}
  ];

  override obtenerDatos(pageNumber: number, pageSize: number, filtro: string ): void {
    const cacheKey = `${pageNumber}-${pageSize}-${filtro}`;

    if (this.filtrosCache.has(cacheKey)) {
      const cached = this.filtrosCache.get(cacheKey);
      this.listaData.data = cached.items;
      this.totalRegistros = cached.totalCount;
      return;
    }

    this.ofertaServicio.listaPaginada(pageNumber, pageSize, filtro).subscribe({
      next: (resp: any) => {
        const arr = resp.data.items ?? [];
        this.totalRegistros = resp.data.totalCount;
        this.listaData.data = arr.map((c: IOferta) => {
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

  eliminar(oferta: IOferta): void {
    const dialogRef = this.dialog.open(DialogoConfirmacionComponent, {
      width: '500px',
      data: {
        mensaje: `¿Está seguro de eliminar la oferta ${oferta.nombre_Oferta}?`
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.ofertaServicio.eliminar(oferta.id_Oferta).subscribe({
          next: (data) => {
            if (data.isSuccess) {
              this.limpiarCache();
              this.obtenerDatos(1, this.pageSize, this.filtroActual);
              this.mostrarMensaje('Oferta eliminado correctamente.', 'success');
            }
          },
          error: (err) => {
            console.log(err.message);
            this.mostrarMensaje('Error al eliminar la oferta.', 'error');
          }
        });
      }
    });
  }

  nuevo(): void {
    this.router.navigate(['oferta/oferta-registro', 0]);
  }

  editar(oferta: IOfertaProducto): void {
    this.router.navigate(['oferta/oferta-editar', oferta.id_Oferta]);
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
    const datos = this.listaData.data.map((oferta) => ({
      ID: oferta.id_Oferta,
      Código: oferta.codigo,
      Nombre: oferta.nombre_Oferta,
      Producto: oferta.nombre_Producto,
      Descripcion: oferta.descripcion,
      'Fecha Inicio': oferta.fecha_Inicio,
      'Fecha Fin': oferta.fecha_Fin,
      Descuento: oferta.descuento,
      Estado: this.getEstado(oferta.estado),
      'Fecha Creacion': this.getFechaRegistro(oferta.fecha_Creacion ?? '')
    }));

    if (!datos || datos.length === 0) {
      this.mostrarMensaje('No hay datos disponibles para exportar a Excel.', 'error');
      return;
    }

    Metodos.exportarExcel(this.tituloExcel, datos, [
      'ID',
      'Código',
      'Nombre',
      'Producto',
      'Descripcion',
      'Fecha Inicio',
      'Fecha Fin',
      'Descuento',
      'Estado',
      'Fecha Creacion'
    ]);
    this.mostrarMensaje('Excel generado exitosamente.', 'success');
  }

  getEstado(estado: boolean): string {
    return estado ? 'Activo' : 'No Activo';
  }

  getFechaInicioFin(fecha: string): string {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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