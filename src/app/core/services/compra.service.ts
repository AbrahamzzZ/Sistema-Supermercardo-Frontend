import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../setting/api/appsettings';
import { ICompra } from '../interfaces/compra';
import { IApi } from '../setting/api/api';
import { ICompraRepuesta } from '../interfaces/Dto/compra/icompra-repuesta';
import { IDetallesCompra } from '../interfaces/Dto/compra/idetalles-compra';

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = appsettings.apiUrl + 'Compra';

  obtenerNuevoNumeroDocumento() {
    return this.http.get<{ numeroDocumento: string }>(`${this.apiUrl}/numero-documento`);
  }

  obtener(documento: string) {
    return this.http.get<ICompraRepuesta>(`${this.apiUrl}/${documento}`);
  }

  obtenerDetalleCompra(id: number) {
    return this.http.get<IDetallesCompra>(`${this.apiUrl}/detalles/${id}`);
  }

  registrar(compra: ICompra) {
    return this.http.post<IApi>(this.apiUrl, compra);
  }
}
