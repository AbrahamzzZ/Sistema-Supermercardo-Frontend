import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router, RouterOutlet } from '@angular/router';
import { ProductoService } from '../../core/services/producto.service';
import { IProducto } from '../../core/interfaces/producto';
import { DialogoConfirmacionComponent } from '../../presentation/components/dialog/dialogo-confirmacion/dialogo-confirmacion.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgClass } from '@angular/common';
import { Metodos } from '../../shared/utility/metodos';
import { MatPaginator } from '@angular/material/paginator';
import { IProductoCategoria } from '../../core/interfaces/Dto/iproducto-categoria';
import { MaterialModule } from '../../shared/ui/material-module';

@Component({
  selector: 'app-producto-inicio',
  standalone: true,
  imports: [
    MaterialModule,
    RouterOutlet,
    NgClass,
  ],
  templateUrl: './producto-inicio.component.html',
  styleUrl: './producto-inicio.component.scss'
})
export class ProductoInicioComponent implements AfterViewInit {
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private productoServicio = inject(ProductoService);
  private snackBar = inject(MatSnackBar);
  public listaProducto = new MatTableDataSource<IProductoCategoria>();
  public tituloExcel = 'Productos';
  public totalRegistros = 0;
  public pageSize = 5;
  public displayedColumns: string[] = [
    'id',
    'codigo',
    'nombre',
    'descripcion',
    'categoria',
    'pais_Origen',
    'stock',
    'precio_Compra',
    'precio_Venta',
    'estado',
    'accion'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => {
      this.obtenerProductos(this.paginator.pageIndex + 1, this.paginator.pageSize);
      if (this.listaProducto.data.length === 0 && this.paginator.hasPreviousPage()) {
        this.paginator.previousPage();
      }
    });
    this.obtenerProductos(1, this.pageSize);
  }

  obtenerProductos(pageNumber: number, pageSize: number) {
    this.productoServicio.listaPaginada(pageNumber, pageSize).subscribe({
      next: (resp: any) => {
        const arr = resp.data.items ?? [];
        this.totalRegistros = resp.data.totalCount;
        this.listaProducto.data = arr.map((c: IProducto) => {
          return c;
        });
      },
      error: (err) => console.error(err.message)
    });
  }

  eliminar(producto: IProducto) {
    const dialogRef = this.dialog.open(DialogoConfirmacionComponent, {
      width: '350px',
      data: { mensaje: `¿Está seguro de eliminar este producto ${producto.nombre_Producto}?` }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.productoServicio.eliminar(producto.id_Producto).subscribe({
          next: (data) => {
            if (data.isSuccess) {
              this.obtenerProductos(this.paginator.pageIndex + 1, this.paginator.pageSize);
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

  nuevo() {
    this.router.navigate(['producto/producto-registro', 0]);
  }

  editar(producto: IProducto) {
    this.router.navigate(['producto/producto-editar', producto.id_Producto]);
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

  filtrarProductos(termino: string) {
    this.listaProducto.filter = termino.trim().toLowerCase();
    if (this.listaProducto.paginator) {
      this.listaProducto.paginator.firstPage();
    }
  }

  exportarExcel() {
    const datos = this.listaProducto.data.map((producto) => ({
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

    Metodos.exportarExcel('Productos', datos, [
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
