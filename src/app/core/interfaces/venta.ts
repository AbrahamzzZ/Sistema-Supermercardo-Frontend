// Solicitud para registrar una venta.
// Solo indica qué se vende y cuánto: precios, ofertas, totales, cambio, número de documento
// y cajero los calcula el servidor.
export interface IVenta {
  id_Sucursal: number;
  id_Cliente: number;
  tipo_Documento: string;
  monto_Pago: number;
  detalles: IVentaItem[];
}

export interface IVentaItem {
  id_Producto: number;
  cantidad: number;
}
