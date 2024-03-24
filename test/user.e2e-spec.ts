import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../src/auth/auth.module';
import cookieParser from 'cookie-parser';
import { AwsModule } from '../src/aws/aws.module';
import { UtilsModule } from '../src/utils/utils.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../src/user/user.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        UserModule,
        AppModule,
        TypeOrmModule.forRootAsync({
          useFactory: () => ({
            type: 'mysql', // 사용하는 데이터베이스 타입에 맞춰 설정
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            autoLoadEntities: true,
            synchronize: true, // 테스트 환경에서만 사용하는 것이 좋음
            dropSchema: true,
          }),
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    app.use(cookieParser());
    await app.init();
    await request(app.getHttpServer())
      .post('/auth/register')
      .field('email', 'popcn940620@gmail.com')
      .field('name', '김라임재')
      .field('password', '1222333');
  });
  describe('users Put method', () => {
    it('users/:userId Success with file', async () => {
      const login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'popcn940620@gmail.com',
          password: '1222333',
        });
      const response = await request(app.getHttpServer())
        .put('/users/1')
        .query({ userId: 1 })
        .field('name', '김라임임')
        .attach('file', 'test/test-resource/test.PNG')
        .set('Cookie', login.headers['set-cookie']);

      expect(response.statusCode).toBe(200);
      expect(response.body.email).toStrictEqual('popcn940620@gmail.com');
      expect(response.body.name).toStrictEqual('김라임임');
      expect(response.body.profileImg).toContain('s3.ap-northeast-2');
    });

    it('users/:userId failed by wrong userId', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .field('email', 'popcn940621@gmail.com')
        .field('name', '김라임재재')
        .field('password', '1222333');
      const login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'popcn940620@gmail.com',
          password: '1222333',
        });
      const response = await request(app.getHttpServer())
        .put('/users/2')
        .query({ userId: 1 })
        .field('name', '김라임임')
        .set('Cookie', login.headers['set-cookie']);

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('수정할 권한이 없습니다.');
      expect(response.body.error).toBe('Unauthorized');
    });
    it('users/:userId failed by same nickname', async () => {
      const login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'popcn940620@gmail.com',
          password: '1222333',
        });
      console.log(login.headers);
      const response = await request(app.getHttpServer())
        .put('/users/1')
        .query({ userId: 1 })
        .field('name', '김라임재')
        .set('Cookie', login.headers['set-cookie']);
      console.log(response.statusCode);

      expect(response.statusCode).toBe(409);
      expect(response.body.message).toBe(
        '동일한 닉네임으로 변경할 수 없습니다.',
      );
      expect(response.body.error).toBe('Conflict');
    });
  });

  describe('users/:userId', () => {
    it('users/:userId delete Method Success', async () => {
      const login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'popcn940620@gmail.com',
          password: '1222333',
        });
      const response = await request(app.getHttpServer())
        .delete('/users/1')
        .query({ userId: 1 })
        .set('Cookie', login.headers['set-cookie']);
      console.log(response.body.text);

      expect(response.statusCode).toBe(200);
      expect(response.text).toContain(`1번 유저가 성공적으로 삭제되었습니다.`);
    });
  });
});
