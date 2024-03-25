import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../../user/dto/create-user.dto';

export class UserLoginDto extends PickType(CreateUserDto, [
  'email',
  'password',
]) {}
