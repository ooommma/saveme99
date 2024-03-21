import { User } from 'src/auth/entities/auth.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Boards {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;
  /**
   * 보드 이름
   * @example "TODO"
   */
  @Column({ type: 'varchar', nullable: false })
  name: string;

  /**
   * 보드 색상
   * @example "blue"
   */
  @Column({ type: 'varchar' })
  color: string;

  /**
   * 보드 설명
   * @example "해야할 일"
   */
  @Column({ type: 'varchar' })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => User, (user) => user.board)
  user: User;

  @ManyToMany(() => User, (user) => user.invitedBoards)
  @JoinTable()
  invitedUsers: User[];
}
