import { Component, inject, OnInit } from '@angular/core';
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
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { IOfertaProducto } from '../../../core/interfaces/Dto/ioferta-producto';
import { DataTableComponent } from "../../../shared/utility/components/data-table/data-table.component";
import { TableColumn } from '../../../shared/utility/components/tableColumn';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-oferta-inicio',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIcon,
    MatFormFieldModule,
    MatInputModule,
    RouterOutlet,
    MatPaginatorModule,
    DataTableComponent
],
  templateUrl: './oferta-inicio.component.html',
  styleUrl: './oferta-inicio.component.scss'
})
export class OfertaInicioComponent implements OnInit {
  private readonly ofertaServicio = inject(OfertaService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  public listaOferta = new MatTableDataSource<IOfertaProducto>();
  public tituloExcel = 'Ofertas';
  public totalRegistros = 0;
  public pageSize = 5;
  public filtroActual = '';
  
  private readonly filtroSubject = new Subject<string>();
  private readonly filtrosCache = new Map<string, any>(); 
  private abortController = new AbortController();

  columns: TableColumn[] = [
    {key: 'id_Oferta', label: 'No.', type: 'text'},
    {key: 'codigo', label: 'Código', type: 'text'},
    {key: 'nombre', label: 'Nombre', type: 'text'},
    {key: 'nombre_Producto', label: 'Producto', type: 'text'},
    {key: 'fecha_Inicio', label: 'Fecha de Inicio', type: 'date'},
    {key: 'fecha_Fin', label: 'Fecha de Fin', type: 'date'},
    {key: 'descuento', label: 'Descuento', type: 'number'},
    {key: 'estado', label: 'Estado', type: 'status'},
    {key: 'accion', label: 'Acción', type: 'actions'}
  ];

  ngOnInit() {
    this.filtroSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((filtro) => {
        return new Promise<string>((resolve) => {
          resolve(filtro);
        });
      })
    ).subscribe((filtro) => {
      this.obtenerOfertas(1, this.pageSize, filtro);
    });

    this.obtenerOfertas(1, this.pageSize, '');
  }

  cambiarPagina(event: PageEvent) {
    this.obtenerOfertas(
      event.pageIndex + 1,
      event.pageSize,
      this.filtroActual
    );
  }

  obtenerOfertas(pageNumber: number, pageSize: number, filtro: string = '') {
    const cacheKey = `${pageNumber}-${pageSize}-${filtro}`;

    if (this.filtrosCache.has(cacheKey)) {
      const cached = this.filtrosCache.get(cacheKey);
      this.listaOferta.data = cached.items;
      this.totalRegistros = cached.totalCount;
      return;
    }

    this.ofertaServicio.listaPaginada(pageNumber, pageSize, filtro).subscribe({
      next: (resp: any) => {
        const arr = resp.data.items ?? [];
        this.totalRegistros = resp.data.totalCount;
        this.listaOferta.data = arr.map((c: IOferta) => {
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

  filtrarOfertas(termino: string) {
    this.filtroActual = termino.trim();
    this.abortController.abort();
    this.abortController = new AbortController();
    this.filtroSubject.next(this.filtroActual);
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
              this.filtrosCache.clear(); // ← LIMPIAR CACHE
              this.obtenerOfertas(1, this.pageSize, this.filtroActual);
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