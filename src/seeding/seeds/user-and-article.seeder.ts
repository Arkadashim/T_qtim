import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { Article } from '../../articles/article.entity';
import { User } from '../../auth/user.entity';

export class UsersAndArticlesSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    // Получение фабрик
    const userFactory = factoryManager.get(User);
    const articleFactory = factoryManager.get(Article);

    // Создание пользователей
    const users = await userFactory.saveMany(3);
    await dataSource.getRepository(User).save(users);

    // Создание статей
    const articles = await Promise.all(
      Array.from({ length: 10 }, async () => {
        const article = await articleFactory.make();
        article.authorId = faker.helpers.arrayElement(users).id;
        return article;
      }),
    );
    await dataSource.getRepository(Article).save(articles);
  }
}
