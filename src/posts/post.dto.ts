import { IsUrl } from 'class-validator';

export class CreatePostDto {
  @IsUrl()
  coverUrl: string;
}
