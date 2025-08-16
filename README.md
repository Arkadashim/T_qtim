## Установка и запуск проекта

1. **Запуск Docker**:
   - Убедитесь, что Docker и Docker Compose установлены.
   - Выполните следующую команду для запуска контейнеров PostgreSQL и Redis:

     ```bash
     docker compose up -d
     ```

2. **Настройка переменных окружения**:
   - Скопируйте файл `.env.sample` для создания файла `.env`:

     ```bash
     cp .env.sample .env
     ```

   - Отредактируйте `.env`, указав свои настройки (например, учетные данные базы данных, секретный ключ JWT, параметры подключения к Redis).

3. **Установка зависимостей**:
   - Установите зависимости Node.js с помощью npm:

     ```bash
     npm install
     ```

4. **Сборка проекта**:
   - Скомпилируйте TypeScript-код в JavaScript:

     ```bash
     npm run build
     ```

5. **Запуск миграций и сидов базы данных**:
   - Примените миграции для настройки схемы базы данных:

     ```bash
     npm run migration:run
     ```

     Это выполняет: `typeorm migration:run -- -d ./src/config/typeorm.ts`

   - Заполните базу данных начальными данными:

     ```bash
     npm run seed
     ```

     Это выполняет: `ts-node src/seeding/run.ts`

6. **Запуск приложения**:
   - Запустите сервер в режиме разработки (режим разработки включает Swagger и логирование запросов к БД):

     ```bash
     npm run start:dev
     ```

7. **Доступ к API**:
   - Откройте браузер или API-клиент (например, Postman) и перейдите по адресу:

     ```
     http://localhost:3000/
     ```

## Сводка по проделанной работе

### Требования и их реализация

1. **Создание API для аутентификации**:
   - Реализованы регистрация и аутентификация пользователей с использованием JWT (JSON Web Tokens).
   - **Файлы**:
     - `src/auth/user.entity.ts`: Сущность пользователя для базы данных.
     - `src/auth/auth.service.ts`: Логика регистрации и аутентификации.
     - `src/auth/auth.controller.ts`: Контроллер для обработки запросов аутентификации.
     - `src/auth/jwt.strategy.ts`: Стратегия JWT для проверки токенов.
   - **Примечания**: Использован модуль `@nestjs/jwt` для генерации и проверки токенов. Пароли хешируются с помощью `bcrypt`

2. **Интеграция с PostgreSQL и TypeORM**:
   - Настроено подключение к PostgreSQL через TypeORM.
   - Реализованы миграции для управления структурой базы данных.
   - **Файлы**:
     - `src/config/typeorm.ts`: Конфигурация TypeORM.
     - `src/migrations/*`: Файлы миграций для создания таблиц `users` и `articles`.
     - `src/seeding/run.ts`: Скрипт для запуска сидов.
     - `src/seeding/factories/*`: Фабрика для создания тестовых сущностей.
   - **Примечания**: Сиды используют `@faker-js/faker` для генерации данных.

3. **CRUD API для сущности "Статья"**:
   - Сущность `Article` включает поля: `id`, `title`, `content`, `publishedAt`, `authorId`.
   - Реализованы операции создания, чтения, обновления и удаления статей.
   - Валидация входных данных с помощью `class-validator`.
   - Добавлена пагинация и фильтрация (по дате публикации и автору).
   - Создание и обновление статей защищены авторизацией (JWT).
   - **Файлы**:
     - `src/articles/article.entity.ts`: [Сущность статьи](./src/articles/article.entity.ts).
     - `src/articles/articles.service.ts`: [Сервис](./src/articles/articles.service.ts) Бизнес-логика CRUD-операций.
     - `src/articles/articles.controller.ts`: [Контроллер](.src/articles/articles.controller.ts) для обработки запросов.
     - `src/common/dto/pagination.dto.ts`: [DTO для пагинации](./src/common/dto/pagination.dto.ts).
     - `src/articles/dto/article-filter.dto.ts`: [DTO для фильтрации](./src/articles/dto/article-filter.dto.ts).
     - `src/articles/interfaces/paginated.interface.ts`: [Интерфейс для пагинированного ответа](./src/common/interfaces/paginated.dto.ts).

4. **Кэширование с Redis**:
   - Кэширование реализовано для запросов чтения статей по ID.
   - Инвалидация кэша происходит при обновлении или удалении статей.
   - **Файлы**:
     - `src/articles/articles.service.ts`: Логика кэширования.
     - `src/constants/cache-keys.ts`: Константы для ключей кэша.

5. **Тестирование**:
   - Написаны юнит-тесты для бизнес-логики методов в `ArticlesService` и `AuthService`.
   - Использован Jest с `@nestjs/testing`.
   - **Файлы**:
     - `src/articles/articles.service.spec.ts`: Тесты для `remove`.
     - `src/auth/auth.service.spec.ts`: Тесты для логики `register` и `login`

### Требования к коду и документации

- Код структурирован с использованием модулей NestJS, чистый и читаемый.
- Добавлены комментарии в ключевых местах (В сервисах, тестах и DTO).
- Документация API реализована через Swagger с использованием декораторов `@nestjs/swagger`.
- Примеры запросов и ответов задокументированы в `@ApiQuery` и `@ApiResponse`.
