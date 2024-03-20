import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/auth.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-auth.dto';
import { hash, compare } from 'bcrypt';
import { UserLoginDto } from './dto/log-in-dto';
import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}
  async createUser(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;
    const user = await this.userRepository.findOneBy({ email });
    if (user) {
      throw new ConflictException('이미 회원가입한 이메일입니다.');
    }
    const hashedPassword = await hash(password, 10);
    const userDao = await this.userRepository.save({
      ...createUserDto,
      password: hashedPassword,
    });
    return userDao;
  }

  async logIn(userLoginDto: UserLoginDto, res: Response) {
    const { email, password } = userLoginDto;
    const user = await this.findUserByEmailWithPassword(email);
    //유저가 있다면 비밀번호 검증
    console.log(user);
    if (!compare(password, user.password)) {
      throw new UnauthorizedException('비밀번호를 다시 확인해주세요.');
    }
    const payload: object = { userId: user.userId };
    console.log(payload);
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: 1000 * 60 * 60,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: 1000 * 60 * 60 * 24 * 7,
    });
    return { accessToken, refreshToken };
  }

  findAll() {
    return `This action returns all auth`;
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user)
      throw new NotFoundException(
        `${email}에 해당하는 유저를 찾을 수 없습니다.`,
      );
    return user;
  }

  async findUserByEmailWithPassword(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['email', 'password', 'userId'],
    });
    if (!user)
      throw new NotFoundException(
        `${email}에 해당하는 유저를 찾을 수 없습니다.`,
      );
    return user;
  }

  update(id: number, updateAuthDto: UpdateUserDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}