import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { UploadProcessor } from './upload.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'post',
    }),
  ],
  controllers: [PostsController],
  providers: [PostsService, UploadProcessor],
})
export class PostsModule {}
