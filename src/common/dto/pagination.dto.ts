import { IsInt, Min, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({
    example: 1,
    description: 'Номер страницы (начинается с 1)',
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Page должен быть целым числом' })
  @Min(1, { message: 'Page должен быть не меньше 1' })
  @Transform(({ value }) => parseInt(value, 10))
  page: number = 1;

  @ApiProperty({
    example: 10,
    description: 'Количество элементов на странице',
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Limit должен быть целым числом' })
  @Min(1, { message: 'Limit должен быть не меньше 1' })
  @Transform(({ value }) => parseInt(value, 10))
  limit: number = 10;
}
