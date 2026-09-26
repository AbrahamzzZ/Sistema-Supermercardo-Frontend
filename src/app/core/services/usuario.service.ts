import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { IUsuario } from '../interfaces/usuario';
import { ApiResponse } from '../setting/api/apiResponse';
import { IUsuarioRol } from '../interfaces/Dto/iusuario-rol';
import { ApiPaginado } from '../setting/api/apiPaginado';
import { ParamsPaginacion } from '../setting/api/apiParamsPaginacion';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = environment.API_URL + 'Usuario';

  lista() {
    return this.http.get<ApiResponse<IUsuarioRol[]>>(this.apiUrl);
  }

  listaPaginada(params: Signal<ParamsPaginacion>) {
     return httpResource<ApiResponse<ApiPaginado<IUsuarioRol>>>(() => {
      const p = params();
      return { url: `${this.apiUrl}/paginacion`, params: {pageNumber: p.pageNumber, pageSize: p.pageSize, filtro: p.filtro}};
    });
  }

  obtener(id: number) {
    return this.http.get<ApiResponse<IUsuarioRol>>(`${this.apiUrl}/${id}`);
  }

  registrar(usuario: IUsuario) {
    return this.http.post<ApiResponse<IUsuario>>(this.apiUrl, usuario);
  }

  editar(usuario: Partial<IUsuario>) {
    return this.http.put<ApiResponse<IUsuario>>(`${this.apiUrl}/${usuario.id_Usuario}`, usuario);
  }

  eliminar(id: number) {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }
}
