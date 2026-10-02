import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TableColumn } from './table-column';
import { MaterialModule } from '../../../ui/material-module';
import { FormatoFechaPipe } from '../../../pipes/formato-fecha.pipe';
import { Metodos } from '../../metodos';
import { IMAGE_DEFAULT } from '../../../../core/constants/imageDefault.const';

@Component({
  selector: 'app-data-table',
  imports: [MaterialModule, FormatoFechaPipe],
  templateUrl: './data-table.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent implements OnChanges {
  @ViewChild(MatPaginator) private paginator?: MatPaginator;

  @Input() dataSource = new MatTableDataSource<any>();

  @Input() columns: TableColumn[] = [];

  @Input() totalRegistros = 0;

  @Input() pageSize = 5;

  @Input() pageSizeOptions: number[] = [5, 10, 20];

  @Input() mensajeSinDatos = 'No hay datos que mostrar.';

  @Output() editar = new EventEmitter<any>();

  @Output() eliminar = new EventEmitter<any>();

  @Output() ver = new EventEmitter<any>();

  @Output() seleccionar = new EventEmitter<any>();

  @Output() cambioPagina = new EventEmitter<PageEvent>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalRegistros'] && this.paginator) {
      this.paginator.pageIndex = 0;
    }
  }

  get displayedColumns(): string[] {
    return this.columns.map((column) => column.key);
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
