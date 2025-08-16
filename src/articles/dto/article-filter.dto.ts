import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, Min } from 'class-validator';

export class ArticleFilterDto {
  @ApiProperty({
    description: 'Дата публикации (начало диапазона, ISO 8601)',
    example: '2025-01-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  publishedAtFrom?: Date;

  @ApiProperty({
    description: 'Дата публикации (конец диапазона, ISO 8601)',
    example: '2025-12-31T23:59:59.999Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  publishedAtTo?: Date;

  @ApiProperty({
    description: 'ID автора',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  authorId?: number;
}
