import { resolve } from 'path';
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
    posts: [
      {
        id: 1,
        coverUrl: 'http://url',
        imgurCoverUrl: 'http://url2',
        status: 'DONE',
      },
      {
        id: 2,
        coverUrl: 'http://url',
        imgurCoverUrl: null,
        status: 'IDLE',
      },
    ],
    cursor: 3,
  };
  let provider: PostsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: JSON_DB_TOKEN,
          useValue: testDb,
        },
      ],
    }).compile();

    await testDb.delete('/posts');
    await testDb.push('/posts', mockPostTable);

    provider = module.get<PostsService>(PostsService);
  });

  it('should return all mocked posts', async () => {
    const res = await provider.findAll();

    expect(res).toEqual(mockPostTable.posts);
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

    expect(provider.table.posts).toHaveLength(3);
    const assertDb = new JsonDB(dbConfig);

    const resultTable = await assertDb.getData('/posts');

    expect(resultTable.posts).toEqual(mockPostTable.posts);
    expect(resultTable.cursor).toEqual(4);
  });
});
