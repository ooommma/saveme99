import { IsString } from 'class-validator';
import { Boards } from 'src/boards/entities/board.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ type: 'varchar', nullable: false, unique: true })
  @IsString()
  email: string;

  @Column({ type: 'varchar', nullable: false, select: false })
  @IsString()
  password: string;

  @Column({ type: 'varchar', nullable: true })
  @IsString()
  profileImg?: string;

  @Column({ type: 'varchar', nullable: false })
  @IsString()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Boards, (board) => board.user)
  board: Boards[];

  @ManyToMany(() => Boards, (board) => board.invitedUsers)
  invitedBoards: Boards[];
}
