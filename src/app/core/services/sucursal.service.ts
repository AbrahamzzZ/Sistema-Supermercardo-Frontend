import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ISucursal } from '../interfaces/sucursal';
import { ApiResponse } from '../setting/api/apiResponse';
import { ISucursalNegocio } from '../interfaces/Dto/sucursal-negocio';
import { ApiPaginado } from '../setting/api/apiPaginado';
import { ParamsPaginacion } from '../setting/api/apiParamsPaginacion';

@Injectable({
  providedIn: 'root'
})
export class SucursalService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = environment.API_URL + 'Sucursal';

  lista() {
    return this.http.get<ApiResponse<ISucursalNegocio[]>>(this.apiUrl);
  }

  listaPaginada(params: Signal<ParamsPaginacion>) {
    return httpResource<ApiResponse<ApiPaginado<ISucursalNegocio>>>(() => {
      const p = params();
      return { url: `${this.apiUrl}/paginacion`, params: {pageNumber: p.pageNumber, pageSize: p.pageSize, filtro: p.filtro}};
    });
  }

  obtener(id: number) {
    return this.http.get<ApiResponse<ISucursalNegocio>>(`${this.apiUrl}/${id}`);
  }

  registrar(sucursal: ISucursal) {
    return this.http.post<ApiResponse<ISucursal>>(this.apiUrl, sucursal);
  }

  editar(sucursal: Partial<ISucursal>) {
    return this.http.put<ApiResponse<ISucursal>>(`${this.apiUrl}/${sucursal.id_Sucursal}`, sucursal);
  }

  eliminar(id: number) {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }
}
