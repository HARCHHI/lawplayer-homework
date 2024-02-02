import { resolve } from 'path';
import { getQueueToken } from '@nestjs/bull';
import { Config, JsonDB } from 'node-json-db';
import { Test, TestingModule } from '@nestjs/testing';
import { JSON_DB_TOKEN } from '../src/json-db.module';
import { PostsService } from '../src/posts/posts.service';

describe('Posts', () => {
  const dbConfig = new Config(
    resolve(`${__dirname}`, '../.tmp/test-db.json'),
    true,
    false,
    '/',
  );
  const testDb = new JsonDB(dbConfig);
  const mockPostTable = {
    posts: {
      1: {
        id: 1,
        coverUrl: 'http://url',
        imgurCoverUrl: 'http://url2',
        status: 'DONE',
      },
      2: {
        id: 2,
        coverUrl: 'http://url',
        imgurCoverUrl: null,
        status: 'IDLE',
      },
    },
    cursor: 3,
  };
  const mockQueue = { add: jest.fn().mockResolvedValue(null) };
  let provider: PostsService;

  beforeAll(async () => {
    if (await testDb.exists('/posts')) {
      await testDb.delete('/posts');
    }
    await testDb.push('/posts', mockPostTable);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: JSON_DB_TOKEN,
          useValue: testDb,
        },
        {
          provide: getQueueToken('post'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    provider = module.get<PostsService>(PostsService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all mocked posts', async () => {
    const res = await provider.findAll();

    expect(res).toEqual(Object.values(mockPostTable.posts));
    expect(provider.table).toEqual(mockPostTable);
  });

  it('should create new post', async () => {
    const input = 'http://newurl';
    const res = await provider.create(input);

    expect(res).toEqual({
      id: 3,
      coverUrl: input,
      imgurCoverUrl: null,
      status: 'IDLE',
    });

    expect(Object.values(provider.table.posts)).toHaveLength(3);
    const assertDb = new JsonDB(dbConfig);

    const resultTable = await assertDb.getData('/posts');

    expect(resultTable.posts).toEqual(mockPostTable.posts);
    expect(resultTable.cursor).toEqual(4);
  });

  it('should update post', async () => {
    await provider.update(2, 'DONE', 'imgur cover url');
    await provider.update(3, 'ERROR');

    expect(provider.table.posts[2].status).toEqual('DONE');
    expect(provider.table.posts[2].imgurCoverUrl).toEqual('imgur cover url');
    expect(provider.table.posts[3].status).toEqual('ERROR');
  });

  describe('createTaskCron', () => {
    it('should create task of all posts that have not yet been uploaded', async () => {
      await provider.update(3, 'IDLE');
      await provider.createTaskCron();

      expect(mockQueue.add).toHaveBeenCalledTimes(1);
      expect(provider.uploadCursor).toEqual(3);
    });
  });
});
