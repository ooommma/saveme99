import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { UtilsService } from 'src/utils/utils.service';
import { AwsService } from 'src/aws/aws.service';
import { Repository } from 'typeorm';
import { Users } from 'src/user/entities/users.entity';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { Readable } from 'stream';
import { UserDto } from 'src/user/dto/user-dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserLoginDto } from './dto/log-in-dto';
import { hash } from 'bcrypt';
import exp from 'constants';

const mockUserRepository = {
  findOneBy: jest.fn(),
  save: jest.fn(),
};

const mockUserService = {
  findUserByEmailWithPassword: jest.fn(),
};

const mockUtilsService = {
  getUUID: jest.fn(),
};

const mockAwsService = {
  imageUploadToS3: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

const createUserDto: CreateUserDto = {
  email: 'popocon940620@gmail.com',
  name: '김라임',
  password: '123456',
  profileImg: 'profile img path',
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

const mockSavedUser: UserDto = {
  userId: 1,
  email: 'popocon940620@gmail.com',
  profileImg: 'profile img path',
};

const userLoginDto: UserLoginDto = {
  email: 'popcon0000@xxx.com',
  password: '123456',
};
describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let utilsService: UtilsService;
  let awsService: AwsService;
  let jwtService: JwtService;
  let userRepository: Partial<Repository<Users>>;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: UtilsService,
          useValue: mockUtilsService,
        },
        {
          provide: AwsService,
          useValue: mockAwsService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(Users),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    utilsService = module.get<UtilsService>(UtilsService);
    awsService = module.get<AwsService>(AwsService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(userService).toBeDefined();
    expect(utilsService).toBeDefined();
    expect(awsService).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('createUser', () => {
    //dto는 컨트롤러의 영역이기 때문에 따로 테스트 안해도됨
    it('success createUser method', async () => {
      authService.saveImage = jest.fn().mockResolvedValue('im string');
      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue(mockSavedUser);
      const result = await authService.createUser(createUserDto, mockFile);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: createUserDto.email });
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        userId: mockSavedUser.userId,
        email: mockSavedUser.email,
        profileImg: mockSavedUser.profileImg,
      });
    });
    it('success createUser method without file', async () => {
      authService.saveImage = jest.fn().mockResolvedValue('im string');
      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue(mockSavedUser);
      const result = await authService.createUser(createUserDto, undefined);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: createUserDto.email });
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        userId: mockSavedUser.userId,
        email: mockSavedUser.email,
        profileImg: mockSavedUser.profileImg,
      });
    });
    it('createUser method should be already Exist User ', async () => {
      mockUserRepository.findOneBy.mockResolvedValue('exist user');
      try {
        await authService.createUser(createUserDto, mockFile);
      } catch (err) {
        expect(err).toBeInstanceOf(ConflictException);
        expect(err.message).toEqual('이미 회원가입한 이메일입니다.');
      }

      expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: createUserDto.email });
    });
  });
  describe('logIn Method', () => {
    it('success login method', async () => {
      const hashedPassword = await hash(userLoginDto.password, 10);
      const mockFindUser = {
        userId: 1,
        email: 'popcon940620@gmail.com',
        password: hashedPassword,
      };
      const mockResultVal = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };
      const mockPayload = {
        userId: 1,
      };
      const signOptions = { expiresIn: 1000 * 60 * 60 };
      mockUserService.findUserByEmailWithPassword.mockResolvedValue(mockFindUser);
      const result = await authService.logIn(userLoginDto, null);
      expect(mockUserService.findUserByEmailWithPassword).toHaveBeenCalledTimes(1);
      expect(mockUserService.findUserByEmailWithPassword).toHaveBeenCalledWith(userLoginDto.email);
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(mockJwtService.sign).toHaveBeenLastCalledWith(
        { userId: mockFindUser.userId },
        { expiresIn: 1000 * 60 * 60 * 24 * 7 },
      );
    });

    it('success login method', async () => {
      const mockFindUser = {
        userId: 1,
        email: 'popcon940620@gmail.com',
        password: 'did not match password',
      };
      mockUserService.findUserByEmailWithPassword.mockResolvedValue(mockFindUser);
      try {
        await authService.logIn(userLoginDto, null);
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException);
        expect(err.message).toEqual('비밀번호를 다시 확인해주세요.');
      }
      expect(mockUserService.findUserByEmailWithPassword).toHaveBeenCalledTimes(1);
      expect(mockUserService.findUserByEmailWithPassword).toHaveBeenCalledWith(userLoginDto.email);
      expect(mockJwtService.sign).toHaveBeenCalledTimes(0);
    });
  });
  describe('saveImage method', () => {
    it('success saveImage method', async () => {
      const mockUrl = {
        imageUrl: 'imageUrl',
      };
      authService.imageUpload = jest.fn().mockReturnValue(mockUrl);
      const result = await authService.saveImage(mockFile);
      expect(authService.imageUpload).toHaveBeenCalledWith(mockFile);
      expect(authService.imageUpload).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUrl);
    });
  });
  describe('imageUpload method', () => {
    it('success imageUpload method', async () => {
      mockUtilsService.getUUID.mockReturnValue('uuid string');
      mockAwsService.imageUploadToS3.mockResolvedValue('imageUrl');
      const result = await authService.imageUpload(mockFile);
      const mockUrl = {
        imageUrl: 'imageUrl',
      };
      expect(mockUtilsService.getUUID).toHaveBeenCalledTimes(1);
      expect(mockAwsService.imageUploadToS3).toHaveBeenCalledTimes(1);
      expect(mockAwsService.imageUploadToS3).toHaveBeenCalledWith(`uuid string.txt`, mockFile, 'txt');
    });
  });
});
