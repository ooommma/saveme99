import Joi from 'joi';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ColumnModule } from './column/column.module';
import { Columns } from './column/entities/column.entity';

const typeOrmModuleOptions = {
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => ({
    namingStrategy: new SnakeNamingStrategy(),
    type: 'mysql',
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    database: configService.get('DB_NAME'),
    entities: [Columns],
    synchronize: configService.get('DB_SYNC'),
    // 실행시킬때 db의 query가 자동으로 터미널에 나옴
    logging: true,
  }),
  inject: [ConfigService],
};

@Module({
  imports: [
  // configmodule로 .env의 코드들을 사용 가능
    ConfigModule.forRoot({

      // 서버 전체에서 configmodule의 사용을 위해 전역변수로 지정한다
      isGlobal: true,

      // .env 파일의 코드들과 유효성 검사를 위한 validationSchema
      validationSchema: Joi.object({
        JWT_SECRET_KEY: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_NAME: Joi.string().required(),
        DB_SYNC: Joi.boolean().required(),
      }),
    }),
    // typeorm을 사용하여 db를 연결한다
    // forRootAsync를 사용하여 configService의 환경변수를 사용 가능하다
    // 참고로 위의 typeOrmModuleOption을 바로 작성 안하고 변수로 지정해서 옮긴거임
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    AuthModule,
    ColumnModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}