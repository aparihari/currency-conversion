import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CurrencyConversionDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  currencyCode: string;

  @IsNumber()
  @Type(() => Number)
  amount: number = 100;
}
