import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { Users } from './entities/users.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @UseGuards(AuthGuard('jwt'))
  @Put('/:userId')
  async updateUser(@Body() updateUserDto: UpdateUserDto, @GetUser() user: Users, @Param('userId') userId: number) {
    return await this.userService.updateUser(updateUserDto, user, userId);
  }
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:userId')
  async deleteUser(@Param('userId') userId: number, @GetUser() user: Users): Promise<string> {
    return await this.userService.deleteUser(userId, user);
  }
}
