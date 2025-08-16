import { faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';
import { Article } from '../../articles/article.entity';

export default setSeederFactory(Article, () => {
  const article = new Article();
  article.title = faker.lorem.sentence({ min: 3, max: 7 });
  article.description = faker.lorem.paragraph();
  article.publicationDate = faker.date.between({
    from: '2025-01-01',
    to: '2025-08-16',
  });
  // authorId будет установлен в сидере
  return article;
});
