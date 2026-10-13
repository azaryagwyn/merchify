export interface Env {
  DB: D1Database;
  MIDTRANS_SERVER_KEY: string;
  MIDTRANS_CLIENT_KEY: string;
  MIDTRANS_IS_PRODUCTION?: string;
  ASSETS?: Fetcher;
}
