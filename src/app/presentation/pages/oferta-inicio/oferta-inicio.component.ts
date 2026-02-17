import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router, RouterOutlet } from '@angular/router';
import { OfertaService } from '../../../core/services/oferta.service';
import { IOferta } from '../../../core/interfaces/oferta';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DialogoConfirmacionComponent } from '../../../presentation/components/dialog/dialogo-confirmacion/dialogo-confirmacion.component';
import { Metodos } from '../../../shared/utility/metodos';
import { NgClass } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { IOfertaProducto } from '../../../core/interfaces/Dto/ioferta-producto';

@Component({
  selector: 'app-oferta-inicio',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIcon,
    NgClass,
    MatFormFieldModule,
    MatInputModule,
    RouterOutlet,
    MatPaginatorModule
  ],
  templateUrl: './oferta-inicio.component.html',
  styleUrl: './oferta-inicio.component.scss'
})
export class OfertaInicioComponent implements AfterViewInit {
  private ofertaServicio = inject(OfertaService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  public listaOferta = new MatTableDataSource<IOfertaProducto>();
  public tituloExcel = 'Ofertas';
  public totalRegistros = 0;
  public pageSize = 5;
  public displayedColumns: string[] = [
    'id',
    'codigo',
    'nombre',
    'nombre_Producto',
    'descripcion',
    'fecha_Inicio',
    'fecha_Fin',
    'descuento',
    'estado',
    'accion'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => {
      this.obtenerOfertas(this.paginator.pageIndex + 1, this.paginator.pageSize);
      if (this.listaOferta.data.length === 0 && this.paginator.hasPreviousPage()) {
        this.paginator.previousPage();
      }
    });
    this.obtenerOfertas(1, this.pageSize);
  }

  obtenerOfertas(pageNumber: number, pageSize: number) {
    this.ofertaServicio.listaPaginada(pageNumber, pageSize).subscribe({
      next: (resp: any) => {
        const arr = resp.data.items ?? [];
        this.totalRegistros = resp.data.totalCount;
        this.listaOferta.data = arr.map((c: IOferta) => {
          return c;
        });
      },
      error: (err) => console.error(err.message)
    });
  }

  eliminar(oferta: IOferta) {
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
              this.obtenerOfertas(this.paginator.pageIndex + 1, this.paginator.pageSize);
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

  nuevo() {
    this.router.navigate(['oferta/oferta-registro', 0]);
  }

  editar(oferta: IOfertaProducto) {
    this.router.navigate(['oferta/oferta-editar', oferta.id_Oferta]);
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

  filtrarOfertas(termino: string) {
    this.listaOferta.filter = termino.trim().toLowerCase();
    if (this.listaOferta.paginator) {
      this.listaOferta.paginator.firstPage();
    }
  }

  exportarExcel() {
    const datos = this.listaOferta.data.map((oferta) => ({
      ID: oferta.id_Oferta,
      Código: oferta.codigo,
      Nombre: oferta.nombre_Oferta,
      Producto: oferta.nombre_Producto,
      Descripcion: oferta.descripcion,
      'Fecha Inicio': oferta.fecha_Inicio,
      'Fecha Fin': oferta.fecha_Fin,
      Descuento: oferta.descuento,
      Estado: oferta.estado,
      'Fecha Creacion': oferta.fecha_Creacion
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
}
