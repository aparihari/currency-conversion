import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { Parser } from 'json2csv';
import { filter, maxBy, map } from 'lodash';
import { catchError, firstValueFrom } from 'rxjs';

import { ExchangeRateDto } from './dto/exchange-rate.dto';
import { CountryCodeToCountry } from './enum/country.enum';
import { BestRate } from './interface/best-rate';

@Injectable()
export class CurrencyConversionService {
  private readonly logger = new Logger(CurrencyConversionService.name);
  private exchangeRates: ExchangeRateDto[];

  constructor(
    private readonly configService: ConfigService,
    private readonly http: HttpService,
  ) {}

  private async getExchangeRate(): Promise<ExchangeRateDto[]> {
    const { data } = await firstValueFrom(
      this.http
        .get<ExchangeRateDto[]>(
          `${this.configService.get<string>(
            'apiUrl',
          )}?seed=${this.configService.get<string>('seed')}`,
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw `Couldn't get data from api. Something went wrong!`;
          }),
        ),
    );

    return data;
  }

  private async getConvertedValue(
    exchangeRate: ExchangeRateDto,
  ): Promise<BestRate> {
    if (exchangeRate.fromCurrencyCode === 'CAD') {
      return {
        amount: exchangeRate.exchangeRate,
        path: `CAD | ${exchangeRate.toCurrencyCode}`,
      };
    }

    const bestRate = await this.getBestRate(exchangeRate.fromCurrencyCode);

    return {
      amount: (bestRate?.amount || 0) * exchangeRate.exchangeRate,
      path: bestRate ? `${bestRate.path} | ${exchangeRate.toCurrencyCode}` : '',
    };
  }

  // Removes all the conversions for which there is no direct/indirect path available to CAD
  private removeZeros(bestRates: BestRate[]) {
    return filter(bestRates, (rate) => rate.amount > 0);
  }

  /**
   * Determines and return the best conversion rate for a currency
   * @param {string} currencyCode
   * @returns {Promise<BestRate>}
   */
  async getBestRate(currencyCode: string): Promise<BestRate> {
    this.exchangeRates = this.exchangeRates || (await this.getExchangeRate());

    const exchangeRatesForCurrency = filter(this.exchangeRates, [
      'toCurrencyCode',
      currencyCode,
    ]);

    const convertedRates = await Promise.all(
      exchangeRatesForCurrency.map((exchangeRateForCurrency) =>
        this.getConvertedValue(exchangeRateForCurrency),
      ),
    );

    return maxBy(convertedRates, (rate) => rate.amount);
  }

  /**
   * Determines and returns best conversion rate for all the currencies
   * @param {number} amount
   * @returns {Promise<BestRate[]>}
   */
  async getBestRateForAllCurrencies(amount: number): Promise<BestRate[]> {
    this.exchangeRates = this.exchangeRates || (await this.getExchangeRate());

    const toCurrencyCodes = Array.from(
      new Set(map(this.exchangeRates, 'toCurrencyCode')),
    );

    return this.removeZeros(
      await Promise.all(
        toCurrencyCodes.map(async (currencyCode: string) => {
          const bestRate = await this.getBestRate(currencyCode);

          return {
            currencyCode,
            country: CountryCodeToCountry[currencyCode],
            ...bestRate,
            amount: bestRate.amount * amount
          };
        }),
      ),
    );
  }

  /**
   * Generates and returns CSV data
   * @param {BestRoute[]} data
   * @param {number} amount
   * @returns {Promise<string>}
   */
  async generateCSV(data: BestRate[], amount: number): Promise<string> {
    const fields = [
      { label: 'Currency Code', value: 'currencyCode' },
      { label: 'Country', value: 'country' },
      { label: `Amount $${amount} CAD`, value: 'amount' },
      { label: 'Path', value: 'path' },
    ];
    const options = { fields };
    let csv: string;

    try {
      const parser = new Parser(options);
      csv = parser.parse(data);
    } catch (error) {
      this.logger.error(error);
      throw `Couldn't generate csv. Something went wrong!`;
    }

    return csv;
  }
}
