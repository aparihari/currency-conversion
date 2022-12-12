import {
  Controller,
  Get,
  Query,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';

import { CurrencyConversionService } from './currency-conversion.service';
import { CurrencyConversionDto } from 'src/currency-conversion/dto/currency-conversion.dto';

@Controller('currency-conversion')
export class CurrencyConversionController {
  constructor(
    private readonly currencyConversionService: CurrencyConversionService,
  ) {}

  /**
   * This method, accepts currencyCode & amount as query parameters, but both of them are optional
   * if we pass currencyCode then this route returns best conversion rate for that currency only
   * but if we don't pass anything then it returns best conversion rate for all the currencies
   * @param {CurrencyConversionDto} query
   * @returns
   */
  @Get()
  // The validation pipe ensures a default value for the amount
  @UsePipes(new ValidationPipe({ transform: true }))
  async getBestRates(@Query() query: CurrencyConversionDto) {
    if (query.currencyCode) {
      const bestRate = await this.currencyConversionService.getBestRate(
        query.currencyCode,
      );

      bestRate.amount *= query.amount;

      return bestRate;
    }

    return this.currencyConversionService.getBestRateForAllCurrencies(
      query.amount,
    );
  }

  @Get('/csv')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getCSVForAllCurrencies(
    @Res() response: Response,
    @Query() query: CurrencyConversionDto,
  ) {
    const bestRates =
      await this.currencyConversionService.getBestRateForAllCurrencies(
        query.amount,
      );

    const csv = await this.currencyConversionService.generateCSV(
      bestRates,
      query.amount,
    );

    response.header('Content-Type', 'text/csv');
    response.attachment('currency-conversion.csv');

    return response.send(csv);
  }
}
