export interface ILog {
    id_Log: number;
    codigo_Error: string;
    mensaje_Error: string;
    detalle_Error: string;
    id_Usuario?: number;
    fecha: string;
    endpoint: string;
    metodo: string;
    nivel: string;
}
