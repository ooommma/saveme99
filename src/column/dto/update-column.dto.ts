import { PickType } from "@nestjs/mapped-types";
import { Columns } from "../entities/column.entity";
import { IsNumber, IsString } from "class-validator";

export class UpdateColumnDto extends PickType(Columns, [
    "name" , "order"
]) {

    @IsString()
    name : string;

    @IsNumber()
    order: number;
}
