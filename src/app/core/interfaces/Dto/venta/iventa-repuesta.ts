import { IDetalleVenta } from '../../detalle-venta';

export interface IVentaRepuesta {
  id_Venta: number;
  id_Usuario: number;
  codigo_Usuario: string;
  nombre_Completo: string;
  codigo_Sucursal: string;
  nombre_Sucursal: string;
  direccion_Sucursal: string;
  tipo_Documento: string;
  numero_Documento: string;
  id_Cliente: number;
  codigo_Cliente: string;
  nombres_Cliente: string;
  apellidos_Cliente: string;
  cedula_Cliente: string;
  monto_Pago: number;
  monto_Cambio: number;
  monto_Total: number;
  descuento: number;
  detalleVenta: IDetalleVenta[];
  fecha_Venta: string;
}
