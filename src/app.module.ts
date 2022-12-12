import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configuration from 'config/configuration';
import { CurrencyConversionModule } from './currency-conversion/currency-conversion.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    }),
    CurrencyConversionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
