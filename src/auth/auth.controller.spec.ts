import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { after } from 'node:test';
import { Readable } from 'stream';
import { Response } from 'express';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Users } from 'src/user/entities/users.entity';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { validate } from 'class-validator';
import { error } from 'console';
import { UserLoginDto } from './dto/log-in-dto';

const mockAuthService = {
  createUser: jest.fn(),
  logIn: jest.fn(),
};

const mockResponse = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  return res as Response;
};

interface IUser {
  email: string;
  password: string;
  name: string;
}

const createUserDto: IUser = {
  email: 'popcon940620@gmail.com',
  password: '123456',
  name: '김라임',
};

const mockFile: Express.Multer.File = {
  fieldname: 'file',
  originalname: 'testfile.txt',
  encoding: '7bit',
  mimetype: 'text/plain',
  size: 128,
  destination: './upload',
  filename: 'testfile.txt',
  path: './upload/testfile.txt',
  buffer: Buffer.from('Hello World'),
  stream: Readable.from(Buffer.from('Hello World')),
};
const mockUser: Users = {
  userId: 1,
  email: 'popcon940620@gmail.com',
  password: '42412412',
  name: '김라임',
  profileImg: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

let canActivateVal = true;

const mockAuthGuard = { canActivate: jest.fn(() => canActivateVal) };

describe('AuthController with AuthGuard true', () => {
  let authController: AuthController;
  let authService: AuthService;
  let res: Partial<Response>;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    res = mockResponse();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideProvider(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
    expect(authService).toBeDefined();
  });

  describe('createUser Method', () => {
    it('success createUser', async () => {
      const mockUser = 'im User';

      mockAuthService.createUser.mockResolvedValue(mockUser);

      const user = await authController.signUp(createUserDto, mockFile);

      expect(mockAuthService.createUser).toHaveBeenCalledWith(createUserDto, mockFile);
      expect(mockAuthService.createUser).toHaveBeenCalledTimes(1);
      expect(user).toEqual(mockUser);
    });
    it('signUp should be failed by validate', async () => {
      const dto = new CreateUserDto();
      dto.name = '김';
      dto.email = 'popcon940620';
      dto.password = '123';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toMatchSnapshot();
    });
  });

  describe('login Method', () => {
    it('success Login', async () => {
      const res = mockResponse();

      const mockTokens = {
        accessToken: 'im access token',
        refreshToken: 'im refresh token',
      };
      const mockBearerRefreshToken = 'Bearer im refresh token';
      const mockUserLoginDto = {
        email: 'popcon940620@gmail.com',
        password: '123456',
      };

      mockAuthService.logIn.mockResolvedValue(mockTokens);

      await authController.logIn(mockUserLoginDto, res);

      expect(mockAuthService.logIn).toHaveBeenCalledTimes(1);
      expect(mockAuthService.logIn).toHaveBeenCalledWith(mockUserLoginDto, res);
      expect(res.cookie).toHaveBeenCalledTimes(2);
      expect(res.cookie).toHaveBeenLastCalledWith('refreshToken', mockBearerRefreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: true,
      });
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({ message: '로그인 성공' });
    });
    it('login method should be throw Unauthorization Exception', async () => {
      const res = mockResponse();

      const mockTokens = {
        accessToken: 'im access token',
      };

      const mockUserLoginDto = {
        email: 'popcon940620@gmail.com',
        password: '123456',
      };
      mockAuthService.logIn.mockResolvedValue(mockTokens);

      await expect(authController.logIn(mockUserLoginDto, res)).rejects.toThrow(UnauthorizedException);

      expect(mockAuthService.logIn).toHaveBeenCalledTimes(1);
      expect(mockAuthService.logIn).toHaveBeenCalledWith(mockUserLoginDto, res);
    });
    it('UserLoginDto should be failed by validate', async () => {
      const dto = new UserLoginDto();
      dto.email = 'popcon940620';
      dto.password = '123';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toMatchSnapshot();
    });
  });

  describe('profile method', () => {
    it('success profile method', async () => {
      expect(authController.getProfile(mockUser)).toEqual(mockUser);
    });
  });
});
