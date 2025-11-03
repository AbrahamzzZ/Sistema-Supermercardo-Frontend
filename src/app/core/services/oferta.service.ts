import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../setting/api/appsettings';
import { IOferta } from '../interfaces/oferta';
import { IApi } from '../setting/api/api';
import { IOfertaProducto } from '../interfaces/Dto/ioferta-producto';

@Injectable({
  providedIn: 'root'
})
export class OfertaService {
  private http = inject(HttpClient);
  private apiUrl: string = appsettings.apiUrl + 'Oferta';

  lista() {
    return this.http.get<IOfertaProducto[]>(this.apiUrl);
  }

  listaPaginada(pageNumber: number, pageSize: number) {
    return this.http.get<{
      data: IOferta[];
      totalCount: number;
    }>(`${this.apiUrl}/paginacion?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

  obtener(id: number) {
    return this.http.get<IOferta>(`${this.apiUrl}/${id}`);
  }

  registrar(oferta: IOferta) {
    return this.http.post<IApi>(this.apiUrl, oferta);
  }

  editar(oferta: Partial<IOferta>) {
    return this.http.put<IApi>(`${this.apiUrl}/${oferta.id_Oferta}`, oferta);
  }

  eliminar(id: number) {
    return this.http.delete<IApi>(`${this.apiUrl}/${id}`);
  }
}
