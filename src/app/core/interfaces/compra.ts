import { IDetalleCompra } from './detalle-compra';
export interface ICompra {
  id: number;
  numero_Documento: string;
  id_Usuario: number;
  id_Sucursal: number;
  id_Proveedor: number;
  id_Transportista: number;
  tipo_Documento: string;
  monto_Total: string;
  detalles: IDetalleCompra[];
}
