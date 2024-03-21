import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UserLoginDto extends PickType(CreateUserDto, ['email', 'password']) {}
