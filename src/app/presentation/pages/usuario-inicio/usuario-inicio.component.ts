import { Component, inject, ChangeDetectionStrategy, effect } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { UsuarioService } from '../../../core/services/usuario.service';
import { IUsuario } from '../../../core/interfaces/usuario';
import { DialogoConfirmacionComponent } from '../../../presentation/components/dialog/dialogo-confirmacion/dialogo-confirmacion.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Metodos } from '../../../shared/utility/metodos';
import { IUsuarioRol } from '../../../core/interfaces/Dto/iusuario-rol';
import { MaterialModule } from '../../../shared/ui/material-module';
import { DataTableComponent } from '../../../shared/utility/components/data-table/data-table.component';
import { TableColumn } from '../../../shared/utility/components/data-table/table-column';
import { BaseListComponent } from '../../../shared/directive/baseListComponent';
import { filter, switchMap } from 'rxjs';

@Component({
  selector: 'app-usuario-inicio',
  imports: [MaterialModule, RouterOutlet, DataTableComponent],
  templateUrl: './usuario-inicio.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './usuario-inicio.component.scss'
})
export class UsuarioInicioComponent extends BaseListComponent<IUsuarioRol> {
  private readonly usuarioServicio = inject(UsuarioService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  readonly tituloExcel = 'Usuarios';

  columns: TableColumn[] = [
    { key: 'id_Usuario', label: 'No.', type: 'text' },
    { key: 'codigo', label: 'Código', type: 'text' },
    { key: 'nombre_Completo', label: 'Nombres', type: 'text' },
    { key: 'nombre_Rol', label: 'Rol', type: 'text' },
    { key: 'correo_Electronico', label: 'Correo Electrónico', type: 'text' },
    { key: 'estado', label: 'Estado', type: 'status' },
    { key: 'fecha_Creacion', label: 'Fecha de Creación', type: 'date' },
    { key: 'accion', label: 'Acción', type: 'actions' }
  ];

  protected readonly recurso = this.usuarioServicio.listaPaginada(this.params);

  constructor() {
    super();

    effect(() => {
      if (this.recurso.error()) {
        this.mostrarMensaje('Error al cargar los usuarios.', 'error');
      }
    });
  }

  eliminar(usuario: IUsuario): void {
    this.dialog
      .open(DialogoConfirmacionComponent, {
        width: '500px',
        data: { mensaje: `¿Está seguro de eliminar al usuario ${usuario.nombre_Completo}?` }
      })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() => this.usuarioServicio.eliminar(usuario.id_Usuario))
      )
      .subscribe({
        next: (resp) => {
          if (resp.isSuccess) {
            this.refrescarDesdeInicio();
            this.mostrarMensaje('Usaurio eliminado correctamente.', 'success');
          }
        },
        error: () => this.mostrarMensaje('Error al eliminar el usuario.', 'error')
      });
  }

  nuevo(): void {
    this.router.navigate(['usuario/registro']);
  }

  editar(usuario: IUsuarioRol): void {
    this.router.navigate(['usuario/editar', usuario.id_Usuario]);
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
      'Fecha Creacion': Metodos.formatearFecha(usuario.fecha_Creacion)
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
}
