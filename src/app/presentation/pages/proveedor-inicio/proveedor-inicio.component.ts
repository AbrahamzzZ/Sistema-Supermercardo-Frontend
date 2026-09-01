import { Component, inject, OnInit } from '@angular/core';
import { MatTableDataSource} from '@angular/material/table';
import { Router, RouterOutlet } from '@angular/router';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { IProveedor } from '../../../core/interfaces/proveedor';
import { DialogoConfirmacionComponent } from '../../components/dialog/dialogo-confirmacion/dialogo-confirmacion.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Metodos } from '../../../shared/utility/metodos';
import { MaterialModule } from '../../../shared/ui/material-module';
import { DataTableComponent } from "../../../shared/utility/components/data-table/data-table.component";
import { PageEvent } from '@angular/material/paginator';
import { TableColumn } from '../../../shared/utility/components/tableColumn';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-proveedor-inicio',
  standalone: true,
  imports: [
    MaterialModule,
    RouterOutlet,
    DataTableComponent
],
  templateUrl: './proveedor-inicio.component.html',
  styleUrl: './proveedor-inicio.component.scss'
})
export class ProveedorInicioComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly proveedorServicio = inject(ProveedorService);
  private readonly snackBar = inject(MatSnackBar);
  public listaProveedor = new MatTableDataSource<IProveedor>();
  public tituloExcel = 'Proveedores';
  public totalRegistros = 0;
  public pageSize = 5;
  public filtroActual = '';
  private readonly filtroSubject = new Subject<string>();
  private readonly filtrosCache = new Map<string, any>(); 
  private abortController = new AbortController(); 

  columns: TableColumn[] = [
    {key: 'id_Proveedor', label: 'No.', type: 'text'},
    {key: 'codigo', label: 'Código', type: 'text'},
    {key: 'nombres', label: 'Nombres', type: 'text'},
    {key: 'apellidos', label: 'Apellidos', type: 'text'},
    {key: 'cedula', label: 'Cédula', type: 'text'},
    {key: 'telefono', label: 'Teléfono', type: 'text'},
    {key: 'correo_Electronico', label: 'Correo Electrónico', type: 'text'},
    {key: 'estado', label: 'Estado', type: 'status'},
    {key: 'fecha_Creacion', label: 'Fecha de Creación', type: 'date'},
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
      this.obtenerProveedores(1, this.pageSize, filtro);
    });

    this.obtenerProveedores(1, this.pageSize, '');
  }

  cambiarPagina(event: PageEvent) {
    this.obtenerProveedores(
      event.pageIndex + 1,
      event.pageSize,
      this.filtroActual
    );
  }

  obtenerProveedores(pageNumber: number, pageSize: number, filtro: string) {
    const cacheKey = `${pageNumber}-${pageSize}-${filtro}`;

    if (this.filtrosCache.has(cacheKey)) {
      const cached = this.filtrosCache.get(cacheKey);
      this.listaProveedor.data = cached.items;
      this.totalRegistros = cached.totalCount;
      return;
    }

    this.proveedorServicio.listaPaginada(pageNumber, pageSize, filtro).subscribe({
      next: (resp: any) => {
        const arr = resp.data.items ?? [];
        this.totalRegistros = resp.data.totalCount;
        this.listaProveedor.data = arr.map((c: IProveedor) => {
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

  filtrarProveedores(termino: string) {
    this.filtroActual = termino.trim();
    this.abortController.abort();
    this.abortController = new AbortController();
    this.filtroSubject.next(this.filtroActual);
  }

  eliminar(proveedor: IProveedor) {
    const dialogRef = this.dialog.open(DialogoConfirmacionComponent, {
      width: '500px',
      data: {
        mensaje: `¿Está seguro de eliminar al proveedor ${proveedor.nombres} ${proveedor.apellidos}?`
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.proveedorServicio.eliminar(proveedor.id_Proveedor).subscribe({
          next: (data) => {
            if (data.isSuccess) {
              this.filtrosCache.clear(); 
              this.obtenerProveedores(1, this.pageSize, this.filtroActual);
              this.mostrarMensaje('Proveedor eliminado correctamente.', 'success');
            }
          },
          error: (err) => {
            console.log(err.message);
            this.mostrarMensaje('Error al eliminar el Proveedor.', 'error');
          }
        });
      }
    });
  }

  nuevo() {
    this.router.navigate(['proveedor/proveedor-registro', 0]);
  }

  editar(proveedor: IProveedor) {
    this.router.navigate(['proveedor/proveedor-editar', proveedor.id_Proveedor]);
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
    const datos = this.listaProveedor.data.map((proveedor) => ({
      ID: proveedor.id_Proveedor,
      Código: proveedor.codigo,
      Nombres: proveedor.nombres,
      Apellidos: proveedor.apellidos,
      Cedula: proveedor.cedula,
      Telefono: proveedor.telefono,
      'Correo Electronico': proveedor.correo_Electronico,
      Estado: this.getEstado(proveedor.estado),
      'Fecha Creacion': this.getFechaRegistro(proveedor.fecha_Creacion ?? '')
    }));

    if (!datos || datos.length === 0) {
      this.mostrarMensaje('No hay datos disponibles para exportar a Excel.', 'error');
      return;
    }

    Metodos.exportarExcel(this.tituloExcel, datos, [
      'ID',
      'Código',
      'Nombres',
      'Apellidos',
      'Cedula',
      'Telefono',
      'Correo Electronico',
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