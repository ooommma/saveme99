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
import { Comments } from '../../comment/entities/comment.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: false, select: false })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  profileImg?: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Boards, (board) => board.user)
  board: Boards[];

  @OneToMany(() => Comments, (comment) => comment.user)
  comments: Comments[];

  @ManyToMany(() => Boards, (board) => board.invitedUsers)
  invitedBoards: Boards[];
}
