import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../setting/api/appsettings';
import { ISucursal } from '../interfaces/sucursal';
import { ApiResponse } from '../setting/api/apiResponse';
import { ISucursalNegocio } from '../interfaces/Dto/sucursal-negocio';

@Injectable({
  providedIn: 'root'
})
export class SucursalService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = appsettings.apiUrl + 'Sucursal';

  lista() {
    return this.http.get<ISucursalNegocio[]>(this.apiUrl);
  }

  listaPaginada(pageNumber: number, pageSize: number) {
    return this.http.get<{
      data: ISucursal[];
      totalCount: number;
    }>(`${this.apiUrl}/paginacion?pageNumber=${pageNumber}&pageSize=${pageSize}`);
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
    return this.http.delete<ApiResponse<ISucursal>>(`${this.apiUrl}/${id}`);
  }
}
