import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ICategoria } from '../interfaces/categoria';
import { ApiResponse } from '../setting/api/apiResponse';
import { ParamsPaginacion } from '../setting/api/apiParamsPaginacion';
import { ApiPaginado } from '../setting/api/apiPaginado';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = environment.API_URL + 'Categoria';

  lista() {
    return this.http.get<ApiResponse<ICategoria[]>>(this.apiUrl);
  }

  listaPaginada(params: Signal<ParamsPaginacion>) {
    return httpResource<ApiResponse<ApiPaginado<ICategoria>>>(() => {
      const p = params();
      return { url: `${this.apiUrl}/paginacion`, params: {pageNumber: p.pageNumber, pageSize: p.pageSize, filtro: p.filtro}};
    });
  }

  obtener(id: number) {
    return this.http.get<ApiResponse<ICategoria>>(`${this.apiUrl}/${id}`);
  }

  registrar(categoria: ICategoria) {
    return this.http.post<ApiResponse<ICategoria>>(this.apiUrl, categoria);
  }

  editar(categoria: Partial<ICategoria>) {
    return this.http.put<ApiResponse<ICategoria>>(`${this.apiUrl}/${categoria.id_Categoria}`, categoria);
  }

  eliminar(id: number) {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }
}
