declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
    DB_FILE_PATH: string;
    REDIS_HOST: string;
    REDIS_PORT: string;
    IMGUR_API_URL: string;
    IMGUR_CLIENT_ID: string;
  }
}
