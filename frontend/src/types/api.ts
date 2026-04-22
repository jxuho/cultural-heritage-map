//JSend standard specification interface
export interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  data: T;
  message?: string;
}
