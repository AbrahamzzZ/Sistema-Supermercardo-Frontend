import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../setting/api/appsettings';
import { IUsuario } from '../interfaces/usuario';
import { ApiResponse } from '../setting/api/apiResponse';
import { IUsuarioRol } from '../interfaces/Dto/iusuario-rol';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = appsettings.apiUrl + 'Usuario';

  lista() {
    return this.http.get<IUsuarioRol[]>(this.apiUrl);
  }

  listaPaginada(pageNumber: number, pageSize: number, filtro: string) {
    return this.http.get<{
      data: IUsuario[];
      totalCount: number;
    }>(`${this.apiUrl}/paginacion?pageNumber=${pageNumber}&pageSize=${pageSize}&filtro=${encodeURIComponent(filtro)}`);
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
    return this.http.delete<ApiResponse<IUsuario>>(`${this.apiUrl}/${id}`);
  }
}
