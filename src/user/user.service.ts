import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { Users } from './entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}
  async updateUser(
    updateUserDto: UpdateUserDto,
    user: Users,
    userId: number,
    file: Express.Multer.File,
  ): Promise<Users> {
    const findUser: Users = await this.findUserById(userId);
    const { name, profileImg } = findUser;

    if (findUser.userId !== user.userId) {
      throw new UnauthorizedException('수정할 권한이 없습니다.');
    }
    if (name === updateUserDto.name) {
      throw new ConflictException('동일한 닉네임으로 변경할 수 없습니다.');
    }
    //Dto에 명시된 값 중 undefined인 값을 필터링
    const filteredDto = Object.entries(updateUserDto).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});
    //파일을 첨부하지 않았을 경우의 기존 이미지
    let imageUrl = profileImg;

    if (file) {
      const uploadedImageUrl = await this.authService.saveImage(file);
      imageUrl = uploadedImageUrl.imageUrl;
    }
    const updatedData = { ...findUser, ...filteredDto, profileImg: imageUrl };

    try {
      const updatedUser = await this.userRepository.save(updatedData);
      return updatedUser;
    } catch {
      throw new InternalServerErrorException('사용자 정보 수정에 실패했습니다.');
    }
  }

  async deleteUser(userId: number, user: Users): Promise<string> {
    const findUser = await this.findUserById(userId);
    if (findUser.userId !== user.userId) {
      throw new UnauthorizedException('회원탈퇴할 권한이 없습니다.');
    }

    const result = await this.userRepository.delete({ userId });
    if (result.affected === 0) {
      throw new NotFoundException(`${userId}번 유저가 존재하지 않아 삭제에 실패했습니다.`);
    }
    return `${userId}번 유저가 성공적으로 삭제되었습니다.`;
  }

  async findUserByEmail(email: string): Promise<Users> {
    console.log(email);
    const user = await this.userRepository.findOneBy({ email });
    if (!user) throw new NotFoundException(`${email}에 해당하는 유저를 찾을 수 없습니다.`);
    return user;
  }

  async findUserById(userId: number): Promise<Users> {
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) throw new NotFoundException(`아이디가 ${userId}인 유저를 찾을 수 없습니다.`);
    return user;
  }

  async findUserByIdWithPassword(userId: number): Promise<Users> {
    const user = await this.userRepository.findOne({
      where: { userId },
      select: ['email', 'password', 'userId', 'createdAt', 'profileImg', 'updatedAt'],
    });
    if (!user) throw new NotFoundException(`아이디가 ${userId}인 유저를 찾을 수 없습니다.`);
    return user;
  }

  async findUserByEmailWithPassword(email: string): Promise<Users> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['email', 'password', 'userId'],
    });
    if (!user) throw new NotFoundException(`${email}에 해당하는 유저를 찾을 수 없습니다.`);
    return user;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
