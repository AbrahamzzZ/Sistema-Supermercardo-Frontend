import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { INegocio } from '../interfaces/negocio';
import { ApiResponse } from '../setting/api/apiResponse';
import { ProductoMasVendido } from '../interfaces/Dto/negocio/producto-mas-vendido';
import { ProductoMasComprado } from '../interfaces/Dto/negocio/producto-mas-comprado';
import { TopClientes } from '../interfaces/Dto/negocio/top-clientes';
import { ProveedorPreferido } from '../interfaces/Dto/negocio/proveedor-preferido';
import { TransportistaViaje } from '../interfaces/Dto/negocio/transportista-viaje';
import { EmpleadoProductivo } from '../interfaces/Dto/negocio/empleado-productivo';
import { AnalisisIARequest } from '../interfaces/Dto/negocio/IA/analisisIARequest';
import { ResumenGraficoIARequest } from '../interfaces/Dto/negocio/IA/resumenGraficoIARequest';

@Injectable({
  providedIn: 'root'
})
export class NegocioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = environment.API.admin + 'Negocio';

  obtener(id: number) {
    return this.http.get<ApiResponse<INegocio>>(`${this.apiUrl}/${id}`);
  }

  editar(negocio: Partial<INegocio>) {
    return this.http.put<ApiResponse<INegocio>>(`${this.apiUrl}/${negocio.id_Negocio}`, negocio);
  }

  obtenerProductosComprados() {
    return this.http.get<ApiResponse<ProductoMasComprado[]>>(`${this.apiUrl}/productos-mas-comprados`);
  }

  obtenerProductosVendidos() {
    return this.http.get<ApiResponse<ProductoMasVendido[]>>(`${this.apiUrl}/productos-mas-vendidos`);
  }

  obtenerTopClientes() {
    return this.http.get<ApiResponse<TopClientes[]>>(`${this.apiUrl}/top-clientes`);
  }

  obtenerTopProveedores() {
    return this.http.get<ApiResponse<ProveedorPreferido[]>>(`${this.apiUrl}/top-proveedores`);
  }

  obtenerViajesTransportista() {
    return this.http.get<ApiResponse<TransportistaViaje[]>>(`${this.apiUrl}/viajes-transportista`);
  }

  obtenerVentaEmpleados() {
    return this.http.get<ApiResponse<EmpleadoProductivo[]>>(`${this.apiUrl}/empleados-productivos`);
  }

  consultarIA(prompt: string) {
    const body: AnalisisIARequest = { prompt };
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/analisis-ia`, body);
  }

  resumirGraficoIA(claveEstadistica: string) {
    const body: ResumenGraficoIARequest = { claveEstadistica };
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/resumen-grafico-ia`, body);
  }
}
