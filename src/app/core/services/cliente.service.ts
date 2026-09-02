import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../setting/api/appsettings';
import { ICliente } from '../interfaces/cliente';
import { ApiResponse } from '../setting/api/apiResponse';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = appsettings.apiUrl + 'Cliente';

  lista() {
    return this.http.get<ICliente[]>(this.apiUrl);
  }

  listaPaginada(pageNumber: number, pageSize: number, filtro: string) {
    return this.http.get<{
      data: ICliente[];
      totalCount: number;
    }>(`${this.apiUrl}/paginacion?pageNumber=${pageNumber}&pageSize=${pageSize}&filtro=${encodeURIComponent(filtro)}`);
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
    return this.http.delete<ApiResponse<ICliente>>(`${this.apiUrl}/${id}`);
  }
}
