export interface IProveedor {
  id_Proveedor: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  telefono: string;
  correo_Electronico: string;
  estado: boolean;
  fecha_Registro?: string;
}
