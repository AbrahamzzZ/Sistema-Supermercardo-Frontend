import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy
} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TableColumn } from './table-column';

import { FormatoFechaPipe } from '../../../pipes/formato-fecha.pipe';
import { Metodos } from '../../metodos';
import { IMAGE_DEFAULT } from '../../../../core/constants/imageDefault.const';
import { MaterialModule } from '../../../ui/material-module';

@Component({
  selector: 'app-data-table',
  imports: [MaterialModule, FormatoFechaPipe],
  templateUrl: './data-table.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent {
  @Input() dataSource = new MatTableDataSource<any>();

  @Input() columns: TableColumn[] = [];

  @Input() totalRegistros = 0;

  @Input() pageSize = 5;

  @Input() pageIndex = 0;

  @Input() pageSizeOptions: number[] = [5, 10, 20];

  @Input() mensajeSinDatos = 'No hay datos que mostrar.';

  @Input() cargando = false;

  @Output() editar = new EventEmitter<any>();

  @Output() eliminar = new EventEmitter<any>();

  @Output() ver = new EventEmitter<any>();

  @Output() seleccionar = new EventEmitter<any>();

  @Output() cambioPagina = new EventEmitter<PageEvent>();

  get displayedColumns(): string[] {
    return this.columns.map((column) => column.key);
  }

  // Skeleton solo en la primera carga; al paginar/filtrar se mantienen las filas previas atenuadas.
  get mostrarSkeleton(): boolean {
    return this.cargando && this.dataSource.data.length === 0;
  }

  private _filasSkeleton: number[] = [];

  // Se cachea para no entregar un array nuevo al mat-table en cada detección de cambios.
  get filasSkeleton(): number[] {
    if (this._filasSkeleton.length !== this.pageSize) {
      this._filasSkeleton = Array.from({ length: this.pageSize }, (_, i) => i);
    }
    return this._filasSkeleton;
  }

  getEstado(estado: boolean): string {
    return estado ? 'Activo' : 'Inactivo';
  }

  getEstadoStock(stock: number): string {
    return stock > 0 ? 'Agotado' : 'No Agotado';
  }

  getImageSource(element: unknown, key: string): string {
    const row = element as Record<string, unknown> | null;
    const value = [key, 'foto', 'imagen', 'imagenBase64', 'imageBase64', 'Foto', 'Imagen']
      .map((field) => row?.[field])
      .find((candidate) => typeof candidate === 'string' && candidate.trim());

    if (typeof value !== 'string' || !value.trim()) {
      return IMAGE_DEFAULT.default;
    }

    return Metodos.base64AImagen(value);
  }

  usarImagenPredeterminada(event: Event): void {
    const imagen = event.target as HTMLImageElement;
    if (imagen.getAttribute('src') !== IMAGE_DEFAULT.default) {
      imagen.src = IMAGE_DEFAULT.default;
    }
  }

  getRowClass(element: any): string {
    if (element.stock !== undefined) {
      if (element.stock === 0) {
        return 'row-agotado';
      } else if (element.stock < 10) {
        return 'row-stock-bajo';
      }
    }
    return '';
  }

  onEditar(element: any): void {
    this.editar.emit(element);
  }

  onEliminar(element: any): void {
    this.eliminar.emit(element);
  }

  onVer(element: any): void {
    this.ver.emit(element);
  }

  onSeleccionar(element: any): void {
    this.seleccionar.emit(element);
  }

  onPageChange(event: PageEvent): void {
    this.cambioPagina.emit(event);
  }
}
