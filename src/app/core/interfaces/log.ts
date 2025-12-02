export interface ILog {
    id_log: number;
    codigo_error: string;
    mensaje_error: string;
    detalle_error: string;
    id_usuario?: number;
    fecha: string;
    endpoint: string;
    metodo: string;
    nivel: string;
}
