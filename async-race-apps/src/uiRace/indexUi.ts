import { getCar, getCars, createCar, deleteCar, updateCar, startEngine, stopEngine, saveWinner, getWinners, deleteWinner, drive, ICar } from "../apiRace/indexApi"
import store from '../storeRace/indexStore';
import { animation, getDistanceBetweenElements, race, generateRandomCars } from '../utilsRace/indexUtils';

let selectedCar:ICar|null = null;

const renderCarImage = (color: string): string => `
<?xml version="1.0"?>
<svg xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://www.w3.org/2000/svg" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:svg="http://www.w3.org/2000/svg" id="svg2" viewBox="0 0 167.83 55.332" version="1.0">
  <g id="layer1" transform="translate(-227.51 -167.55)" style="fill:${color}">
    <path id="path2220" fill-rule="evenodd" d="m229.52 196.33c-0.09-8.41 0.63-14.12 2.92-14.62l11.85-1.54c8.38-3.87 17.11-8.68 24.77-10.62 5.88-1.17 12.1-1.88 18.77-2 13.43 0.22 28.36-0.7 37.85 2.47 9.04 4.17 17.95 8.62 26.46 13.84 11.48 0.79 34.91 3.98 38.32 7.7 1.69 2.28 3.05 4.73 3.69 7.54 1.49 0.61 1.38 2.82 0.77 5.53l-0.16 5.54-5.69 2.31-11.23 1.39-2.92 0.77c-4.24 9.94-19.98 8.71-24.31-0.47l-3.54 0.62-63.09-0.62-0.77 1.08-4.92-0.15c-3.3 10.15-22.17 11.08-25.08-1.39h-2.46l-7.39-1.07-11.23-1.54c-3.06-1.82-4.34-3.19-4.62-4.31l0.77-1.08-0.61-6.15c0.41-2.09 0.79-2.76 1.85-3.23zm68.16-26.37c-6.77 0.01-13.39 0.26-19.34 1.57l1.39 11.78 20.9 0.72c0.86-0.18 1.76-0.32 1.59-1.79l-2.18-12.28c-0.79-0.01-1.57 0-2.36 0zm-20.34 1.8c-4.01 0.97-7.7 2.47-10.9 4.74-1.27 0.85-1.73 1.85-1.68 2.97 0.59 2.54 2.09 3.57 4.26 3.47l9.71 0.33-1.39-11.51zm27.26-1.7l4.46 12.68c0.56 0.92 1.38 1.61 2.88 1.69l21.7 0.89c-3.09-2.11-0.55-6 2.58-5.15-5.87-4.89-12.24-7.99-19.13-9.22-4.05-0.65-8.26-0.79-12.49-0.89zm-71.88 12.58c-1.78 0.64-2.21 5.18-2.29 10.75l5.83-0.05c0.22-1.95 0.26-3.9 0.02-5.85-0.57-3.41-2.17-3.83-3.56-4.85zm38.65 5.22h5.51c0.43 0 0.79 0.36 0.79 0.79 0 0.44-0.36 0.79-0.79 0.79h-5.51c-0.44 0-0.79-0.35-0.79-0.79 0-0.43 0.35-0.79 0.79-0.79zm38 0.91h5.51c0.44 0 0.79 0.35 0.79 0.79s-0.35 0.79-0.79 0.79h-5.51c-0.44 0-0.79-0.35-0.79-0.79s0.35-0.79 0.79-0.79zm-34.25 21.22c0 5.04-4.09 9.13-9.13 9.13s-9.13-4.09-9.13-9.13 4.09-9.13 9.13-9.13 9.13 4.09 9.13 9.13zm97.44-1.16c0 5.04-4.09 9.13-9.13 9.13s-9.13-4.09-9.13-9.13 4.09-9.13 9.13-9.13 9.13 4.09 9.13 9.13zm7.63-11.03l11.79 0.08c-0.91-1.96-2.08-3.7-3.91-5.12l-4.56 0.35c-0.84 0.13-1.19 0.5-1.5 0.89l-1.82 3.8z"/>
  </g>  
</svg>
`;

