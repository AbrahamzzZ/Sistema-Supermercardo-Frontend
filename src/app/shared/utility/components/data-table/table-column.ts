/** Cómo se muestra el valor de una columna en la tabla. */
export type TipoColumna =
  | 'text'
  | 'number'
  | 'currency'
  | 'stock'
  | 'date'
  | 'status'
  | 'image'
  | 'view'
  | 'actions'
  | 'select';

export interface TableColumn {
  key: string;
  label: string;
  type?: TipoColumna;
}
