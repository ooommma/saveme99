import { PickType } from "@nestjs/mapped-types";
import { Columns } from "../entities/column.entity";
import { IsNumber, IsString} from "class-validator";

export class CreateColumnDto extends PickType(Columns, [
    "name"
]) {
    @IsString()
    name : string;
}
