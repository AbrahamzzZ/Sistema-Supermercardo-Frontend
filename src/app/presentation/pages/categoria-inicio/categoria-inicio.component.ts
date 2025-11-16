import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router, RouterOutlet } from '@angular/router';
import { CategoriaService } from '../../../core/services/categoria.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ICategoria } from '../../../core/interfaces/categoria';
import { MatDialog } from '@angular/material/dialog';
import { Metodos } from '../../../shared/utility/metodos';
import { DialogoConfirmacionComponent } from '../../components/dialog/dialogo-confirmacion/dialogo-confirmacion.component';
import { MatPaginator } from '@angular/material/paginator';
import { NgClass } from '@angular/common';
import { MaterialModule } from '../../../shared/ui/material-module';

@Component({
  selector: 'app-categoria-inicio',
  standalone: true,
  imports: [
    MaterialModule,
    RouterOutlet,
    NgClass,
  ],
  templateUrl: './categoria-inicio.component.html',
  styleUrl: './categoria-inicio.component.scss'
})
export class CategoriaInicioComponent implements AfterViewInit {
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private categoriaServicio = inject(CategoriaService);
  private snackBar = inject(MatSnackBar);
  public listaCategoria = new MatTableDataSource<ICategoria>();
  public tituloExcel = 'Categorías';
  public totalRegistros = 0;
  public pageSize = 5;
  displayedColumns: string[] = [
    'idCategoria',
    'codigo',
    'nombreCategoria',
    'estado',
    'fechaCreacion',
    'accion'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => {
      this.obtenerCategorias(this.paginator.pageIndex + 1, this.paginator.pageSize);
      if (this.listaCategoria.data.length === 0 && this.paginator.hasPreviousPage()) {
        this.paginator.previousPage();
      }
    });
    this.obtenerCategorias(1, this.pageSize);
  }

  obtenerCategorias(pageNumber: number, pageSize: number) {
    this.categoriaServicio.listaPaginada(pageNumber, pageSize).subscribe({
      next: (resp: any) => {
        const arr = resp.data.items ?? [];
        this.totalRegistros = resp.data.totalCount;
        this.listaCategoria.data = arr.map((c: ICategoria) => {
          return c;
        });
      },
      error: (err) => console.error(err.message)
    });
  }

  eliminar(categoria: ICategoria) {
    const dialogRef = this.dialog.open(DialogoConfirmacionComponent, {
      width: '350px',
      data: {
        mensaje: `¿Está seguro de eliminar la categoría ${categoria.nombre_Categoria}?`
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.categoriaServicio.eliminar(categoria.id_Categoria).subscribe({
          next: (data) => {
            if (data.isSuccess) {
              this.obtenerCategorias(this.paginator.pageIndex + 1, this.paginator.pageSize);
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

  nuevo() {
    this.router.navigate(['categoria/categoria-registro', 0]);
  }

  editar(categoria: ICategoria) {
    this.router.navigate(['categoria/categoria-editar', categoria.id_Categoria]);
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

  filtrarCategorias(termino: string) {
    this.listaCategoria.filter = termino.trim().toLowerCase();
    if (this.listaCategoria.paginator) {
      this.listaCategoria.paginator.firstPage();
    }
  }

  exportarExcel() {
    const datos = this.listaCategoria.data.map((categoria) => ({
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
