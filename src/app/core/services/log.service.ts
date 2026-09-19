import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ILog } from '../interfaces/log';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = environment.API_URL + 'Log';

  listaPaginada(pageNumber: number, pageSize: number, filtro: string) {
    return this.http.get<{
      data: ILog[];
      totalCount: number;
    }>(`${this.apiUrl}/paginacion?pageNumber=${pageNumber}&pageSize=${pageSize}&filtro=${encodeURIComponent(filtro)}`);
  }

  obtener(id: number) {
    return this.http.get<ILog>(`${this.apiUrl}/${id}`);
  }
}
