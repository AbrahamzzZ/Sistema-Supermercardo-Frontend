import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { IProveedor } from '../interfaces/proveedor';
import { ApiResponse } from '../setting/api/apiResponse';
import { ApiPaginado } from '../setting/api/apiPaginado';
import { ParamsPaginacion } from '../setting/api/apiParamsPaginacion';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = environment.API_URL + 'Proveedor';

  lista() {
    return this.http.get<ApiResponse<IProveedor[]>>(this.apiUrl);
  }

  listaPaginada(params: Signal<ParamsPaginacion>) {
    return httpResource<ApiResponse<ApiPaginado<IProveedor>>>(() => {
      const p = params();
      return {
        url: `${this.apiUrl}/paginacion`,
        params: { pageNumber: p.pageNumber, pageSize: p.pageSize, filtro: p.filtro }
      };
    });
  }

  obtener(id: number) {
    return this.http.get<ApiResponse<IProveedor>>(`${this.apiUrl}/${id}`);
  }

  registrar(proveedor: IProveedor) {
    return this.http.post<ApiResponse<IProveedor>>(this.apiUrl, proveedor);
  }

  editar(proveedor: Partial<IProveedor>) {
    return this.http.put<ApiResponse<IProveedor>>(
      `${this.apiUrl}/${proveedor.id_Proveedor}`,
      proveedor
    );
  }

  eliminar(id: number) {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }
}
