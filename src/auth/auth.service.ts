import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../user/entities/users.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { hash, compare } from 'bcrypt';
import { UserLoginDto } from './dto/log-in-dto';
import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { AwsService } from 'src/aws/aws.service';
import { UtilsService } from 'src/utils/utils.service';
import { UserDto } from 'src/user/dto/user-dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    private jwtService: JwtService,
    private userService: UserService,
    private awsService: AwsService,
    private utilsService: UtilsService,
  ) {}
  async createUser(createUserDto: CreateUserDto, file: Express.Multer.File) {
    const { email, password } = createUserDto;
    const user = await this.userRepository.findOneBy({ email });
    if (user) {
      throw new ConflictException('이미 회원가입한 이메일입니다.');
    }
    const hashedPassword = await hash(password, 10);
    //파일이 있을경우 s3에 저장하고 url 반환, 아니라면 기본 이미지 사용
    let imageUrl: string;
    if (!file) {
      imageUrl = process.env.DEFAULT_PROFILE_IMG;
    } else {
      const uploadedImage = await this.saveImage(file);
      imageUrl = uploadedImage.imageUrl;
    }
    const createdUser = await this.userRepository.save({
      ...createUserDto,
      password: hashedPassword,
      profileImg: imageUrl,
    });
    return new UserDto(createdUser);
  }

  async logIn(userLoginDto: UserLoginDto, res: Response) {
    const { email, password } = userLoginDto;
    const user = await this.userService.findUserByEmailWithPassword(email);
    if (!(await compare(password, user.password))) {
      throw new UnauthorizedException('비밀번호를 다시 확인해주세요.');
    }
    const payload: object = { userId: user.userId };
    const accessToken = this.jwtService.sign(payload, { expiresIn: 1000 * 60 * 60 });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: 1000 * 60 * 60 * 24 * 7 });
    return { accessToken, refreshToken };
  }

  async saveImage(file: Express.Multer.File) {
    return await this.imageUpload(file);
  }

  async imageUpload(file: Express.Multer.File) {
    const imageName = this.utilsService.getUUID();
    const ext = file.originalname.split('.').pop();

    const imageUrl = await this.awsService.imageUploadToS3(`${imageName}.${ext}`, file, ext);
    return { imageUrl };
  }
}
