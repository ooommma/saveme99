import { IsNumber, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, Generated, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({name: "columns"})
export class Columns {

    @PrimaryGeneratedColumn({unsigned : true})
    id : number;

    @Column({unsigned : true})
    boardId : number;

    @Column({unique: true ,unsigned: true})
    @IsNumber()
    order : number;
    
    @IsString()
    @Column({default: "Done name"})
    name : string;
    
    @CreateDateColumn()
    createdAt : Date;
    
    @UpdateDateColumn()
    updatedAt : Date;

    // @ManyToOne((type) : typeof Boards => Boards , boards => boards.columns, {onDelete: "CASCADE"})
    // boards : Boards;

    // @OneToMany((type) : typeof Card => Card, card => card.colums)
    // cards : Card[];


}