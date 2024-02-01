import { Inject, Injectable } from '@nestjs/common';
import { JsonDB } from 'node-json-db';
import { JSON_DB_TOKEN } from '../json-db.module';
import { Post, PostTable } from './interfaces/post.interface';

@Injectable()
export class PostsService {
  #tableKey = '/posts';

  #db: JsonDB;

  table: PostTable;

  constructor(@Inject(JSON_DB_TOKEN) db: JsonDB) {
    this.#db = db;
  }

  async #initTable(): Promise<void> {
    const isTableExists = await this.#db.exists(this.#tableKey);

    // 初始化table(如果不存在)
    if (!isTableExists) {
      await this.#db.push(this.#tableKey, { posts: [], cursor: 1 });
    }
    // 基於node-json-db的特性 直接紀錄指定object的address方便操作
    this.table = await this.#db.getData(this.#tableKey);
  }

  async findAll(): Promise<Post[]> {
    if (!this.table) await this.#initTable();

    return this.table.posts;
  }

  async create(coverUrl: string): Promise<Post> {
    if (!this.table) await this.#initTable();
    const newPost: Post = {
      id: this.table.cursor,
      coverUrl,
      imgurCoverUrl: null,
      status: 'IDLE',
    };

    this.table.posts.push(newPost); // 新增post
    this.table.cursor += 1; // auto increment id
    await this.#db.save(); // sync to disk

    return newPost;
  }
}
