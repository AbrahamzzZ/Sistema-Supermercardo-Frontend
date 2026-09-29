import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { IOferta } from '../interfaces/oferta';
import { IOfertaProducto } from '../interfaces/Dto/ioferta-producto';
import { ApiResponse } from '../setting/api/apiResponse';
import { ApiPaginado } from '../setting/api/apiPaginado';
import { ParamsPaginacion } from '../setting/api/apiParamsPaginacion';

@Injectable({
  providedIn: 'root'
})
export class OfertaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = environment.API_URL + 'Oferta';

  lista() {
    return this.http.get<ApiResponse<IOfertaProducto[]>>(this.apiUrl);
  }

  listaPaginada(params: Signal<ParamsPaginacion>) {
    return httpResource<ApiResponse<ApiPaginado<IOfertaProducto>>>(() => {
      const p = params();
      return { url: `${this.apiUrl}/paginacion`, params: {pageNumber: p.pageNumber, pageSize: p.pageSize, filtro: p.filtro}};
    });
  }
    
  obtener(id: number) {
    return this.http.get<ApiResponse<IOferta>>(`${this.apiUrl}/${id}`);
  }

  registrar(oferta: IOferta) {
    return this.http.post<ApiResponse<IOferta>>(this.apiUrl, oferta);
  }

  editar(oferta: Partial<IOferta>) {
    return this.http.put<ApiResponse<IOferta>>(`${this.apiUrl}/${oferta.id_Oferta}`, oferta);
  }

  eliminar(id: number) {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }
}
