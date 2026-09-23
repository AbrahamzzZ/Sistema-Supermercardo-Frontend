import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class PaginadorEspanol extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Ítems por página:';
  override nextPageLabel = 'Página siguiente';
  override previousPageLabel = 'Página anterior';
  override firstPageLabel = 'Primera página';
  override lastPageLabel = 'Última página';

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }

    const inicio = page * pageSize;
    const fin = Math.min(inicio + pageSize, length);
    return `${inicio + 1} – ${fin} de ${length}`;
  };
}
