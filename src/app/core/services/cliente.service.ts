import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../setting/api/appsettings';
import { ICliente } from '../interfaces/cliente';
import { IApi } from '../setting/api/api';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = appsettings.apiUrl + 'Cliente';

  lista() {
    return this.http.get<ICliente[]>(this.apiUrl);
  }

  listaPaginada(pageNumber: number, pageSize: number) {
    return this.http.get<{
      data: ICliente[];
      totalCount: number;
    }>(`${this.apiUrl}/paginacion?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

  obtener(id: number) {
    return this.http.get<ICliente>(`${this.apiUrl}/${id}`);
  }

  registrar(cliente: ICliente) {
    return this.http.post<IApi>(this.apiUrl, cliente);
  }

  editar(cliente: Partial<ICliente>) {
    return this.http.put<IApi>(`${this.apiUrl}/${cliente.id_Cliente}`, cliente);
  }

  eliminar(id: number) {
    return this.http.delete<IApi>(`${this.apiUrl}/${id}`);
  }
}
