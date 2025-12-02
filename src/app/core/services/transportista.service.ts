import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../setting/api/appsettings';
import { ITransportista } from '../interfaces/transportista';
import { IApi } from '../setting/api/api';
@Injectable({
  providedIn: 'root'
})
export class TransportistaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = appsettings.apiUrl + 'Transportista';

  lista() {
    return this.http.get<ITransportista[]>(this.apiUrl);
  }

  listaPaginada(pageNumber: number, pageSize: number) {
    return this.http.get<{
      data: ITransportista[];
      totalCount: number;
    }>(`${this.apiUrl}/paginacion?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

  obtener(id: number) {
    return this.http.get<ITransportista>(`${this.apiUrl}/${id}`);
  }

  registrar(transportista: ITransportista) {
    return this.http.post<IApi>(this.apiUrl, transportista);
  }

  editar(transportista: Partial<ITransportista>) {
    return this.http.put<IApi>(`${this.apiUrl}/${transportista.id_Transportista}`, transportista);
  }

  eliminar(id: number) {
    return this.http.delete<IApi>(`${this.apiUrl}/${id}`);
  }
}
