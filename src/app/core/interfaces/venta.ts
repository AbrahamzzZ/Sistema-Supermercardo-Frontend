import { IDetalleVenta } from '../../core/interfaces/detalle-venta';

export interface IVenta {
  id: number;
  numero_Documento: string;
  id_Usuario: number;
  id_Sucursal: number;
  id_Cliente: number;
  tipo_Documento: string;
  monto_Pago: number;
  monto_Cambio: number;
  monto_Total: number;
  descuento: number;
  detalles: IDetalleVenta[];
}
