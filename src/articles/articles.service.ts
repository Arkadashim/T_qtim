import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { plainToInstance } from 'class-transformer';
import { IPaginated, PaginationDto } from 'src/common';
import { ARTICLE_CACHE_KEYS } from 'src/constants';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import { ArticleResponseDto } from './dto/article-response.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(
    createArticleDto: CreateArticleDto,
    userId: number,
  ): Promise<ArticleResponseDto> {
    const article = this.articleRepository.create({
      ...createArticleDto,
      authorId: userId,
    });
    const savedArticle = await this.articleRepository.save(article);
    return this.toResponseDto(savedArticle);
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<IPaginated<ArticleResponseDto>> {
    const { page, limit } = paginationDto;
    const cacheKey = ARTICLE_CACHE_KEYS.ALL_PAGINATED(page, limit);
    const cachedResult =
      await this.cacheManager.get<IPaginated<ArticleResponseDto>>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    const [articles, total] = await this.articleRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    const items = articles.map(this.toResponseDto);
    const result: IPaginated<ArticleResponseDto> = { items, total };

    await this.cacheManager.set(cacheKey, result, 600);
    return result;
  }

  async findOne(id: number): Promise<ArticleResponseDto> {
    const cacheKey = ARTICLE_CACHE_KEYS.BY_ID(id);
    const cachedArticle =
      await this.cacheManager.get<ArticleResponseDto>(cacheKey);

    if (cachedArticle) {
      return cachedArticle;
    }

    const article = await this.articleRepository.findOneBy({ id });
    if (!article) {
      throw new NotFoundException(`Статья с ID ${id} не найдена`);
    }
    const response = this.toResponseDto(article);
    await this.cacheManager.set(cacheKey, response);
    return response;
  }

  async update(
    id: number,
    updateArticleDto: UpdateArticleDto,
    userId: number,
  ): Promise<ArticleResponseDto> {
    const article = await this.articleRepository.findOneBy({ id });
    if (!article) {
      throw new NotFoundException(`Статья с ID ${id} не найдена`);
    }

    if (article.authorId !== userId) {
      throw new ForbiddenException('Вы не можете редактировать чужую статью');
    }

    // Перезапишем поля, переданные в запросе
    Object.assign(article, {
      ...updateArticleDto,
      publicationDate: updateArticleDto.publicationDate
        ? new Date(updateArticleDto.publicationDate)
        : article.publicationDate,
    });
    const updatedArticle = await this.articleRepository.save(article);

    // Инвалидация кэша
    await this.cacheManager.clear();

    return this.toResponseDto(updatedArticle);
  }

  async remove(id: number, userId: number): Promise<void> {
    const article = await this.articleRepository.findOneBy({ id });

    if (!article) {
      throw new NotFoundException(`Статья с ID ${id} не найдена`);
    }

    if (article.authorId !== userId) {
      throw new ForbiddenException('Вы не можете удалить чужую статью');
    }

    await this.articleRepository.delete(id);
    // Инвалидация кэша
    await this.cacheManager.clear();
  }

  /**
   * Трансформируем инстанс сущности Статья в формат DTO
   */
  private toResponseDto(article: Article): ArticleResponseDto {
    return plainToInstance(ArticleResponseDto, article);
  }
}
