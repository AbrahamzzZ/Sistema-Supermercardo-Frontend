import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ITransportista } from '../interfaces/transportista';
import { ApiResponse } from '../setting/api/apiResponse';
import { ApiPaginado } from '../setting/api/apiPaginado';
import { ParamsPaginacion } from '../setting/api/apiParamsPaginacion';
@Injectable({
  providedIn: 'root'
})
export class TransportistaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = environment.API_URL + 'Transportista';

  lista() {
    return this.http.get<ApiResponse<ITransportista[]>>(this.apiUrl);
  }

  listaPaginada(params: Signal<ParamsPaginacion>) {
      return httpResource<ApiResponse<ApiPaginado<ITransportista>>>(() => {
      const p = params();
      return { url: `${this.apiUrl}/paginacion`, params: {pageNumber: p.pageNumber, pageSize: p.pageSize, filtro: p.filtro}};
    });
  }

  obtener(id: number) {
    return this.http.get<ITransportista>(`${this.apiUrl}/${id}`);
  }

  registrar(transportista: ITransportista) {
    return this.http.post<ApiResponse<ITransportista>>(this.apiUrl, transportista);
  }

  editar(transportista: Partial<ITransportista>) {
    return this.http.put<ApiResponse<ITransportista>>(`${this.apiUrl}/${transportista.id_Transportista}`, transportista);
  }

  eliminar(id: number) {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }
}
