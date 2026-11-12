export interface ILog {
  id_Log: number | string;
  codigo: string;
  mensaje: string;
  detalle: string;
  id_Usuario?: number;
  fecha: string;
  endpoint: string;
  metodo: string;
  nivel: string;
  servicio?: string;
}
