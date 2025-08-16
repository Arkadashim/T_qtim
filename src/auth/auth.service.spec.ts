import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from './strategies';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
  };

  const mockRegisterDto: RegisterDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockLoginDto: LoginDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockJwtPayload: JwtPayload = {
    auth: { id: mockUser.id, email: mockUser.email },
  };

  const mockUserRepository = {
    findOneBy: jest.fn(),
    create: jest.fn().mockReturnValue(mockUser),
    save: jest.fn().mockResolvedValue(mockUser),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mockedJwtToken'),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('your_secret_key_123'),
  };

  beforeEach(async () => {
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user and return a JWT', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null); // Пользователь не существует

      const result = await service.register(mockRegisterDto);

      // Проверка бизнес-логики
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: mockRegisterDto.email,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(mockRegisterDto.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: mockRegisterDto.email,
        password: 'hashedPassword',
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(configService.get).toHaveBeenCalledWith('JWT_TOKEN');
      expect(jwtService.signAsync).toHaveBeenCalledWith(mockJwtPayload, {
        secret: 'your_secret_key_123',
      });
      expect(result).toEqual({ access_token: 'mockedJwtToken' });
    });

    it('should throw ConflictException if user with email already exists', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser); // Пользователь существует

      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        new ConflictException('Пользователь с таким email уже существует'),
      );

      // Проверка, что дальнейшая логика не выполняется
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: mockRegisterDto.email,
      });
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(configService.get).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    // Авторизация успешна, возвращаем токен
    it('should successfully login and return a JWT', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser); // Пользователь найден
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never); // Пароль верный

      const result = await service.login(mockLoginDto);

      // Проверка бизнес-логики
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: mockLoginDto.email,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockLoginDto.password,
        mockUser.password,
      );
      expect(configService.get).toHaveBeenCalledWith('JWT_TOKEN');
      expect(jwtService.signAsync).toHaveBeenCalledWith(mockJwtPayload, {
        secret: 'your_secret_key_123',
      });
      expect(result).toEqual({ access_token: 'mockedJwtToken' });
    });

    // Пользователь не найден, выброшено исключение
    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null); // Пользователь не найден

      await expect(service.login(mockLoginDto)).rejects.toThrow(
        new UnauthorizedException('Неверный email или пароль'),
      );

      // Проверка, что дальнейшая логика не выполняется
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: mockLoginDto.email,
      });
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(configService.get).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    // Неверный пароль, выбрасывается исключение
    it('should throw UnauthorizedException if password is incorrect', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser); // Пользователь найден
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never); // Пароль неверный

      await expect(service.login(mockLoginDto)).rejects.toThrow(
        new UnauthorizedException('Неверный email или пароль'),
      );

      // Проверка, что дальнейшая логика не выполняется
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: mockLoginDto.email,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockLoginDto.password,
        mockUser.password,
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
