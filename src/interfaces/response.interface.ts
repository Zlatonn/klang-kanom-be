export interface ResponseInterface<T1, T2> {
  statusCode: number;
  success: boolean;
  data?: T1;
  errorMessage?: T2;
  timestamp: string;
  path?: string;
}
