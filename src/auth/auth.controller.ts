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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserLoginDto } from './dto/log-in-dto';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorator/get-user.decorator';
import { User } from './entities/auth.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async signUp(@Body() createAuthDto: CreateUserDto) {
    return await this.authService.createUser(createAuthDto);
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

  @Get()
  findAll() {
    return this.authService.findAll();
  }
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  findOne(@GetUser() user: User) {
    return user;
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}