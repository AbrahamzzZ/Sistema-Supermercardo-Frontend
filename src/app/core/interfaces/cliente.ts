export interface ICliente {
  id_Cliente: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  telefono: string;
  correo_Electronico: string;
  fecha_Registro?: string;
}
