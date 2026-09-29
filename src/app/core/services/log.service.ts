import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ILog } from '../interfaces/log';
import { ApiPaginado } from '../setting/api/apiPaginado';
import { ParamsPaginacion } from '../setting/api/apiParamsPaginacion';
import { ApiResponse } from '../setting/api/apiResponse';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = environment.API_URL + 'Log';

  listaPaginada(params: Signal<ParamsPaginacion>) {
    return httpResource<ApiResponse<ApiPaginado<ILog>>>(() => {
      const p = params();
      return { url: `${this.apiUrl}/paginacion`, params: {pageNumber: p.pageNumber, pageSize: p.pageSize, filtro: p.filtro}};
    });
  }

  obtener(id: number) {
    return this.http.get<ILog>(`${this.apiUrl}/${id}`);
  }
}
