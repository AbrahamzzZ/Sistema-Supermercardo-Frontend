import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ProductoService } from '../../../core/services/producto.service';
import { IProducto } from '../../../core/interfaces/producto';
import { DialogoConfirmacionComponent } from '../../components/dialog/dialogo-confirmacion/dialogo-confirmacion.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Metodos } from '../../../shared/utility/metodos';
import { IProductoCategoria } from '../../../core/interfaces/Dto/iproducto-categoria';
import { MaterialModule } from '../../../shared/ui/material-module';
import { DataTableComponent } from "../../../shared/utility/components/data-table/data-table.component";
import { TableColumn } from '../../../shared/utility/components/tableColumn';
import { BaseListComponent } from '../../../shared/utility/components/baseListComponent';

@Component({
  selector: 'app-producto-inicio',
  standalone: true,
  imports: [
    MaterialModule,
    RouterOutlet,
    DataTableComponent
],
  templateUrl: './producto-inicio.component.html',
  styleUrl: './producto-inicio.component.scss'
})
export class ProductoInicioComponent extends BaseListComponent<IProductoCategoria> {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly productoServicio = inject(ProductoService);
  private readonly snackBar = inject(MatSnackBar);
  readonly tituloExcel = 'Productos';

  columns: TableColumn[] = [
    {key: 'id_Producto', label: 'No.', type: 'text'},
    {key: 'codigo', label: 'Código', type: 'text'},
    {key: 'nombre_Producto', label: 'Nombre', type: 'text'},
    {key: 'descripcion', label: 'Descripción', type: 'text'},
    {key: 'nombre_Categoria', label: 'Categoría', type: 'text'},
    {key: 'pais_Origen', label: 'País de Origen', type: 'text'},
    {key: 'stock', label: 'Stock Disponible', type: 'text'},
    {key: 'precio_Compra', label: 'Precio de Compra', type: 'currency'},
    {key: 'precio_Venta', label: 'Precio de Venta', type: 'currency'},
    {key: 'estado', label: 'Estado', type: 'stock'},
    {key: 'accion', label: 'Acción', type: 'actions'}
  ];

  override obtenerDatos(pageNumber: number, pageSize: number, filtro: string): void {
    const cacheKey = `${pageNumber}-${pageSize}-${filtro}`;

    if (this.filtrosCache.has(cacheKey)) {
      const cached = this.filtrosCache.get(cacheKey);
      this.listaData.data = cached.items;
      this.totalRegistros = cached.totalCount;
      this.verificarStockBajo(cached.items);
      return;
    }

    this.productoServicio.listaPaginada(pageNumber, pageSize, filtro).subscribe({
      next: (resp: any) => {
        const arr = resp.data.items ?? [];
        this.totalRegistros = resp.data.totalCount;
        this.listaData.data = arr.map((c: IProducto) => {
          return c;
        });
        this.verificarStockBajo(arr);

        this.filtrosCache.set(cacheKey, {
          items: arr,
          totalCount: this.totalRegistros
        });
      },
      error: (err) => console.error(err.message)
    });
  }

  verificarStockBajo(productos: IProducto[]): void {
    const productosStockBajo = productos.filter(p => p.stock !== undefined && p.stock < 10 && p.stock > 0);
    const productosAgotados = productos.filter(p => p.stock === 0);

    if (productosAgotados.length > 0) {
      this.mostrarMensaje(`${productosAgotados.length} producto(s) sin stock disponible.`, 'error');
    }

    if (productosStockBajo.length > 0) {
      this.mostrarMensaje(`${productosStockBajo.length} producto(s) con stock bajo.`, 'warning');
    }
  }

  eliminar(producto: IProducto): void {
    const dialogRef = this.dialog.open(DialogoConfirmacionComponent, {
      width: '500px',
      data: { mensaje: `¿Está seguro de eliminar este producto ${producto.nombre_Producto}?` }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.productoServicio.eliminar(producto.id_Producto).subscribe({
          next: (data) => {
            if (data.isSuccess) {
              this.limpiarCache();
              this.obtenerDatos(1, this.pageSize, this.filtroActual);
              this.mostrarMensaje('Producto eliminado correctamente.', 'success');
            }
          },
          error: (err) => {
            console.log(err.message);
            this.mostrarMensaje('Error al eliminar el Producto.', 'error');
          }
        });
      }
    });
  }

  nuevo(): void {
    this.router.navigate(['producto/producto-registro', 0]);
  }

  editar(producto: IProducto): void {
    this.router.navigate(['producto/producto-editar', producto.id_Producto]);
  }

  mostrarMensaje(mensaje: string, tipo: 'success' | 'error' | 'warning' = 'success'): void {
    const className = tipo === 'success' ? 'success-snackbar' : tipo === 'warning' ? 'warning-snackbar' : 'error-snackbar';

    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: [className]
    });
  }

  exportarExcel(): void {
    const datos = this.listaData.data.map((producto) => ({
      ID: producto.id_Producto,
      Código: producto.codigo,
      Nombre: producto.nombre_Producto,
      Descripción: producto.descripcion,
      Categoría: producto.nombre_Categoria,
      'País Origen': producto.pais_Origen,
      Stock: producto.stock,
      'Precio Compra': producto.precio_Compra,
      'Precio Venta': producto.precio_Venta,
      Estado: this.getEstado(producto.estado)
    }));

    if (!datos || datos.length === 0) {
      this.mostrarMensaje('No hay datos disponibles para exportar a Excel.', 'error');
      return;
    }

    Metodos.exportarExcel(this.tituloExcel, datos, [
      'ID',
      'Código',
      'Nombre',
      'Descripción',
      'Categoría',
      'País Origen',
      'Stock',
      'Precio Compra',
      'Precio Venta',
      'Estado'
    ]);
    this.mostrarMensaje('Excel generado exitosamente.', 'success');
  }

  getEstado(estado: boolean): string {
    return estado ? 'Agotado' : 'No Agotado';
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