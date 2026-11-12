import { HttpClient } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { Arquitectura, environment } from '../../../../environments/environment';
import { IProducto } from '../interfaces/producto';
import { IProductoStock } from '../interfaces/Dto/iproducto-stock';
import { IErrorHttp } from '../interceptor/error.interceptor';
import { ApiResponse } from '../setting/api/apiResponse';

export const ARQUITECTURA_BACKEND = new InjectionToken<Arquitectura>('ARQUITECTURA_BACKEND', {
  providedIn: 'root',
  factory: () => environment.ARQUITECTURA
});

@Injectable({
  providedIn: 'root'
})
export class ProductoStockService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string = environment.API.inventory + 'ProductoStock';
  private readonly stockEnInventory = inject(ARQUITECTURA_BACKEND) === 'microservicios';

  obtener(idProducto: number) {
    return this.http.get<ApiResponse<IProductoStock>>(`${this.apiUrl}/${idProducto}`);
  }

  lista() {
    return this.http.get<ApiResponse<IProductoStock[]>>(this.apiUrl);
  }

  completarLista(productos: IProducto[]): Observable<IProducto[]> {
    if (!this.stockEnInventory) {
      return of(productos.map((p) => this.conValores(p, p.stock, p.precio_Compra, p.precio_Venta)));
    }

    return this.lista().pipe(
      map((resp) => {
        const stocks = new Map((resp.data ?? []).map((s) => [s.idProducto, s]));
        return productos.map((p) => {
          const s = stocks.get(p.id_Producto);
          return this.conValores(p, s?.stock, s?.precioCompra, s?.precioVenta);
        });
      })
    );
  }

  completar(producto: IProducto): Observable<IProducto> {
    if (!this.stockEnInventory) {
      return of(
        this.conValores(producto, producto.stock, producto.precio_Compra, producto.precio_Venta)
      );
    }

    return this.obtener(producto.id_Producto).pipe(
      map((resp) =>
        this.conValores(producto, resp.data?.stock, resp.data?.precioCompra, resp.data?.precioVenta)
      ),
      catchError((error: IErrorHttp) =>
        error?.status === 404 ? of(this.conValores(producto)) : throwError(() => error)
      )
    );
  }

  private conValores(
    producto: IProducto,
    stock?: number | null,
    precioCompra?: number | null,
    precioVenta?: number | null
  ): IProducto {
    return {
      ...producto,
      stock: stock ?? 0,
      precio_Compra: precioCompra ?? 0,
      precio_Venta: precioVenta ?? 0
    };
  }
}
