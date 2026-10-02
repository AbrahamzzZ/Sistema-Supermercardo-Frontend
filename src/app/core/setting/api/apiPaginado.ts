export interface ApiPaginado<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}
