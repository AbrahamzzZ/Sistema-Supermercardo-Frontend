import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../setting/api/appsettings';
import { ICategoria } from '../interfaces/categoria';
import { IApi } from '../setting/api/api';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = appsettings.apiUrl + 'Categoria';

  lista() {
    return this.http.get<ICategoria[]>(this.apiUrl);
  }

  listaPaginada(pageNumber: number, pageSize: number) {
    return this.http.get<{
      data: ICategoria[];
      totalCount: number;
    }>(`${this.apiUrl}/paginacion?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

  obtener(id: number) {
    return this.http.get<ICategoria>(`${this.apiUrl}/${id}`);
  }

  registrar(categoria: ICategoria) {
    return this.http.post<IApi>(this.apiUrl, categoria);
  }

  editar(categoria: Partial<ICategoria>) {
    return this.http.put<IApi>(`${this.apiUrl}/${categoria.id_Categoria}`, categoria);
  }

  eliminar(id: number) {
    return this.http.delete<IApi>(`${this.apiUrl}/${id}`);
  }
}
