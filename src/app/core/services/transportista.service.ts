import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../setting/api/appsettings';
import { ITransportista } from '../interfaces/transportista';
import { ApiResponse } from '../setting/api/apiResponse';
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
    return this.http.post<ApiResponse<ITransportista>>(this.apiUrl, transportista);
  }

  editar(transportista: Partial<ITransportista>) {
    return this.http.put<ApiResponse<ITransportista>>(`${this.apiUrl}/${transportista.id_Transportista}`, transportista);
  }

  eliminar(id: number) {
    return this.http.delete<ApiResponse<ITransportista>>(`${this.apiUrl}/${id}`);
  }
}
