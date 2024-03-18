import { IsNotEmpty, IsString } from 'class-validator';
import { Columns } from 'src/columns/entities/column.entity';
//import { Users } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Boards {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 보드 이름
   * @example "TODO"
   */
  @IsNotEmpty({ message: '보드이름을 입력해 주세요' })
  @IsString()
  @Column()
  name: string;

  /**
   * 보드 이름
   * @example "blue"
   */
  @IsNotEmpty({ message: '보드색상을  입력해 주세요' })
  @IsString()
  @Column()
  color: string;

  /**
   * 보드 설명
   * @example "해야할 일"
   */
  @IsNotEmpty({ message: '보드설명을 입력해 주세요' })
  @IsString()
  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // @ManyToOne(() => Users, (user) => user.board)
  // user: Users;

  @OneToMany(() => Columns, (column) => column.board, { cascade: true })
  column: Columns[];
}
