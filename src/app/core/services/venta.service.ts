import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../setting/api/appsettings';
import { IVenta } from '../interfaces/venta';
import { IApi } from '../setting/api/api';
import { IVentaRepuesta } from '../interfaces/Dto/venta/iventa-repuesta';
import { IDetallesVenta } from '../interfaces/Dto/venta/idetalles-venta';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private http = inject(HttpClient);
  private apiUrl: string = appsettings.apiUrl + 'Venta';

  obtenerNuevoNumeroDocumento() {
    return this.http.get<{ numeroDocumento: string }>(`${this.apiUrl}/numero-documento`);
  }

  obtener(documento: string) {
    return this.http.get<IVentaRepuesta>(`${this.apiUrl}/${documento}`);
  }

  obtenerDetalleVenta(id: number) {
    return this.http.get<IDetallesVenta>(`${this.apiUrl}/detalles/${id}`);
  }

  registrar(venta: IVenta) {
    return this.http.post<IApi>(this.apiUrl, venta);
  }
}