interface ICarRender {
    id: number;
    name: string;
    color: string;
    isEngineStarted:boolean
}

const renderCar = ({
  id, name, color, isEngineStarted,
}: ICarRender): string => `
<div class='general-buttons'>
<button class="button select-button" id="select-car-${id}">Select</button>
<button class="button remove-button" id="remove-car-${id}">Remove</button>
<span class="car-name">${name}</span>
</div>
<div class="road">
  <div class="launch-pad">
    <div class="control-panel">
      <button class="icon start-engine-button" id="start-engine-car-${id}" ${isEngineStarted ? 'disabled' : ''}>A</button>
      <button class="icon stop-engine-button" id="stop-engine-car-${id}" ${!isEngineStarted ? 'disabled' : ''}>B</button>
    </div>
    <div class="car" id="car-${id}">${renderCarImage(color)}</div>
  </div>
  <div class="flag" id="flag-${id}">&#9873;</div>
</div>
`;

const renderGarage = (): string => `
<h1>Garage (${store.carsCount})</h1>
<h2>Page (${store.carsPage})</h2>
<ul class="garage">
  ${store.cars.map((car:ICarRender) => `
    <li>${renderCar(car)}</li>
    `).join('')}
</ul>
`;

// interface IWinner {
//   id: number;
//   wins: number;
//   time: number;
// }

const sorter = {byWins:'wins', byTime:'time'}

const renderWinners = (): string => `
<h1>Winners(${store.winnersCount})</h1>
<h2>Page #${store.winnerPage}</h2>
<table class="table" cellspacing="0" border="0" cellpadding="0">
  <thead>
    <th>Number</th>
    <th>Car</th>
    <th>Name</th>
    <th class="table-button table-wins ${store.sortBy === sorter.byWins ? store.sortOrder : ''}" id="sort-by-wins">Wins</th>
    <th class="table-button table-time ${store.sortBy === sorter.byTime ? store.sortOrder : ''}" id="sort-by-time">Best time, seconds</th>
  </thead>
  <tbody>
    ${store.winners.map((winner:, index: number) => `
      <tr>
        <td>${index + 1}</td>
        <td>${renderCarImage(winner.car.color)}</td>
        <td>${winner.car.name}</td>
        <td>${winner.wins}</td>
        <td>${winner.time}</td>
      </tr>
      `).join('')}
  </tbody>
</table>
`;

export const render = async () => {
  const html: string = `
  <div class="menu">
  <button class="button garage-menu-button primary" id="garage-menu">To garage</button>
  <button class="button winners-menu-button primary" id="winners-menu">To winners</button>
</div>
<div id="garage-view">
  <div>
    <form id="create" class="form">
      <input type="text" name="name" class="input" id="create-name">
      <input type="color" name="color" class="color" id="create-color" value="#ffffff">
      <button class="button" type="submit">Create</button>
    </form>
    <form id="update" class="form">
      <input type="text" name="name" class="input" id="update-name">
      <input type="color" name="color" class="color" id="update-color" value="#ffffff" disabled>
      <button class="button" id="update-submit" type="submit">Create</button>
    </form>
  </div>
  <div class="race-controls">
    <button class="button race-button primary" id="race">Race</button>
    <button class="button raset-button primary" id="raset">Raset</button>
    <button class="button generator-button" id="generator">Generate cars</button>
  </div>
  <div id="garage">
    ${renderGarage()}
  </div>
  <div>
<p class="message" id="message"></p>
  </div>
</div>
<div id="winners-view" style="display:none">
${renderWinners()}
</div>
<div class="pagination">
  <button class="button primary prev-button" id="prev" disabled>Prev</button>
  <button class="button primary prev-button" id="next" disabled>Next</button>
</div>
  `;
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.appendChild(root)
}
//any
export const updateStateGarage = async () => {
  const { items, count } = await getCars(store.carsPage);
  store.cars = items;
  store.carsCount = count;

  if (store.carsPage * 7 < store.carsCount) {
    (<HTMLButtonElement>document.getElementById('next')).disabled = false;
  } else {
    (<HTMLButtonElement>document.getElementById('next')).disabled = true;
  }
  if (store.carsPage > 1) {
    (<HTMLButtonElement>document.getElementById('prev')).disabled = false;
  } else {
    (<HTMLButtonElement>document.getElementById('prev')).disabled = true;
  }
};

