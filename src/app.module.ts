import { Config } from 'node-json-db';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PostsModule } from './posts/posts.module';
import { JsonDbModule } from './json-db.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JsonDbModule.forRoot(
      new Config(process.env.DB_FILE_PATH, true, false, '/'),
    ),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10),
      },
    }),
    PostsModule,
  ],
})
export class AppModule {}
