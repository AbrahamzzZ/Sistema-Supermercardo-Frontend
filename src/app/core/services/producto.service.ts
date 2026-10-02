import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { IProducto } from '../interfaces/producto';
import { ApiResponse } from '../setting/api/apiResponse';
import { IProductoCategoria } from '../interfaces/Dto/iproducto-categoria';
import { IProductoRespuesta } from '../interfaces/Dto/iproducto-respuesta';
import { ApiPaginado } from '../setting/api/apiPaginado';
import { ParamsPaginacion } from '../setting/api/apiParamsPaginacion';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = environment.API_URL + 'Producto';

  lista() {
    return this.http.get<ApiResponse<IProductoCategoria[]>>(this.apiUrl);
  }

  listaPaginada(params: Signal<ParamsPaginacion>) {
    return httpResource<ApiResponse<ApiPaginado<IProductoCategoria>>>(() => {
      const p = params();
      return {
        url: `${this.apiUrl}/paginacion`,
        params: { pageNumber: p.pageNumber, pageSize: p.pageSize, filtro: p.filtro }
      };
    });
  }

  obtener(id: number) {
    return this.http.get<ApiResponse<IProductoRespuesta>>(`${this.apiUrl}/${id}`);
  }

  registrar(producto: IProducto) {
    return this.http.post<ApiResponse<IProducto>>(this.apiUrl, producto);
  }

  editar(producto: Partial<IProducto>) {
    return this.http.put<ApiResponse<IProducto>>(
      `${this.apiUrl}/${producto.id_Producto}`,
      producto
    );
  }

  eliminar(id: number) {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }
}
