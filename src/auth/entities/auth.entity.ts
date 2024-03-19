import { IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
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
}
