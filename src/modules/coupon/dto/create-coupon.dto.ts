import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";
import { CouponEnum, ICoupon } from "src/common";

export class CreateCouponDto implements Partial<ICoupon>{
    
    @Type(()=>Number)
    @IsPositive()
    @IsNumber()
    discount?: number ;
     @Type(()=>Number)
    @IsPositive()
     @IsNumber()
    duration?: number ;
    @IsDateString()
    startDate?: Date ;
    @IsDateString()
    endDate?: Date ;
    @IsNotEmpty()
    @IsString()
    name?: string ;
    @IsEnum(CouponEnum)
    type?: CouponEnum ;

}
