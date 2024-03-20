import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
  HttpCode,
  UploadedFile,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserLoginDto } from './dto/log-in-dto';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorator/get-user.decorator';
import { Users } from '../user/entities/users.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(201)
  @Post('/register')
  async signUp(@Body() createAuthDto: CreateUserDto, @UploadedFile() file: Express.Multer.File) {
    return await this.authService.createUser(createAuthDto, file);
  }

  @Post('/login')
  async logIn(@Body() UserLoginDto: UserLoginDto, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.logIn(
      UserLoginDto,
      res,
    );
    if (!accessToken || !refreshToken) {
      throw new UnauthorizedException();
    }
    const BearerAccessToken = `Bearer ${accessToken}`;
    const BearerRefreshToken = `Bearer ${refreshToken}`;
    res.cookie('authorization', BearerAccessToken, {
      maxAge: 1000 * 60 * 60,
      httpOnly: true,
      sameSite: true,
    });
    res.cookie('refreshToken', BearerRefreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: true,
    });
    res.status(200).json({ message: '로그인 성공' });
  }
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@GetUser() user: Users) {
    return user;
  }
}
