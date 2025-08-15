import { IsDate, IsString } from 'class-validator';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../auth/user.entity';

@Entity({ name: 'article' })
export class Article {
  @PrimaryGeneratedColumn()
  id: number; // Уникальный идентификатор статьи

  @Column({ type: 'varchar', length: 255 })
  @IsString()
  title: string; // Название статьи

  @Column({ type: 'text' })
  @IsString()
  description: string; // Описание статьи

  @Column({ type: 'date' })
  @IsDate()
  publicationDate: Date; // Дата публикации

  @ManyToOne(() => User, (user) => user.id)
  author: User; // Автор статьи
}
