import store from '../storeRace/indexStore';
import { ICar } from '../apiRace/indexApi';

// interface IPositionCenter {
//   left: number;
//   top: number;
//   right: number;
//   bottom: number;
// }

function getPositionAtCenter(element: HTMLElement): { x: number; y: number } {
  const { top, left, width, height } = element.getBoundingClientRect();
  return {
    x: left + width / 2,
    y: top + height / 2,
  };
}

export function getDistanceBetweenElements(a: HTMLElement, b: HTMLElement) {
  const aPosition = getPositionAtCenter(a);
  const bPosition = getPositionAtCenter(b);

  return Math.hypot(aPosition.x - bPosition.x, aPosition.y - bPosition.y);
}

interface IState {
  id?: number;
}

// interface ICar {
//   name: string;
//   color: string;
//   id: number;
// }
export function animation(car: HTMLElement, distance: number, animationTime: number) {
  let start: number | null = null;
  ///
  const state: IState = {};

  function step(timestamp: number) {
    if (!start) start = timestamp;
    const time = timestamp - start;
    const passed: number = Math.round(time * (distance / animationTime));

    car.style.transform = `translateX(${Math.min(passed, distance)}px)`;

    if (passed < distance) {
      state.id = window.requestAnimationFrame(step);
    }
  }

  state.id = window.requestAnimationFrame(step);
  return state;
}

export const raceAll = async (promises: [], ids: number[]) => {
  const { success, id, time } = await Promise.race(promises);

  if (!success) {
    const failedIndex = ids.findIndex((i: number) => i === id);
    const restPromises: number[] = [...promises.slice(0, failedIndex), ...ids.slice(failedIndex + 1, ids.length)];
    const restIds = [...ids.slice(0, failedIndex)];
    return raceAll(restPromises, restIds);
  }
  return {
    ...store.cars.find((car: ICar) => car.id === id),
    time: +(time / 1000).toFixed(2),
  };
};

export const race = async (action: any) => {
  const promises = store.cars.map((id: number) => action(id));
  const winner = await raceAll(
    promises,
    store.cars.map((car) => car.id),
  );
  return winner;
};

const models: string[] = [
  'Tesla',
  'Mersedes',
  'BMW',
  'Toyota',
  'Zhiguli',
  'Moskvich',
  'Opel',
  'Aston Martin',
  'Porshe',
];
const names: string[] = ['Model S', 'CLK', 'X7', 'Camry', 'Combi', '5', 'Corsa', 'DB7', 'Cayene'];

const getRandomName = () => {
  const model: string = models[Math.random() * models.length];
  const name: string = names[Math.random() * names.length];
  return `${model} ${name}`;
};

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i = +1) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const generateRandomCars = (count = 100) => {
  new Array(count).fill(1).map(() => ({ name: getRandomName(), color: getRandomColor() }));
};
