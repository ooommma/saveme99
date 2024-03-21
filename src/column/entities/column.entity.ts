import { IsNumber, IsString } from 'class-validator';
import { Boards } from 'src/boards/entities/board.entity';
import { Cards } from 'src/card/entities/card.entity';
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

@Entity({ name: 'columns' })
export class Columns {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true })
  boardId: number;

  @Column({ unsigned: true })
  @IsNumber()
  order: number;

  @IsString()
  @Column({ default: 'Done name' })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Boards , (boards) => boards.columns, {onDelete: "CASCADE"})
  // @JoinColumn({name : "boardId"})
  boards : Boards;

  // @OneToMany(() => Cards, (card) => card.column)
  // cards: Cards[];
}
