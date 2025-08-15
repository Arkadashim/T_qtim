import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../user.entity';

export type JwtPayload = {
  auth: {
    id: number;
    email: string;
  };
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject() private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    const jwtAccessSecret = configService.get('JWT_TOKEN') as string;

    if (!jwtAccessSecret || jwtAccessSecret === 'secret') {
      Logger.warn(
        'Configuration property "jwtAccessSecret" is not defined or not secure',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtAccessSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userRepository.findOneBy({ id: payload.auth.id });
    return user ? { id: user.id, email: user.email } : null;
  }
}
