import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsEmail, IsString } from 'class-validator';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsEmail()
  email: string; // Уникальный email пользователя

  @Column()
  @IsString()
  password: string; // Хэшированный пароль
}
