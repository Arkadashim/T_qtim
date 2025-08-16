import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

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
  // Трансформация даты в строку ISO при передаче ответа
  @Transform(({ value }) =>
    value instanceof Date
      ? value.toISOString().split('T')[0]
      : (value as string),
  )
  publicationDate: string;

  @ApiProperty({ example: 1, description: 'ID автора статьи' })
  authorId: number;
}
