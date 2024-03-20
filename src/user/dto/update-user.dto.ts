import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ImageUploadDto } from 'src/aws/dto/image-upload.dto';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto extends PickType(CreateUserDto, ['name']) {}
