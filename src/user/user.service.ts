import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { Users } from './entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) {}
  async updateUser(updateUserDto: UpdateUserDto, user: Users, userId: number): Promise<Users> {
    const findUser = await this.findUserById(userId);
    if (findUser.userId !== user.userId) {
      throw new UnauthorizedException('수정할 권한이 없습니다.');
    }
    //Dto에 명시된 값 중 undefined인 값을 필터링
    const filteredDto = Object.entries(updateUserDto).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});
    //기존에 찾아온 user데이터에 필터링된 값만 덮어씌움
    const updateData = { ...findUser, ...filteredDto };
    try {
      const updatedUser = await this.userRepository.save(updateData);
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
