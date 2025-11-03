import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router, RouterOutlet } from '@angular/router';
import { UsuarioService } from '../../core/services/usuario.service';
import { IUsuario } from '../../core/interfaces/usuario';
import { DialogoConfirmacionComponent } from '../../presentation/components/dialog/dialogo-confirmacion/dialogo-confirmacion.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { NgClass } from '@angular/common';
import { Metodos } from '../../shared/utility/metodos';
import { IUsuarioRol } from '../../core/interfaces/Dto/iusuario-rol';
import { MaterialModule } from '../../shared/ui/material-module';

@Component({
  selector: 'app-usuario-inicio',
  standalone: true,
  imports: [
    MaterialModule,
    RouterOutlet,
    NgClass,
  ],
  templateUrl: './usuario-inicio.component.html',
  styleUrl: './usuario-inicio.component.scss'
})
export class UsuarioInicioComponent implements AfterViewInit {
  private usuarioServicio = inject(UsuarioService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  public listaUsuario = new MatTableDataSource<IUsuarioRol>();
  public totalRegistros = 0;
  public pageSize = 5;
  public displayedColumns: string[] = [
    'id',
    'codigo',
    'nombre_Completo',
    'correo_Electronico',
    'rol',
    'estado',
    'fecha_Creacion',
    'accion'
  ];
  public tituloExcel = 'Usuarios';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => {
      this.obtenerUsuarios(this.paginator.pageIndex + 1, this.paginator.pageSize);
      if (this.listaUsuario.data.length === 0 && this.paginator.hasPreviousPage()) {
        this.paginator.previousPage();
      }
    });
    this.obtenerUsuarios(1, this.pageSize);
  }

  obtenerUsuarios(pageNumber: number, pageSize: number) {
    this.usuarioServicio.listaPaginada(pageNumber, pageSize).subscribe({
      next: (resp: any) => {
        const arr = resp.data.items ?? [];
        this.totalRegistros = resp.data.totalCount;
        this.listaUsuario.data = arr.map((u: IUsuario) => {
          return u;
        });
      },
      error: (err) => console.error(err.message)
    });
  }

  eliminar(usuario: IUsuario) {
    const dialogRef = this.dialog.open(DialogoConfirmacionComponent, {
      width: '350px',
      data: { mensaje: `¿Está seguro de eliminar al usuario ${usuario.nombre_Completo}?` }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.usuarioServicio.eliminar(usuario.id_Usuario).subscribe({
          next: (data) => {
            if (data.isSuccess) {
              this.obtenerUsuarios(this.paginator.pageIndex + 1, this.paginator.pageSize);
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

  nuevo() {
    this.router.navigate(['usuario/usuario-registro', 0]);
  }

  editar(usuario: IUsuarioRol) {
    this.router.navigate(['usuario/usuario-editar', usuario.id_Usuario]);
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

  filtrarUsuarios(termino: string) {
    this.listaUsuario.filter = termino.trim().toLowerCase();
    if (this.listaUsuario.paginator) {
      this.listaUsuario.paginator.firstPage();
    }
  }

  exportarExcel() {
    const datos = this.listaUsuario.data.map((usuario) => ({
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
