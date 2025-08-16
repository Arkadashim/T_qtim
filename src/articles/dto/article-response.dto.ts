import { ApiProperty } from '@nestjs/swagger';

export class ArticleResponseDto {
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор статьи' })
  id: number;

  @ApiProperty({ example: 'Моя первая статья', description: 'Название статьи' })
  title: string;

  @ApiProperty({
    example: 'Это описание моей первой статьи...',
    description: 'Описание статьи',
  })
  description: string;

  @ApiProperty({ example: '2025-08-15', description: 'Дата публикации статьи' })
  publicationDate: string;

  @ApiProperty({ example: 1, description: 'ID автора статьи' })
  authorId: number;
}
