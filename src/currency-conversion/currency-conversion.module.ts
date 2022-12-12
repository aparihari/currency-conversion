import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { CurrencyConversionController } from './currency-conversion.controller';
import { CurrencyConversionService } from './currency-conversion.service';

@Module({
  imports: [HttpModule],
  controllers: [CurrencyConversionController],
  providers: [CurrencyConversionService],
})
export class CurrencyConversionModule {}