const MAX_ITEMS_ON_PAGE = 10;
//any
export const updateStateWinners = async () => {
  const { items, count } = await getWinners({ page: store.winnerPage, sort: store.sortBy, order: store.sortOrder });
  store.winners = items;
  store.winnersCount = count;
  
  if (store.winnerPage * MAX_ITEMS_ON_PAGE < store.winnersCount) {
    (<HTMLButtonElement>document.getElementById('next')).disabled = false;
  } else {
    (<HTMLButtonElement>document.getElementById('next')).disabled = true;
  }
  if (store.winnerPage > 1) {
    (<HTMLButtonElement>document.getElementById('prev')).disabled = false;
  } else {
    (<HTMLButtonElement>document.getElementById('prev')).disabled = true;
  }
};

const startDriving = async (id: number) => {
  const startButton = <HTMLButtonElement>document.getElementById(`start-engine-car-${id}`);
  startButton.disabled = true;
  startButton.classList.toggle('enabling', true)
  //any
  const { velocity, distance } = await startEngine(id)
  const time: number = Math.round(distance / velocity)
  
  startButton.classList.toggle('enabling', false);
  (<HTMLButtonElement>document.getElementById(`stop-engine-car-${id}`)).disabled = false
  
  const car = <HTMLElement>document.getElementById(`car-${id}`);
  const flag = <HTMLButtonElement>document.getElementById(`flag-${id}`);
  const htmlDistance: number = Math.floor(getDistanceBetweenElements(car, flag) + 100);

  store.animation[id] = animation(car, htmlDistance, time);

  const { success } = await drive(id);
  if (!success) window.cancelAnimationFrame(store.animation[id].id);

  return { success, id, time };
};

const stopDriving = async (id: number) => {
  const stopButton = <HTMLButtonElement>document.getElementById(`stop-engine-car-${id}`);
  stopButton.disabled = true;
  stopButton.classList.toggle('enabling', true);
  await stopEngine(id);
  stopButton.classList.toggle('enabling', false);
  (<HTMLButtonElement>document.getElementById(`start-engine-car-${id}`)).disabled = false;

  const car = <HTMLElement>document.getElementById(`car-${id}`);
  car.style.transform = `translateX(0)`;
  if (store.animation[id]) window.cancelAnimationFrame(store.animation[id].id);
};

const setSortOrder = async (sortBy: string) => {
  store.sortOrder = store.sortOrder === 'asc' ? 'desc' : 'asc';
  store.sortBy = sortBy;

  await updateStateWinners();
  (<HTMLElement>document.getElementById('winners-view')).innerHTML = renderWinners();
};

