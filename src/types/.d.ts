declare module 'mysql2' {
  export interface RowDataPacket {
    [key: string]: any;
  }

  export interface MysqlError extends Error {
    code?: string;
    errno?: number;
    sqlMessage?: string;
    sqlState?: string;
    fatal?: boolean;
    stack?: string;
  }

  export interface PoolConnection extends MysqlError {
    release(): void;
  }
}
