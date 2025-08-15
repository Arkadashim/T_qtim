import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<{ access_token: string }> {
    const { email, password } = dto;

    // Проверка, существует ли пользователь
    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    // Хэширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание пользователя
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
    });
    await this.userRepository.save(user);

    // Генерация JWT
    const payload = this.generatePayloadByUser(user);
    const access_token = await this.signAccessToken(payload);

    return { access_token };
  }

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const { email, password } = dto;

    // Поиск пользователя
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Генерация JWT
    const payload = this.generatePayloadByUser(user);
    const access_token = await this.signAccessToken(payload);

    return { access_token };
  }

  /**
   * Формирование payload по user
   */
  private generatePayloadByUser(user: User): JwtPayload {
    return { auth: { id: user.id, email: user.email } };
  }

  /**
   * Подписание токена доступа
   */
  private async signAccessToken(payload: JwtPayload): Promise<string> {
    const jwtAccessSecret = this.configService.get('JWT_TOKEN') as string;
    return this.jwtService.signAsync(payload, {
      secret: jwtAccessSecret,
    });
  }
}
