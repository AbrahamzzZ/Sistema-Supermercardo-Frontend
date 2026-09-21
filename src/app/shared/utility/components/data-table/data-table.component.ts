import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TableColumn } from '../tableColumn';
import { MaterialModule } from '../../../ui/material-module';

@Component({
  selector: 'app-data-table',
  imports: [MaterialModule],
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

  getFechaRegistro(fecha: string): string {
    const fechaObj = /^\d{4}-\d{2}-\d{2}$/.test(fecha)
      ? this.crearFechaLocal(fecha)
      : new Date(fecha);

    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  private crearFechaLocal(fecha: string): Date {
    const [anio, mes, dia] = fecha.split('-').map(Number);
    return new Date(anio, mes - 1, dia);
  }

  getEstado(estado: boolean): string {
    return estado ? 'Activo' : 'Inactivo';
  }

  getEstadoStock(stock: number): string {
    return stock > 0 ? 'Agotado' : 'No Agotado';
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
