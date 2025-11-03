export interface IProductoRespuesta {
  id_Producto: number;
  codigo?: string;
  descripcion?: string;
  nombre_Producto?: string;
  id_Categoria?: number;
  nombre_Categoria?: string;
  pais_Origen?: string;
  estado: boolean;
}
