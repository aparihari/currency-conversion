## Description

The source code contains the solution for the task of determining the best conversion rates from CAD. Please go through the following instructions to run the project in your local environment.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Project Details

## Code Details

I have tried to use a proper project structure for this assignment, therefore, even though there was only one API still I am using `.env` to contain the API details. I am using `@nestjs/config` package to properly manage the configurations throughout the project.

### API Routes

This project contains two api routes

#### [http://localhost:3000/currency-conversion](http://localhost:3000/currency-conversion)

This is a `GET` route, if we don't pass any query parameters then it will return JSON of all the currency conversions.

If we only want to get a single currency conversion deails then pass following two query parameters

- currencyCode: string
- amount: number (this is optional, by default it's value is going to be 100)

#### [http://localhost:3000/currency-conversion/csv](http://localhost:3000/currency-conversion/csv)

This is a `GET` route, and this returns the CSV file with all the currency conversions.
