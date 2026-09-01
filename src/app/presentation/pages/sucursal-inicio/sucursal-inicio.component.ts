import { Component, inject, OnInit } from '@angular/core';
import { SucursalService } from '../../../core/services/sucursal.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Router, RouterOutlet } from '@angular/router';
import {  PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DialogoConfirmacionComponent } from '../../components/dialog/dialogo-confirmacion/dialogo-confirmacion.component';
import { Metodos } from '../../../shared/utility/metodos';
import { ISucursalNegocio } from '../../../core/interfaces/Dto/sucursal-negocio';
import { ISucursal } from '../../../core/interfaces/sucursal';
import { MaterialModule } from '../../../shared/ui/material-module';
import { DataTableComponent } from "../../../shared/utility/components/data-table/data-table.component";
import { TableColumn } from '../../../shared/utility/components/tableColumn';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

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
export class SucursalInicioComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly sucursalServicio = inject(SucursalService);
  private readonly snackBar = inject(MatSnackBar);
  public listaSucursal = new MatTableDataSource<ISucursalNegocio>();
  public tituloExcel = 'Sucursales';
  public totalRegistros = 0;
  public pageSize = 5;
  public filtroActual = '';
  private readonly filtroSubject = new Subject<string>(); 
  private readonly filtrosCache = new Map<string, any>(); 
  private abortController = new AbortController(); 

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
      this.obtenerSucursales(1, this.pageSize, filtro);
    });

    this.obtenerSucursales(1, this.pageSize, '');
  }

  cambiarPagina(event: PageEvent) {
    this.obtenerSucursales(
      event.pageIndex + 1,
      event.pageSize,
      this.filtroActual 
    );
  }

  obtenerSucursales(pageNumber: number, pageSize: number, filtro: string) {
    const cacheKey = `${pageNumber}-${pageSize}-${filtro}`;

    if (this.filtrosCache.has(cacheKey)) {
      const cached = this.filtrosCache.get(cacheKey);
      this.listaSucursal.data = cached.items;
      this.totalRegistros = cached.totalCount;
      return;
    }

    this.sucursalServicio.listaPaginada(pageNumber, pageSize, filtro).subscribe({
      next: (resp: any) => {
        const arr = resp.data.items ?? [];
        this.totalRegistros = resp.data.totalCount;
        this.listaSucursal.data = arr.map((c: ISucursal) => {
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

  filtrarSucursales(termino: string) {
    this.filtroActual = termino.trim();
    this.abortController.abort();
    this.abortController = new AbortController();
    this.filtroSubject.next(this.filtroActual);
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
              this.filtrosCache.clear();
              this.obtenerSucursales(1, this.pageSize, this.filtroActual);
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

  verMapa() {
    this.router.navigate(['sucursal/mapa']);
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