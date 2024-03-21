import { IsNumber, IsString } from 'class-validator';
import { Boards } from '../../boards/entities/board.entity';
import { Cards } from '../../card/entities/card.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  // Generated,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from '../../user/entities/users.entity';
@Entity()
export class Comments {
  @PrimaryGeneratedColumn()
  commentId: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'int', nullable: false })
  cardId: number;

  @Column()
  @IsNumber()
  content: string;

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Users, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Users;

  @ManyToOne(() => Cards, (card) => card.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cardId' })
  cards: Cards;
}
