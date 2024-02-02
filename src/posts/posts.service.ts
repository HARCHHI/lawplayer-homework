import { Inject, Injectable } from '@nestjs/common';
import { JsonDB } from 'node-json-db';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { JSON_DB_TOKEN } from '../json-db.module';
import { Post, PostStatusEnum, PostTable } from './interfaces/post.interface';

@Injectable()
export class PostsService {
  #tableKey = '/posts';

  #db: JsonDB;

  table: PostTable;

  uploadCursor: number = 0;

  postQueue: Queue;

  constructor(
    @Inject(JSON_DB_TOKEN) db: JsonDB,
    @InjectQueue('post') postQueue: Queue,
  ) {
    this.#db = db;
    this.postQueue = postQueue;

    this.#initTable().then(this.createTaskCron.bind(this));
  }

  async #initTable(): Promise<void> {
    const isTableExists = await this.#db.exists(this.#tableKey);

    // 初始化table(如果不存在)
    if (!isTableExists) {
      await this.#db.push(this.#tableKey, { posts: {}, cursor: 1 });
    }
    // 基於node-json-db的特性 直接紀錄指定object的address方便操作
    this.table = await this.#db.getData(this.#tableKey);
  }

  async findAll(): Promise<Post[]> {
    if (!this.table) await this.#initTable();

    return Object.values(this.table.posts);
  }

  async create(coverUrl: string): Promise<Post> {
    if (!this.table) await this.#initTable();
    const newPost: Post = {
      id: this.table.cursor,
      coverUrl,
      imgurCoverUrl: null,
      status: 'IDLE',
    };

    this.table.posts[this.table.cursor] = newPost; // 新增post
    this.table.cursor += 1; // auto increment id
    await this.#db.save(); // sync to disk
    return newPost;
  }

  async update(id: number, status: PostStatusEnum, imgurCoverUrl?: string) {
    const target = this.table.posts[id];

    target.status = status;
    if (imgurCoverUrl) target.imgurCoverUrl = imgurCoverUrl;

    await this.#db.save();
  }

  @Cron('0 * * * * *')
  async createTaskCron() {
    const uncheckedPosts = Object.values(this.table.posts).slice(
      this.uploadCursor,
    );

    this.uploadCursor += uncheckedPosts.length;

    const tasks = uncheckedPosts
      .filter((post) => post.status === 'IDLE' && post.imgurCoverUrl === null)
      .map((post) => this.postQueue.add('upload', post));

    await Promise.all(tasks);
  }
}
