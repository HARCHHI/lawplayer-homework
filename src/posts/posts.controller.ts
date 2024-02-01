import { Controller, Get, Post, Body } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post as PostEntity } from './interfaces/post.interface';
import { CreatePostDto } from './post.dto';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get()
  findAll(): Promise<PostEntity[]> {
    return this.postsService.findAll();
  }

  @Post()
  create(@Body() body: CreatePostDto): Promise<PostEntity> {
    return this.postsService.create(body.coverUrl);
  }
}
