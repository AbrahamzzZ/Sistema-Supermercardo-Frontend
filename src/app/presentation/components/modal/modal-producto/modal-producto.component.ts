import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { IProducto } from '../../../../core/interfaces/producto';
import { ProductoService } from '../../../../core/services/producto.service';
import { ProductoStockService } from '../../../../core/services/producto-stock.service';
import { switchMap } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { DataTableComponent } from '../../../../shared/utility/components/data-table/data-table.component';
import { TableColumn } from '../../../../shared/utility/components/data-table/table-column';

@Component({
  selector: 'app-modal-producto',
  imports: [MaterialModule, DataTableComponent],
  templateUrl: './modal-producto.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './modal-producto.component.scss'
})
export class ModalProductoComponent {
  private readonly productoService = inject(ProductoService);
  private readonly productoStockService = inject(ProductoStockService);
  private readonly dialogRef = inject(MatDialogRef<ModalProductoComponent>);
  dataSource = new MatTableDataSource<IProducto>([]);
  columnas: TableColumn[] = [
    { key: 'id_Producto', label: 'ID', type: 'number' },
    { key: 'codigo', label: 'Código', type: 'text' },
    { key: 'nombre_Producto', label: 'Nombre', type: 'text' },
    { key: 'stock', label: 'Stock', type: 'number' },
    { key: 'accion', label: 'Acción', type: 'select' }
  ];
  filtro = '';

  constructor() {
    this.obtenerProductos();
  }

  obtenerProductos() {
    this.productoService
      .lista()
      .pipe(
        // En microservicios el stock vive en Inventory: se completa con una sola consulta
        switchMap((resp: any) =>
          this.productoStockService.completarLista(
            resp.data.filter((data: IProducto) => data.estado === false)
          )
        )
      )
      .subscribe({
        next: (productos: IProducto[]) => {
          this.dataSource.data = productos;

          this.dataSource.filterPredicate = (data: IProducto, filter: string) => {
            const termino = filter.trim().toLowerCase();
            return (
              data.nombre_Producto.toLowerCase().includes(termino) ||
              data.codigo.toLowerCase().includes(termino)
            );
          };
        },
        error: (e) => console.error(e)
      });
  }

  aplicarFiltro(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.filtro = value;
    this.dataSource.filter = value.trim().toLowerCase();
  }

  limpiarFiltro(input: HTMLInputElement) {
    input.value = '';
    this.filtro = '';
    this.dataSource.filter = '';
  }

  seleccionarProducto(producto: IProducto) {
    this.dialogRef.close(producto);
  }

  cerrar() {
    this.dialogRef.close();
  }

  getEstado(estado: boolean): string {
    return estado ? 'Agotado' : 'No Agotado';
  }
}
