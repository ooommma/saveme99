import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(15)
  @MinLength(4)
  password: string;

  profileImg?: string;

  @IsString()
  @MaxLength(10)
  @MinLength(2)
  name: string;
}
