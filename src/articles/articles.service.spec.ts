import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ARTICLE_CACHE_KEYS } from '../constants';
import { Article } from './article.entity';
import { ArticlesService } from './articles.service';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let articleRepository: Repository<Article>;

  // Mock data
  const mockArticle = {
    id: 1,
    title: 'Test Article',
    content: 'Test Content',
    publishedAt: new Date('2023-01-01T00:00:00.000Z'),
    author: { id: 1 },
    authorId: 1,
  };

  const mockRepository = {
    findOneBy: jest.fn(),
    delete: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: getRepositoryToken(Article),
          useValue: mockRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
    articleRepository = module.get<Repository<Article>>(
      getRepositoryToken(Article),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('remove', () => {
    // Если статья найдена и пользователь авторизован
    it('should successfully remove an article when user is authorized', async () => {
      // Ожидается, что вернется статья
      mockRepository.findOneBy.mockResolvedValue(mockArticle);

      // Выполнится void (return undefined)
      await expect(service.remove(1, 1)).resolves.toBeUndefined();

      // Будет вызван поиск по id
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      // Будет вызван метод удаления
      expect(mockRepository.delete).toHaveBeenCalledWith(1);

      // Вызвана инвалидация кэша
      expect(mockCacheManager.del).toHaveBeenCalledWith(
        ARTICLE_CACHE_KEYS.BY_ID(mockArticle.id),
      );
    });

    // Если статья не существует
    it('should throw NotFoundException when article does not exist', async () => {
      // Ожидается, что вернется null
      mockRepository.findOneBy.mockResolvedValue(null);

      // Будет вызвано исключение
      await expect(service.remove(1, 1)).rejects.toThrow(
        new NotFoundException(`Статья с ID ${1} не найдена`),
      );

      // Вызван метод с id: 1
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        id: 1,
      });
      // Не вызван метод удаления
      expect(mockRepository.delete).not.toHaveBeenCalled();

      // Не вызвана инвладиация кэша
      expect(mockCacheManager.del).not.toHaveBeenCalled();
    });

    // Если пользователь пытается удалить не свою статью
    it('should throw NotFoundException when user deletes others article', async () => {
      // Ожидается, что будет найдена статья по id
      mockRepository.findOneBy.mockResolvedValue(mockArticle);

      // Но вызвана ошибка, так пользователь не тот
      await expect(service.remove(1, 2)).rejects.toThrow(
        new ForbiddenException('Вы не можете удалить чужую статью'),
      );

      //Вызван метод поиска
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });

      // Не вызван метод уадления
      expect(mockRepository.delete).not.toHaveBeenCalled();

      // Не вызвана инвладиация кэша
      expect(mockCacheManager.del).not.toHaveBeenCalled();
    });
  });
});
