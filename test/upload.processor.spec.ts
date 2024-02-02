import * as nock from 'nock';
import { Test, TestingModule } from '@nestjs/testing';
import { UploadProcessor } from '../src/posts/upload.processor';
import { PostsService } from '../src/posts/posts.service';

describe('Posts', () => {
  const mockUrl = 'http://mock.imgur';
  const mockId = 'mock client id';
  const mockPostsService = {
    update: jest.fn().mockResolvedValue(null),
  };
  let provider: UploadProcessor;

  beforeAll(async () => {
    process.env.IMGUR_API_URL = mockUrl;
    process.env.IMGUR_CLIENT_ID = mockId;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadProcessor,
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
      ],
    }).compile();

    provider = module.get<UploadProcessor>(UploadProcessor);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadToImgur', () => {
    it('upload imags when get jobs', async () => {
      const id = 3;
      const originUrl = 'http://mock.origin.url';
      const resultUrl = 'http://mock.result.url';
      nock(`${mockUrl}`)
        .post(`/${3}/upload`)
        .reply(200, {
          data: {
            link: resultUrl,
          },
        });
      await provider.uploadToImgur({
        id,
        coverUrl: originUrl,
        status: 'IDLE',
        imgurCoverUrl: null,
      });

      expect(mockPostsService.update).toHaveBeenCalledWith(id, 'UPLOADING');
      expect(mockPostsService.update).toHaveBeenCalledWith(
        id,
        'DONE',
        resultUrl,
      );
    });

    it('should mark post status to ERROR when upload failed', async () => {
      const id = 3;
      const originUrl = 'http://mock.origin.url';

      nock(`${mockUrl}`)
        .post(`/${3}/upload`)
        .reply(400, {
          data: {
            error: 'any reason',
          },
        });
      await provider.uploadToImgur({
        id,
        coverUrl: originUrl,
        status: 'IDLE',
        imgurCoverUrl: null,
      });

      expect(mockPostsService.update).toHaveBeenCalledWith(id, 'UPLOADING');
      expect(mockPostsService.update).toHaveBeenCalledWith(id, 'ERROR');
      expect(mockPostsService.update).toHaveBeenCalledTimes(2);
      nock.restore();
    });
  });
});
