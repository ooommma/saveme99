import { Inject, Injectable, Req, Request, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { Repository } from 'typeorm';
import { Request as RequestType } from 'express';
import { ConfigService } from '@nestjs/config';
import { Users } from '../user/entities/users.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.extractJWT, ExtractJwt.fromAuthHeaderAsBearerToken()]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  private static extractJWT(req: RequestType): string | null {
    if (req.cookies && 'authorization' in req.cookies && req.cookies.authorization.length > 0) {
      return req.cookies.authorization.split(' ')[1];
    }
    return null;
  }

  async validate(payload) {
    const { userId } = payload;
    let user: Users;
    user = await this.cacheManager.get(`userId:${userId}`);
    if (!user) {
      user = await this.userRepository.findOne({ where: { userId } });
      if (!user) {
        throw new UnauthorizedException();
      }
      await this.cacheManager.set(`userId:${userId}`, user);
    }

    return user;
  }
}
