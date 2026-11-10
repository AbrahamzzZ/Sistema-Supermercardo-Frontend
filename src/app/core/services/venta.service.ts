import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { IVenta } from '../interfaces/venta';
import { ApiResponse } from '../setting/api/apiResponse';
import { IVentaRepuesta } from '../interfaces/Dto/venta/iventa-repuesta';
import { IDetallesVenta } from '../interfaces/Dto/venta/idetalles-venta';
import { IVentaRegistrada } from '../interfaces/Dto/venta/iventa-registrada';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = environment.API_URL + 'Venta';

  obtener(documento: string) {
    return this.http.get<ApiResponse<IVentaRepuesta>>(`${this.apiUrl}/${documento}`);
  }

  obtenerDetalleVenta(id: number) {
    return this.http.get<ApiResponse<IDetallesVenta>>(`${this.apiUrl}/detalles/${id}`);
  }

  registrar(venta: IVenta) {
    return this.http.post<ApiResponse<IVentaRegistrada>>(this.apiUrl, venta);
  }
}
