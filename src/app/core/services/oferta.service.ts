import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../setting/api/appsettings';
import { IOferta } from '../interfaces/oferta';
import { IOfertaProducto } from '../interfaces/Dto/ioferta-producto';
import { ApiResponse } from '../setting/api/apiResponse';

@Injectable({
  providedIn: 'root'
})
export class OfertaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = appsettings.apiUrl + 'Oferta';

  lista() {
    return this.http.get<IOfertaProducto[]>(this.apiUrl);
  }

  listaPaginada(pageNumber: number, pageSize: number, filtro: string) {
    return this.http.get<{
      data: IOferta[];
      totalCount: number;
    }>(`${this.apiUrl}/paginacion?pageNumber=${pageNumber}&pageSize=${pageSize}&filtro=${encodeURIComponent(filtro)}`);
  }

  obtener(id: number) {
    return this.http.get<ApiResponse<IOferta>>(`${this.apiUrl}/${id}`);
  }

  registrar(oferta: IOferta) {
    return this.http.post<ApiResponse<IOferta>>(this.apiUrl, oferta);
  }

  editar(oferta: Partial<IOferta>) {
    return this.http.put<ApiResponse<IOferta>>(`${this.apiUrl}/${oferta.id_Oferta}`, oferta);
  }

  eliminar(id: number) {
    return this.http.delete<ApiResponse<IOferta>>(`${this.apiUrl}/${id}`);
  }
}
