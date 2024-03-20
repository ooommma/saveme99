import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { after } from 'node:test';
import { Readable } from 'stream';

const mockAuthService = {
  createUser: jest.fn(),
  logIn: jest.fn(),
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

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

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
  });
});
