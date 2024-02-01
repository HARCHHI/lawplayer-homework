import { JsonDB, Config } from 'node-json-db';
import {
  Module,
  OnApplicationShutdown,
  DynamicModule,
  FactoryProvider,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

export const JSON_DB_TOKEN = Symbol('JSON_DB_TOKEN');

export const createJsonDbProvider = (
  config: Config,
): FactoryProvider<JsonDB> => {
  const db = new JsonDB(config);

  return {
    provide: JSON_DB_TOKEN,
    useFactory: (): JsonDB => db,
  };
};

@Module({})
export class JsonDbModule implements OnApplicationShutdown {
  constructor(private moduleRef: ModuleRef) {}

  static forRoot(config: Config, isGlobal = true): DynamicModule {
    const dbProvider = createJsonDbProvider(config);

    return {
      global: isGlobal,
      module: JsonDbModule,
      providers: [dbProvider],
      exports: [dbProvider],
    };
  }

  onApplicationShutdown() {
    const db = this.moduleRef.get<JsonDB>(JSON_DB_TOKEN);

    db.save();
  }
}
