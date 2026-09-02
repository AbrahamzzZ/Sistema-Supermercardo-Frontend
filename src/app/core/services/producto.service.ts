import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../setting/api/appsettings';
import { IProducto } from '../interfaces/producto';
import { ApiResponse } from '../setting/api/apiResponse';
import { IProductoCategoria } from '../interfaces/Dto/iproducto-categoria';
import { IProductoRespuesta } from '../interfaces/Dto/iproducto-respuesta';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = appsettings.apiUrl + 'Producto';

  lista() {
    return this.http.get<IProductoCategoria[]>(this.apiUrl);
  }

  listaPaginada(pageNumber: number, pageSize: number, filtro: string) {
    return this.http.get<{
      data: IProducto[];
      totalCount: number;
    }>(`${this.apiUrl}/paginacion?pageNumber=${pageNumber}&pageSize=${pageSize}&filtro=${encodeURIComponent(filtro)}`);
  }

  obtener(id: number) {
    return this.http.get<ApiResponse<IProductoRespuesta>>(`${this.apiUrl}/${id}`);
  }

  registrar(producto: IProducto) {
    return this.http.post<ApiResponse<IProducto>>(this.apiUrl, producto);
  }

  editar(producto: Partial<IProducto>) {
    return this.http.put<ApiResponse<IProducto>>(`${this.apiUrl}/${producto.id_Producto}`, producto);
  }

  eliminar(id: number) {
    return this.http.delete<ApiResponse<IProducto>>(`${this.apiUrl}/${id}`);
  }
}
