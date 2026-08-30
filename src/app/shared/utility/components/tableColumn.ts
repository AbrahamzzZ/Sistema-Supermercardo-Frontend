export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'currency' | 'stock' | 'date' | 'status' | 'image' | 'view' | 'actions';
}