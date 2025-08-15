import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class InitDb1755273338906 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создание таблицы пользователей
    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
          },
        ],
      }),
      true,
    );

    // Создание таблицы статей
    await queryRunner.createTable(
      new Table({
        name: 'article',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'publicationDate',
            type: 'date',
          },
          {
            name: 'authorId',
            type: 'integer',
          },
        ],
      }),
      true,
    );

    // Создание связи
    await queryRunner.createForeignKey(
      'article',
      new TableForeignKey({
        columnNames: ['authorId'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаление связи пользователей со статьями
    await queryRunner.dropForeignKey('article', 'FK_article_authorId_user_id');
    // Удаление таблицы статей
    await queryRunner.dropTable('article');
    // Удаление таблицы пользователей
    await queryRunner.dropTable('user');
  }
}
