import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../setting/api/appsettings';
import { INegocio } from '../interfaces/negocio';
import { IApi } from '../setting/api/api';
import { ProductoMasVendido } from '../interfaces/Dto/negocio/producto-mas-vendido';
import { ProductoMasComprado } from '../interfaces/Dto/negocio/producto-mas-comprado';
import { TopClientes } from '../interfaces/Dto/negocio/top-clientes';
import { ProveedorPreferido } from '../interfaces/Dto/negocio/proveedor-preferido';
import { TransportistaViaje } from '../interfaces/Dto/negocio/transportista-viaje';
import { EmpleadoProductivo } from '../interfaces/Dto/negocio/empleado-productivo';

@Injectable({
  providedIn: 'root'
})
export class NegocioService {
  private http = inject(HttpClient);
  private apiUrl: string = appsettings.apiUrl + 'Negocio';

  obtener(id: number) {
    return this.http.get<INegocio>(`${this.apiUrl}/${id}`);
  }

  editar(negocio: Partial<INegocio>) {
    return this.http.put<IApi>(`${this.apiUrl}/${negocio.id_Negocio}`, negocio);
  }

  obtenerProductosComprados() {
    return this.http.get<ProductoMasComprado[]>(`${this.apiUrl}/producto-mas-comprado`);
  }

  obtenerProductosVendidos() {
    return this.http.get<ProductoMasVendido[]>(`${this.apiUrl}/producto-mas-vendido`);
  }

  obtenerTopClientes() {
    return this.http.get<TopClientes[]>(`${this.apiUrl}/top-clientes`);
  }

  obtenerTopProveedores() {
    return this.http.get<ProveedorPreferido[]>(`${this.apiUrl}/top-proveedores`);
  }

  obtenerViajesTransportista() {
    return this.http.get<TransportistaViaje[]>(`${this.apiUrl}/viajes-transportista`);
  }

  obtenerVentaEmpleados() {
    return this.http.get<EmpleadoProductivo[]>(`${this.apiUrl}/empleados-productivos`);
  }
}