export const listen = () => {
  document.body.addEventListener('click', async (event: Event) => {
    const target = <HTMLButtonElement>event.target
    if (target.classList.contains('start-engine-button')) {
      const id: number = +target.id.split('start-engine-car-')[1];
      startDriving(id);
    }
    if (target.classList.contains('stop-engine-button')) {
      const id: number = +target.id.split('stop-engine-button')[1];
      stopDriving(id)
    }
    if (target.classList.contains('select-button')) {
      selectedCar = await getCar(+target.id.split('select-button')[1]);
      (<HTMLInputElement>document.getElementById('update-name')).value = selectedCar.name;
      (<HTMLInputElement>document.getElementById('update-color')).value = selectedCar.color;
      (<HTMLInputElement>document.getElementById('update-name')).disabled = false;
      (<HTMLInputElement>document.getElementById('update-color')).disabled = false;
      (<HTMLButtonElement>document.getElementById('update-submit')).disabled = false;
    }
    if (target.classList.contains('remove-button')) {
      const id: number = +target.id.split('remove-car-'[1])
      await deleteCar(id);
      await deleteWinner(id);
      await updateStateGarage();
      (<HTMLElement>document.getElementById('garage')).innerHTML = renderGarage()
    }
    //any
    if (target.classList.contains('generator-button')) {
      target.disabled = true;
      const cars = generateRandomCars();
      await Promise.all(cars.map(async c => await createCar(c)));
      await updateStateGarage();
      (<HTMLElement>document.getElementById('garage')).innerHTML = renderGarage();
      target.disabled = false;
    }
    if (target.classList.contains('race-button')) {
      target.disabled = true;
      const winner = await race(startDriving);
      await saveWinner(winner);
      const message = <HTMLElement>document.getElementById('message');
      message.innerHTML = `${winner.name} finished first (${winner.time}s)!`;
      message.classList.toggle('visible', true);
      (<HTMLButtonElement>document.getElementById('reset')).disabled = false;
    };
    if (target.classList.contains('reset-button')) {
      target.disabled = true;
      store.cars.map(({ id }) => stopDriving(id));
      const message = <HTMLElement>document.getElementById('message');
      message.classList.toggle('visible', false);
      (<HTMLButtonElement>document.getElementById('race')).disabled = false;
    }
    if (target.classList.contains('prev-button')) {
      switch (store.view) {
        case 'garage': {
          store.carsPage--;
          await updateStateGarage();
          (<HTMLElement>document.getElementById('garage')).innerHTML = renderGarage();
          break;
        }
        case 'winners': {
          store.winnerPage--;
          await updateStateWinners();
          (<HTMLElement>document.getElementById('winners-view')).innerHTML = renderWinners();
          break;
        }
      }
    }
    if (target.classList.contains('next-button')) {
      switch (store.view) {
        case 'garage': {
          store.carsPage++;
          await updateStateGarage();
          (<HTMLElement>document.getElementById('garage')).innerHTML = renderGarage();
          break;
        }
        case 'winners': {
          store.winnerPage++;
          await updateStateWinners();
          (<HTMLElement>document.getElementById('winners-view')).innerHTML = renderWinners();
          break;
        }
      }
    }
    if (target.classList.contains('garage-menu-button')) {
      (<HTMLButtonElement>document.getElementById('garage-view')).style.display = 'block';
      (<HTMLButtonElement>document.getElementById('winners-view')).style.display = 'none';
    }
    if (target.classList.contains('winners-menu-button')) {
      (<HTMLButtonElement>document.getElementById('winners-view')).style.display = 'block';
      (<HTMLButtonElement>document.getElementById('garage-view')).style.display = 'none';
      await updateStateWinners();
      (<HTMLElement>document.getElementById('winners-view')).innerHTML = renderWinners();
    }
    if (target.classList.contains('table-wins')) {
      setSortOrder('wins')
    }
    if (target.classList.contains('table-time')) {
      setSortOrder('time')
    }
  });

  (<HTMLElement>document.getElementById('create')).addEventListener('submit', async (event: Event) => {
    event.preventDefault();
    const target = <HTMLButtonElement>event.target
    const car = Object.fromEntries(new Map([...[target]].filter(({ name }) => !!name).map(({ value, name }) => [name, value])));
    await createCar(car)
    await updateStateGarage();
    (<HTMLElement>document.getElementById('garage')).innerHTML = renderGarage();
    (<HTMLInputElement>document.getElementById('create-name')).value = '';
    target.disabled = true
  });

  (<HTMLElement>document.getElementById('update')).addEventListener('submit', async (event: Event) => {
    event.preventDefault();
    const target = <HTMLButtonElement>event.target;
    const car = Object.fromEntries(new Map([...[target]].filter(({ name }) => !!name).map(({ value, name }) => [name, value])));
    await updateCar(selectedCar.id, car);
    await updateStateGarage();
    (<HTMLElement>document.getElementById('garage')).innerHTML = renderGarage();
    (<HTMLInputElement>document.getElementById('update-name')).value = '';
    (<HTMLInputElement>document.getElementById('update-name')).disabled = true;
    (<HTMLInputElement>document.getElementById('update-color')).disabled = true;
    (<HTMLButtonElement>document.getElementById('update-submit')).disabled = true;
    (<HTMLInputElement>document.getElementById('update-color')).value = '#ffffff';
    selectedCar = null;
  });
};



