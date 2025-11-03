export interface ITransportista {
  id_Transportista: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  telefono: string;
  correo_Electronico: string;
  imagen?: string;
  imagenBase64?: string | Uint8Array | File | null;
  estado: boolean;
  fecha_Registro?: string;
}
