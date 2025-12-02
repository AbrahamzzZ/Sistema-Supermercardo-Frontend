import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../setting/api/appsettings';
import { IProveedor } from '../interfaces/proveedor';
import { IApi } from '../setting/api/api';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = appsettings.apiUrl + 'Proveedor';

  lista() {
    return this.http.get<IProveedor[]>(this.apiUrl);
  }

  listaPaginada(pageNumber: number, pageSize: number) {
    return this.http.get<{
      data: IProveedor[];
      totalCount: number;
    }>(`${this.apiUrl}/paginacion?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

  obtener(id: number) {
    return this.http.get<IProveedor>(`${this.apiUrl}/${id}`);
  }

  registrar(proveedor: IProveedor) {
    return this.http.post<IApi>(this.apiUrl, proveedor);
  }

  editar(proveedor: Partial<IProveedor>) {
    return this.http.put<IApi>(`${this.apiUrl}/${proveedor.id_Proveedor}`, proveedor);
  }

  eliminar(id: number) {
    return this.http.delete<IApi>(`${this.apiUrl}/${id}`);
  }
}
