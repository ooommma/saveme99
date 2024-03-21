import { Users } from '../entities/users.entity';

export class UserDto {
  userId: number;
  email: string;
  profileImg: string;

  constructor(user: Users) {
    this.userId = user.userId;
    this.email = user.email;
    this.profileImg = user.profileImg;
  }
}
