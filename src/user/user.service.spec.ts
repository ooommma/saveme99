import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Readable } from 'stream';
import { Users } from './entities/users.entity';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import exp from 'constants';

const mockUserRepository = {
  findOneBy: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  findOne: jest.fn(),
};

const mockAuthService = {
  saveImage: jest.fn(),
};

const updateUserDto: UpdateUserDto = {
  name: '김라임아님',
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
  board: [],
  invitedBoards: [],
};

const mockUserWithoutPassword = {
  userId: 1,
  email: 'popcon940620@gmail.com',
  password: '42412412',
  name: '김라임',
  profileImg: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const updatedUser = {
  profileImg: null,
  userId: 1,
  email: 'email@email.com',
  password: '123435',
  name: '김라임아님',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UserService', () => {
  let authService: AuthService;
  let userService: UserService;
  let userRepository: Partial<Repository<Users>>;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: getRepositoryToken(Users),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
    expect(authService).toBeDefined();
  });

  describe('updateUser', () => {
    //dto는 컨트롤러의 영역이기 때문에 따로 테스트 안해도됨
    it('success updateUser method', async () => {
      userService.findUserById = jest.fn().mockResolvedValue(mockUser);
      mockAuthService.saveImage = jest.fn().mockResolvedValue({
        imageUrl: 's3 img path',
      });
      mockUserRepository.save.mockResolvedValue({
        ...updatedUser,
        ...updateUserDto,
        profileImg: 's3 img path',
      });
      const result = await userService.updateUser(
        updateUserDto,
        mockUser,
        mockUser.userId,
        mockFile,
      );
      expect(userService.findUserById).toHaveBeenCalledTimes(1);
      expect(userService.findUserById).toHaveBeenCalledWith(mockUser.userId);
      expect(mockAuthService.saveImage).toHaveBeenCalledWith(mockFile);
      expect(mockAuthService.saveImage).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        ...updatedUser,
        ...updateUserDto,
        profileImg: 's3 img path',
      });
    });
    it('success updateUser method without file', async () => {
      userService.findUserById = jest.fn().mockResolvedValue(mockUser);

      mockUserRepository.save.mockResolvedValue({
        ...updatedUser,
        ...updateUserDto,
        profileImg: updatedUser.profileImg,
      });
      const result = await userService.updateUser(
        updateUserDto,
        mockUser,
        mockUser.userId,
        null,
      );
      expect(userService.findUserById).toHaveBeenCalledTimes(1);
      expect(userService.findUserById).toHaveBeenCalledWith(mockUser.userId);
      expect(mockAuthService.saveImage).toHaveBeenCalledTimes(0);
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        ...updatedUser,
        ...updateUserDto,
        profileImg: updatedUser.profileImg,
      });
    });
    it('updateUser method should be throw error Unauthorized Exception', async () => {
      expect.assertions(5);
      const updatedUser = {
        profileImg: null,
        userId: 3,
        email: 'email@email.com',
        password: '123435',
        name: '김라임아님',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      userService.findUserById = jest.fn().mockResolvedValue(updatedUser);
      try {
        await userService.updateUser(
          updateUserDto,
          mockUser,
          mockUser.userId,
          null,
        );
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException);
        expect(err.message).toEqual('수정할 권한이 없습니다.');
        expect(userService.findUserById).toHaveBeenCalledTimes(1);
        expect(mockAuthService.saveImage).toHaveBeenCalledTimes(0);
        expect(mockUserRepository.save).toHaveBeenCalledTimes(0);
      }
    });

    it('updateUser method should be throw error ConflictException Exception', async () => {
      expect.assertions(5);
      const updatedUser = {
        profileImg: null,
        userId: 1,
        email: 'email@email.com',
        password: '123435',
        name: '김라임아님',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const dto = {
        name: '김라임아님',
      };
      userService.findUserById = jest.fn().mockResolvedValue(updatedUser);
      try {
        await userService.updateUser(dto, mockUser, mockUser.userId, null);
      } catch (err) {
        expect(err).toBeInstanceOf(ConflictException);
        expect(err.message).toEqual('동일한 닉네임으로 변경할 수 없습니다.');
      }
      expect(userService.findUserById).toHaveBeenCalledTimes(1);
      expect(mockAuthService.saveImage).toHaveBeenCalledTimes(0);
      expect(mockUserRepository.save).toHaveBeenCalledTimes(0);
    });
    it(' updateUser method should throw InternalServerErrorException  ', async () => {
      expect.assertions(6);
      userService.findUserById = jest.fn().mockResolvedValue(mockUser);

      mockUserRepository.save.mockRejectedValue(new Error('database Error'));
      try {
        const result = await userService.updateUser(
          updateUserDto,
          mockUser,
          mockUser.userId,
          null,
        );
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
        expect(err.message).toEqual('사용자 정보 수정에 실패했습니다.');
      }
      expect(userService.findUserById).toHaveBeenCalledTimes(1);
      expect(userService.findUserById).toHaveBeenCalledWith(mockUser.userId);
      expect(mockAuthService.saveImage).toHaveBeenCalledTimes(0);
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    });
  });
  describe('deleteUser', () => {
    it('success deleteUser method', async () => {
      expect.assertions(5);
      const mockFindUserVal = {
        userId: 1,
      };
      userService.findUserById = jest.fn().mockResolvedValue(mockFindUserVal);
      mockUserRepository.delete.mockResolvedValue({ affected: 1 });
      const user = await userService.deleteUser(1, mockUser);
      expect(mockUserRepository.delete).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.delete).toHaveBeenCalledWith({ userId: 1 });
      expect(userService.findUserById).toHaveBeenCalledWith(1);
      expect(userService.findUserById).toHaveBeenCalledTimes(1);
      expect(user).toEqual(`1번 유저가 성공적으로 삭제되었습니다.`);
    });

    it('deleteUser method should throw UnauthorizedException', async () => {
      expect.assertions(5);
      const mockFindUserVal = {
        userId: 3,
      };
      userService.findUserById = jest.fn().mockResolvedValue(mockFindUserVal);
      mockUserRepository.delete.mockResolvedValue({ affected: 1 });
      try {
        await userService.deleteUser(3, mockUser);
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException);
        expect(err.message).toEqual('회원탈퇴할 권한이 없습니다.');
      }
      expect(userService.findUserById).toHaveBeenCalledWith(3);
      expect(userService.findUserById).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.delete).toHaveBeenCalledTimes(0);
    });

    it('deleteUser method should throw NotFoundException', async () => {
      expect.assertions(6);
      const mockFindUserVal = {
        userId: 1,
      };
      userService.findUserById = jest.fn().mockResolvedValue(mockFindUserVal);
      mockUserRepository.delete.mockResolvedValue({ affected: 0 });
      try {
        await userService.deleteUser(1, mockUser);
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message).toEqual(
          `1번 유저가 존재하지 않아 삭제에 실패했습니다.`,
        );
      }
      expect(mockUserRepository.delete).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.delete).toHaveBeenCalledWith({ userId: 1 });
      expect(userService.findUserById).toHaveBeenCalledWith(1);
      expect(userService.findUserById).toHaveBeenCalledTimes(1);
    });
  });
  describe('findUserByEmail', () => {
    it('success findUserByEmail', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUserWithoutPassword);
      const result = await userService.findUserByEmail(mockUser.email);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: mockUser.email,
      });
      expect(result).toEqual(mockUserWithoutPassword);
    });

    it('findUserByEmail should throw NotFoundException', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      try {
        await userService.findUserByEmail(mockUser.email);
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message).toEqual(
          `${mockUser.email}에 해당하는 유저를 찾을 수 없습니다.`,
        );
      }

      expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: mockUser.email,
      });
    });
  });
  describe('findUserById', () => {
    it('success findUserById', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUserWithoutPassword);
      const result = await userService.findUserById(mockUser.userId);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        userId: mockUser.userId,
      });
      expect(result).toEqual(mockUserWithoutPassword);
    });

    it('findUserById should throw NotFoundException', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      try {
        await userService.findUserById(mockUser.userId);
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message).toEqual(
          `아이디가 ${mockUser.userId}인 유저를 찾을 수 없습니다.`,
        );
      }

      expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        userId: mockUser.userId,
      });
    });
  });
  describe('findUserByIdWithPassword', () => {
    it('success findUserByIdWithPassword', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const result = await userService.findUserByIdWithPassword(
        mockUser.userId,
      );

      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { userId: mockUser.userId },
        select: [
          'email',
          'password',
          'userId',
          'createdAt',
          'profileImg',
          'updatedAt',
        ],
      });
      expect(result).toEqual(mockUser);
    });

    it('findUserByIdWithPassword should throw NotFoundException', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      try {
        await userService.findUserByIdWithPassword(mockUser.userId);
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message).toEqual(
          `아이디가 ${mockUser.userId}인 유저를 찾을 수 없습니다.`,
        );
      }

      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { userId: mockUser.userId },
        select: [
          'email',
          'password',
          'userId',
          'createdAt',
          'profileImg',
          'updatedAt',
        ],
      });
    });
  });
  describe('findUserByEmailWithPassword', () => {
    it('success findUserByEmailWithPassword', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const result = await userService.findUserByEmailWithPassword(
        mockUser.email,
      );

      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockUser.email },
        select: ['email', 'password', 'userId'],
      });
      expect(result).toEqual(mockUser);
    });

    it('findUserByEmailWithPassword should throw NotFoundException', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      try {
        await userService.findUserByEmailWithPassword(mockUser.email);
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message).toEqual(
          `${mockUser.email}에 해당하는 유저를 찾을 수 없습니다.`,
        );
      }

      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockUser.email },
        select: ['email', 'password', 'userId'],
      });
    });
  });
});
