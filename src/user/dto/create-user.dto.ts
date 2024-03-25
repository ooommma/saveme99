import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MaxLength(15)
  @MinLength(4)
  @IsNotEmpty()
  password: string;

  profileImg?: string;

  @IsString()
  @MaxLength(10)
  @MinLength(2)
  @IsNotEmpty()
  name: string;
}
