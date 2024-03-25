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
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { object } from 'joi';

@ApiTags('유저 정보')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '회원 가입',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },

        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: '회원 가입과 프로필 이미지 선택적 업로드' })
  @HttpCode(201)
  @Post('/register')
  async signUp(
    @Body() createAuthDto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.authService.createUser(createAuthDto, file);
  }

  @ApiBody({
    description: '로그인',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  @ApiOperation({ summary: '로그인' })
  @Post('/login')
  async logIn(@Body() userLoginDto: UserLoginDto, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.logIn(
      userLoginDto,
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
  /**
   * 내 정보 조회
   * @returns
   */
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@GetUser() user: Users) {
    return user;
  }
}
