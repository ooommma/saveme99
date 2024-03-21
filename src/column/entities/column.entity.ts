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
@Entity()
export class Columns {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  boardId: number;

  @Column()
  @IsNumber()
  order: number;
  @IsString()
  @Column({ default: 'Done name' })
  name: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Boards, (boards) => boards.column, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'boardId' })
  boards: Boards;

  @OneToMany(() => Cards, (card) => card.column)
  cards: Cards[];
}
