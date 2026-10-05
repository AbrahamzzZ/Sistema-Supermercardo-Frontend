import { Component, inject, ChangeDetectionStrategy, effect } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CategoriaService } from '../../../core/services/categoria.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ICategoria } from '../../../core/interfaces/categoria';
import { MatDialog } from '@angular/material/dialog';
import { Metodos } from '../../../shared/utility/metodos';
import { DialogoConfirmacionComponent } from '../../components/dialog/dialogo-confirmacion/dialogo-confirmacion.component';
import { MaterialModule } from '../../../shared/ui/material-module';
import { DataTableComponent } from '../../../shared/utility/components/data-table/data-table.component';
import { TableColumn } from '../../../shared/utility/components/data-table/table-column';
import { BaseListComponent } from '../../../shared/directive/baseListComponent';
import { switchMap, filter } from 'rxjs';

@Component({
  selector: 'app-categoria-inicio',
  imports: [MaterialModule, RouterOutlet, DataTableComponent],
  templateUrl: './categoria-inicio.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './categoria-inicio.component.scss'
})
export class CategoriaInicioComponent extends BaseListComponent<ICategoria> {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly categoriaServicio = inject(CategoriaService);
  private readonly snackBar = inject(MatSnackBar);
  readonly tituloExcel = 'Categorías';

  columns: TableColumn[] = [
    { key: 'id_Categoria', label: 'No.', type: 'text' },
    { key: 'codigo', label: 'Código', type: 'text' },
    { key: 'nombre_Categoria', label: 'Nombre', type: 'text' },
    { key: 'estado', label: 'Estado', type: 'status' },
    { key: 'fecha_Creacion', label: 'Fecha de Registro', type: 'date' },
    { key: 'accion', label: 'Acción', type: 'actions' }
  ];

  protected readonly recurso = this.categoriaServicio.listaPaginada(this.params);

  constructor() {
    super();

    effect(() => {
      if (this.recurso.error()) {
        this.mostrarMensaje('Error al cargar las categorías.', 'error');
      }
    });
  }

  eliminar(categoria: ICategoria): void {
    this.dialog
      .open(DialogoConfirmacionComponent, {
        width: '500px',
        data: { mensaje: `¿Está seguro de eliminar la categoría ${categoria.nombre_Categoria}?` }
      })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() => this.categoriaServicio.eliminar(categoria.id_Categoria))
      )
      .subscribe({
        next: (resp) => {
          if (resp.isSuccess) {
            this.refrescarDesdeInicio();
            this.mostrarMensaje('Categoría eliminada correctamente.', 'success');
          }
        },
        error: () => this.mostrarMensaje('Error al eliminar la categoría.', 'error')
      });
  }

  nuevo(): void {
    this.router.navigate(['categoria/registro'])
    .catch(() => this.mostrarMensaje('No se pudo abrir el formulario de registro.', 'error'));
  }

  editar(categoria: ICategoria): void {
    this.router.navigate(['categoria/editar', categoria.id_Categoria])
    .catch(() => this.mostrarMensaje('No se pudo abrir el formulario de edición.', 'error'));
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
    const datos = this.listaData.data.map((categoria) => ({
      ID: categoria.id_Categoria,
      Código: categoria.codigo,
      Nombre: categoria.nombre_Categoria,
      Estado: this.getEstado(categoria.estado),
      'Fecha Creacion': Metodos.formatearFecha(categoria.fecha_Creacion)
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
}
