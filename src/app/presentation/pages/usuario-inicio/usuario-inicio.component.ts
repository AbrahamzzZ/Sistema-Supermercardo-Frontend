import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { UsuarioService } from '../../../core/services/usuario.service';
import { IUsuario } from '../../../core/interfaces/usuario';
import { DialogoConfirmacionComponent } from '../../../presentation/components/dialog/dialogo-confirmacion/dialogo-confirmacion.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Metodos } from '../../../shared/utility/metodos';
import { IUsuarioRol } from '../../../core/interfaces/Dto/iusuario-rol';
import { MaterialModule } from '../../../shared/ui/material-module';
import { DataTableComponent } from "../../../shared/utility/components/data-table/data-table.component";
import { TableColumn } from '../../../shared/utility/components/tableColumn';
import { BaseListComponent } from '../../../shared/utility/components/baseListComponent';

@Component({
  selector: 'app-usuario-inicio',
  standalone: true,
  imports: [
    MaterialModule,
    RouterOutlet,
    DataTableComponent
],
  templateUrl: './usuario-inicio.component.html',
  styleUrl: './usuario-inicio.component.scss'
})
export class UsuarioInicioComponent extends BaseListComponent<IUsuarioRol> {
  private readonly usuarioServicio = inject(UsuarioService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  readonly tituloExcel = 'Usuarios';

  columns: TableColumn[] = [
    {key: 'id_Usuario', label: 'No.', type: 'text'},
    {key: 'codigo', label: 'Código', type: 'text'},
    {key: 'nombre_Completo', label: 'Nombres', type: 'text'},
    {key: 'nombre_Rol', label: 'Rol', type: 'text'},
    {key: 'correo_Electronico', label: 'Correo Electrónico', type: 'text'},
    {key: 'estado', label: 'Estado', type: 'status'},
    {key: 'fecha_Creacion', label: 'Fecha de Creación', type: 'date'},
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

    this.usuarioServicio.listaPaginada(pageNumber, pageSize, filtro).subscribe({
      next: (resp: any) => {
        const arr = resp.data.items ?? [];
        this.totalRegistros = resp.data.totalCount;
        this.listaData.data = arr.map((u: IUsuario) => {
          return u;
        });

        this.filtrosCache.set(cacheKey, {
          items: arr,
          totalCount: this.totalRegistros
        });
      },
      error: (err) => console.error(err.message)
    });
  }

  eliminar(usuario: IUsuario): void {
    const dialogRef = this.dialog.open(DialogoConfirmacionComponent, {
      width: '500px',
      data: { mensaje: `¿Está seguro de eliminar al usuario ${usuario.nombre_Completo}?` }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.usuarioServicio.eliminar(usuario.id_Usuario).subscribe({
          next: (data) => {
            if (data.isSuccess) {
              this.limpiarCache();
              this.obtenerDatos(1, this.pageSize, this.filtroActual);
              this.mostrarMensaje('Usuario eliminado correctamente.', 'success');
            }
          },
          error: (err) => {
            console.log(err.message);
            this.mostrarMensaje('Error al eliminar al usuario.', 'error');
          }
        });
      }
    });
  }

  nuevo(): void {
    this.router.navigate(['usuario/usuario-registro', 0]);
  }

  editar(usuario: IUsuarioRol): void {
    this.router.navigate(['usuario/usuario-editar', usuario.id_Usuario]);
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
    const datos = this.listaData.data.map((usuario) => ({
      ID: usuario.id_Usuario,
      Código: usuario.codigo,
      'Nombre Completo': usuario.nombre_Completo,
      'Correo Electronico': usuario.correo_Electronico,
      Rol: usuario.nombre_Rol,
      Estado: this.getEstado(usuario.estado),
      'Fecha Creacion': this.getFechaCreacion(usuario.fecha_Creacion)
    }));

    if (!datos || datos.length === 0) {
      this.mostrarMensaje('No hay datos disponibles para exportar a Excel.', 'error');
      return;
    }

    Metodos.exportarExcel(this.tituloExcel, datos, [
      'ID',
      'Código',
      'Nombre Completo',
      'Correo Electronico',
      'Rol',
      'Estado',
      'Fecha Creacion'
    ]);
    this.mostrarMensaje('Excel generado exitosamente.', 'success');
  }

  getEstado(estado: boolean): string {
    return estado ? 'Activo' : 'No Activo';
  }

  getFechaCreacion(fecha: string): string {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}