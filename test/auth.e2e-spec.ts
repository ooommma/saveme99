import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../src/auth/auth.module';
import cookieParser from 'cookie-parser';
import { number } from 'joi';

describe('authController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
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
  });
  describe('auth/register', () => {
    it('auth/register Success with file', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .field('email', 'popcn940620@gmail.com')
        .field('name', '김라임재')
        .field('password', '1222333')
        .attach('file', 'test/test-resource/test.PNG');
      expect(response.statusCode).toBe(201);
      expect(response.body.email).toStrictEqual('popcn940620@gmail.com');
      expect(response.body.name).toStrictEqual('김라임재');
      expect(response.body.profileImg).toContain('s3.ap-northeast-2');
      expect(response.body.email).toStrictEqual('popcn940620@gmail.com');
    });
    it('auth/register Success without file', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .field('email', 'popcn940620@gmail.com')
        .field('name', '김라임재')
        .field('password', '1222333');
      expect(response.statusCode).toBe(201);
      expect(response.body.email).toStrictEqual('popcn940620@gmail.com');
      expect(response.body.name).toStrictEqual('김라임재');
      expect(response.body.profileImg).toContain(
        process.env.DEFAULT_PROFILE_IMG,
      );
      expect(response.body.email).toStrictEqual('popcn940620@gmail.com');
    });
    it('auth/register failed by ConflictExecption', async () => {
      const creatUserDto = {
        email: 'popcn940620@gmail.com',
        name: '김라임재',
        password: '1222333',
      };
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(creatUserDto);
      const duplicateUser = await request(app.getHttpServer())
        .post('/auth/register')
        .send(creatUserDto);
      expect(duplicateUser.statusCode).toBe(409);
      expect(duplicateUser.body.message).toBe('이미 회원가입한 이메일입니다.');
      expect(duplicateUser.body.error).toBe('Conflict');
    });
  });

  describe('auth/login', () => {
    beforeEach(async () => {
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'popcn940620@gmail.com',
        name: '김라임재',
        password: '1222333',
      });
    });
    it('auth/login Success', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'popcn940620@gmail.com',
          password: '1222333',
        });
      expect(response.statusCode).toBe(200);
      const cookies = response.headers['set-cookie'];
      const cookiesArray = Array.isArray(cookies) ? cookies : [cookies];
      expect(cookiesArray).toBeDefined();
      expect(
        cookiesArray.some((cookie: string) =>
          cookie.startsWith('authorization=Bearer'),
        ),
      );
      expect(
        cookiesArray.some((cookie: string) =>
          cookie.startsWith('refreshToken=Bearer'),
        ),
      );
    });
    it('auth/login failed by NotFoundExecption', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'popcn940621@gmail.com',
          password: '1222333',
        });
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe(
        'popcn940621@gmail.com에 해당하는 유저를 찾을 수 없습니다.',
      );
      expect(response.body.error).toBe('Not Found');
    });
    it('auth/login failed by UnauthorizedException', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'popcn940620@gmail.com',
          password: '1222323',
        });
      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('비밀번호를 다시 확인해주세요.');
      expect(response.body.error).toBe('Unauthorized');
    });

    describe('/auth/profile', () => {
      it('/auth/profile success', async () => {
        await request(app.getHttpServer()).post('/auth/register').send({
          email: 'popcn940620@gmail.com',
          name: '김라임재',
          password: '1222333',
        });
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'popcn940620@gmail.com',
            password: '1222333',
          });

        const response2 = await request(app.getHttpServer())
          .get('/auth/profile')
          .set('Cookie', response.headers['set-cookie']);

        expect(response2.body.name).toBe('김라임재');
        expect(response2.body.email).toBe('popcn940620@gmail.com');
        expect(response2.body.profileImg).toBe(process.env.DEFAULT_PROFILE_IMG);
      });
    });
    afterAll(async () => {
      await app.close();
    });
  });
});
