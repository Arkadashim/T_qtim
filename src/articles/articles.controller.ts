import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IPaginated, PaginationDto } from 'src/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ArticlesService } from './articles.service';
import {
  ArticleFilterDto,
  ArticleResponseDto,
  CreateArticleDto,
  UpdateArticleDto,
} from './dto';

@ApiTags('Статьи')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создание новой статьи' })
  @ApiBody({ type: CreateArticleDto })
  @ApiResponse({
    status: 201,
    description: 'Статья успешно создана',
    type: ArticleResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  async create(
    @Body() createArticleDto: CreateArticleDto,
    @Request() req,
  ): Promise<ArticleResponseDto> {
    return this.articlesService.create(createArticleDto, req.user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Получение списка всех статей с пагинацией и фильтрацией',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Номер страницы',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Количество элементов на странице',
  })
  @ApiQuery({
    name: 'publishedAtFrom',
    required: false,
    type: String,
    example: '2025-01-01T00:00:00.000Z',
    description: 'Дата публикации (начало диапазона, ISO 8601)',
  })
  @ApiQuery({
    name: 'publishedAtTo',
    required: false,
    type: String,
    example: '2025-12-31T23:59:59.999Z',
    description: 'Дата публикации (конец диапазона, ISO 8601)',
  })
  @ApiQuery({
    name: 'authorId',
    required: false,
    type: Number,
    example: 1,
    description: 'ID автора',
  })
  @ApiResponse({
    status: 200,
    description: 'Список статей возвращён',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/ArticleResponseDto' },
        },
        total: { type: 'number', example: 100 },
      },
    },
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: ArticleFilterDto,
  ): Promise<IPaginated<ArticleResponseDto>> {
    return this.articlesService.findAll(paginationDto, filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение статьи по ID' })
  @ApiParam({ name: 'id', description: 'ID статьи', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Статья найдена',
    type: ArticleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Статья не найдена' })
  async findOne(@Param('id') id: string): Promise<ArticleResponseDto> {
    return this.articlesService.findOne(+id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновление статьи по ID' })
  @ApiParam({ name: 'id', description: 'ID статьи', example: 1 })
  @ApiBody({ type: UpdateArticleDto })
  @ApiResponse({
    status: 200,
    description: 'Статья обновлена',
    type: ArticleResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  @ApiResponse({
    status: 403,
    description: 'Вы не можете редактировать чужую статью',
  })
  @ApiResponse({ status: 404, description: 'Статья не найдена' })
  async update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @Request() req,
  ): Promise<ArticleResponseDto> {
    return this.articlesService.update(+id, updateArticleDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удаление статьи по ID' })
  @ApiParam({ name: 'id', description: 'ID статьи', example: 1 })
  @ApiResponse({ status: 200, description: 'Статья удалена' })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  @ApiResponse({
    status: 403,
    description: 'Вы не можете удалить чужую статью',
  })
  @ApiResponse({ status: 404, description: 'Статья не найдена' })
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.articlesService.remove(+id, req.user.id);
  }
}
