import axios from 'axios';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { PostsService } from './posts.service';
import { Post } from './interfaces/post.interface';

@Processor('post')
export class UploadProcessor {
  #logger = new Logger(UploadProcessor.name);

  #clientId: string = null;

  #url: string;

  constructor(private postsService: PostsService) {
    this.#clientId = process.env.IMGUR_CLIENT_ID;
    this.#url = process.env.IMGUR_API_URL;
  }

  @Process('upload')
  async handleUpload(job: Job) {
    await this.uploadToImgur(job.data as Post);
  }

  async uploadToImgur(data: Post) {
    const { id, coverUrl } = data;
    const fileName: string = coverUrl.split('/').slice(-1)[0];

    this.#logger.log(`post id: ${id} cover image start upload`);

    try {
      await this.postsService.update(id, 'UPLOADING'); // mark as UPLOADING

      const body = new FormData(); // prepare upload info

      body.append('image', coverUrl);
      body.append('type', 'url');
      body.append('name', fileName);
      body.append('title', fileName);

      const res = await axios.post(`${this.#url}/3/upload`, body, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Client-ID ${this.#clientId}`,
        },
      }); // uplaod
      const imgurCoverUrl = res.data.data.link;

      await this.postsService.update(id, 'DONE', imgurCoverUrl); // dist result
      this.#logger.log(`post id: ${id} cover image uploaded`);
    } catch (error) {
      this.#logger.error(
        `post id: ${id} cover image upload failed, reason: ${error}`,
      );

      await this.postsService.update(id, 'ERROR');
    }
  }
}
