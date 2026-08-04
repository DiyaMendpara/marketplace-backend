export interface AuthRequest {
  headers: {
    authorization?: string;
    Authorization?: string;
    [key: string]: string | string[] | undefined;
  };
  user?: {
    _id: unknown;
    name: string;
    email: string;
    role: string;
  };
}
