import { HttpClient, HttpContext, httpResource } from '@angular/common/http';
import { OMITIR_LOADER } from '../interceptor/loader.interceptor';
import { inject, Injectable, Signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ILog } from '../interfaces/log';
import { ApiPaginado } from '../setting/api/apiPaginado';
import { ParamsPaginacion } from '../setting/api/apiParamsPaginacion';
import { ApiResponse } from '../setting/api/apiResponse';

export interface ParamsLog extends ParamsPaginacion {
  desde?: string;
  hasta?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = environment.API_URL + 'Log';

  obtenerPagina(params: ParamsLog) {
    return this.http.get<ApiResponse<ApiPaginado<ILog>>>(`${this.apiUrl}/paginacion`, {
      params: this.construirParametros(params)
    });
  }

  listaPaginada(params: Signal<ParamsLog>) {
    return httpResource<ApiResponse<ApiPaginado<ILog>>>(() => ({
      url: `${this.apiUrl}/paginacion`,
      params: this.construirParametros(params()),
      context: new HttpContext().set(OMITIR_LOADER, true)
    }));
  }

  obtener(id: number) {
    return this.http.get<ILog>(`${this.apiUrl}/${id}`);
  }

  private construirParametros(p: ParamsLog): Record<string, string | number> {
    const parametros: Record<string, string | number> = {
      pageNumber: p.pageNumber,
      pageSize: p.pageSize,
      filtro: p.filtro
    };
    if (p.desde) parametros['desde'] = p.desde;
    if (p.hasta) parametros['hasta'] = p.hasta;
    return parametros;
  }
}
