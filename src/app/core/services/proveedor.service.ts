import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../setting/api/appsettings';
import { IProveedor } from '../interfaces/proveedor';
import { ApiResponse } from '../setting/api/apiResponse';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = appsettings.apiUrl + 'Proveedor';

  lista() {
    return this.http.get<IProveedor[]>(this.apiUrl);
  }

  listaPaginada(pageNumber: number, pageSize: number, filtro: string) {
    return this.http.get<{
      data: IProveedor[];
      totalCount: number;
    }>(`${this.apiUrl}/paginacion?pageNumber=${pageNumber}&pageSize=${pageSize}&filtro=${encodeURIComponent(filtro)}`);
  }

  obtener(id: number) {
    return this.http.get<ApiResponse<IProveedor>>(`${this.apiUrl}/${id}`);
  }

  registrar(proveedor: IProveedor) {
    return this.http.post<ApiResponse<IProveedor>>(this.apiUrl, proveedor);
  }

  editar(proveedor: Partial<IProveedor>) {
    return this.http.put<ApiResponse<IProveedor>>(`${this.apiUrl}/${proveedor.id_Proveedor}`, proveedor);
  }

  eliminar(id: number) {
    return this.http.delete<ApiResponse<IProveedor>>(`${this.apiUrl}/${id}`);
  }
}
