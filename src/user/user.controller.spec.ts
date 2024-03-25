import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Readable } from 'stream';
import { Users } from './entities/users.entity';
import { validate } from 'class-validator';

const mockUserService = {
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
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
  comments: [],
};

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
    expect(userService).toBeDefined();
  });

  describe('updateUser Method', () => {
    it('success updateUser', async () => {
      const updateUserReturnVal = 'im updated user';

      mockUserService.updateUser.mockResolvedValue(updateUserReturnVal);

      const user = await userController.updateUser(
        updateUserDto,
        mockUser,
        1,
        mockFile,
      );

      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        updateUserDto,
        mockUser,
        1,
        mockFile,
      );
      expect(mockUserService.updateUser).toHaveBeenCalledTimes(1);
      expect(user).toEqual(updateUserReturnVal);
    });
    it('updateUser should be failed by validate', async () => {
      const dto = new UpdateUserDto();
      dto.name = '김';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toMatchSnapshot();
    });
  });

  describe('deleteUser Method', () => {
    it('success deleteUser', async () => {
      const deleteMethodReturnVal = 'delete success';

      mockUserService.deleteUser.mockResolvedValue(deleteMethodReturnVal);

      const user = await userController.deleteUser(1, mockUser);

      expect(mockUserService.deleteUser).toHaveBeenCalledWith(1, mockUser);
      expect(mockUserService.deleteUser).toHaveBeenCalledTimes(1);
      expect(user).toEqual(deleteMethodReturnVal);
    });
  });
});
