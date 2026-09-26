import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ICliente } from '../interfaces/cliente';
import { ApiResponse } from '../setting/api/apiResponse';
import { ParamsPaginacion } from '../setting/api/apiParamsPaginacion';
import { ApiPaginado } from '../setting/api/apiPaginado';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = environment.API_URL + 'Cliente';

  lista() {
    return this.http.get<ApiResponse<ICliente[]>>(this.apiUrl);
  }

  listaPaginada(params: Signal<ParamsPaginacion>) {
    return httpResource<ApiResponse<ApiPaginado<ICliente>>>(() => {
      const p = params();
      return {url: `${this.apiUrl}/paginacion`, params: {pageNumber: p.pageNumber, pageSize: p.pageSize, filtro: p.filtro}};
    });
  }

  obtener(id: number) {
    return this.http.get<ApiResponse<ICliente>>(`${this.apiUrl}/${id}`);
  }

  registrar(cliente: ICliente) {
    return this.http.post<ApiResponse<ICliente>>(this.apiUrl, cliente);
  }

  editar(cliente: Partial<ICliente>) {
    return this.http.put<ApiResponse<ICliente>>(`${this.apiUrl}/${cliente.id_Cliente}`, cliente);
  }

  eliminar(id: number) {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }
}
