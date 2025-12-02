import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../setting/api/appsettings';
import { ILog } from '../interfaces/log';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = appsettings.apiUrl + 'Log';

  listaPaginada(pageNumber: number, pageSize: number) {
    return this.http.get<{
      data: ILog[];
      totalCount: number;
    }>(`${this.apiUrl}/paginacion?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

  obtener(id: number) {
    return this.http.get<ILog>(`${this.apiUrl}/${id}`);
  }
}
