import { IDetalleCompra } from '../detalle-compra';

export interface ICompraRepuesta {
  id_Compra: number;
  id_Usuario: number;
  codigo_Usuario: string;
  nombre_Completo: string;
  codigo_Sucursal: string;
  nombre_Sucursal: string;
  direccion_Sucursal: string;
  tipo_Documento: string;
  numero_Documento: string;
  id_Proveedor: number;
  codigo_Proveedor: string;
  nombres_Proveedor: string;
  apellidos_Proveedor: string;
  cedula_Proveedor: string;
  id_Transportista: string;
  codigo_Transportista: string;
  nombres_Transportista: string;
  apellidos_Transportista: string;
  cedula_Transportista: string;
  monto_Total: number;
  detalleCompra: IDetalleCompra[];
  fecha_Compra: string;
}
