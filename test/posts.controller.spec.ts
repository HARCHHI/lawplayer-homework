import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from '../src/posts/posts.controller';
import { PostsService } from '../src/posts/posts.service';

describe('PostsController', () => {
  let controller: PostsController;
  const mockPostsService = {
    findAll: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue(null),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: PostsService, useValue: mockPostsService }],
      controllers: [PostsController],
    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('metadata "path"', () => {
    it('should set "scooters"', () => {
      expect(Reflect.getMetadata('path', PostsController)).toEqual('posts');
    });

    it('should set "/"', () => {
      expect(Reflect.getMetadata('path', controller.findAll)).toEqual('/');
      expect(Reflect.getMetadata('path', controller.create)).toEqual('/');
    });
  });

  describe('controllers', () => {
    it('postsService.findAll should be called', async () => {
      await controller.findAll();
      expect(mockPostsService.findAll).toHaveBeenCalled();
    });

    it('postsService.create should be called', async () => {
      const coverUrl = 'http://sdsa.asd/asd.jpg';

      await controller.create({ coverUrl });
      expect(mockPostsService.create).toHaveBeenCalledWith(coverUrl);
    });
  });
});
