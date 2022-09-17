import { getCars, getWinners } from '../apiRace/indexApi';
import { ICar, IWinner } from '../apiRace/indexApi';

interface IGetCars {
  items: ICar[];
  count: number;
}

const { items: cars, count: carsCount }: IGetCars = (async () => {
  await getCars(1);
})();

interface IGetWinners {
  items: IWinner[];
  count: number;
}

const { items: winners, count: winnersCount }: IGetWinners = (async () => {
  await getWinners({ page: 1 });
})();

export default {
  carsPage: 1,
  cars,
  carsCount,
  winnerPage: 1,
  winners,
  winnersCount,
  animation: {},
  view: 'garage',
  sortBy: null,
  sortOrder: null,
};
