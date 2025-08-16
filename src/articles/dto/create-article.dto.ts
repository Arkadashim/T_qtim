import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsString, MinLength } from 'class-validator';

export class CreateArticleDto {
  @ApiProperty({
    example: 'Моя первая статья',
    description: 'Название статьи, минимум 3 символа',
  })
  @IsString()
  @MinLength(3, { message: 'Название должно содержать минимум 3 символа' })
  title: string;

  @ApiProperty({
    example: 'Это описание моей первой статьи...',
    description: 'Описание статьи',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: '2025-08-15',
    description: 'Дата публикации статьи в формате ISO (YYYY-MM-DD)',
  })
  @IsDateString(
    {},
    { message: 'Некорректный формат даты (ожидается YYYY-MM-DD)' },
  )
  @Transform(({ value }) => new Date(value))
  publicationDate: Date;
}
