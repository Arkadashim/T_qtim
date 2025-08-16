import { IsString, IsDateString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateArticleDto {
  @ApiProperty({
    example: 'Обновлённое название',
    description: 'Название статьи, минимум 3 символа',
    required: false,
  })
  @IsString()
  @MinLength(3, { message: 'Название должно содержать минимум 3 символа' })
  @IsOptional()
  title?: string;

  @ApiProperty({
    example: 'Обновлённое описание статьи...',
    description: 'Описание статьи (необязательно)',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '2025-08-16',
    description:
      'Дата публикации статьи в формате ISO (YYYY-MM-DD, необязательно)',
    required: false,
  })
  @IsDateString(
    {},
    { message: 'Некорректный формат даты (ожидается YYYY-MM-DD)' },
  )
  @IsOptional()
  publicationDate?: string;
}
