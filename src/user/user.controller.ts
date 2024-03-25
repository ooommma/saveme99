import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
  UseInterceptors,
  HttpCode,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { Users } from './entities/users.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
@ApiTags('유저 정보 수정/삭제')
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '수정할 데이터',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: '내 정보 수정' })
  @HttpCode(200)
  @Put('/:userId')
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: Users,
    @Param('userId') userId: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Users> {
    return await this.userService.updateUser(updateUserDto, user, userId, file);
  }

  @ApiParam({
    name: 'userId',
    type: 'number',
    description: '사용자 ID',
  })
  @ApiOperation({ summary: '회원탈퇴' })
  @Delete('/:userId')
  async deleteUser(
    @Param('userId') userId: number,
    @GetUser() user: Users,
  ): Promise<string> {
    return await this.userService.deleteUser(userId, user);
  }
}
