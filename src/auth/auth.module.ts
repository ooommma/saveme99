import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../user/entities/users.entity';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.startegy';
import { UserModule } from '../user/user.module';
import { AwsModule } from '../aws/aws.module';
import { UtilsModule } from '../utils/utils.module';
import { UserService } from '../user/user.service';
import { Boards } from '../boards/entities/board.entity';
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),

    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: {
          expiresIn: 60 * 60 * 5,
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Users, Boards]),
    forwardRef(() => UserModule),
    AwsModule,
    UtilsModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [PassportModule, AuthService],
})
export class AuthModule {}
