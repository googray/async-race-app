const base = 'http://127.0.0.1:3000';

const garage = `${base}/garage`;
const engine = `${base}/engine`;
const winners = `${base}/winners`;

export interface ICar {
  name: string;
  color: string;
  id: number;
}

export const getCars = async (page: number, limit = 7) => {
  const response = await fetch(`${garage}?_page=${page}&_limit=${limit}`);

  return {
    items: (await response.json()) as Promise<ICar[]>,
    count: response.headers.get('X-Total-Count') as number | null,
  };
};

export const getCar = async (id: number) => (await (await fetch(`${garage}/${id}`)).json()) as Promise<ICar>;

interface IBody {
  name: string;
  color: string;
}

interface ICreateCar {
  id: number;
}

export const createCar = async (body: ICreateCar): Promise<ICar> =>
  (
    await fetch(garage, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  ).json();

export const deleteCar = async (id: number) =>
  (await fetch(`${garage}/${id}`, { method: 'DELETE' })).json() as Promise<string>;

export const updateCar = async (id: number, body: IBody): Promise<ICar> =>
  (
    await fetch(`${garage}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  ).json();

interface IEngine {
  velocity: number;
  distance: number;
}

export const startEngine = async (id: number): Promise<IEngine> =>
  (await fetch(`${engine}?id=${id}&status=started`)).json();

export const stopEngine = async (id: number): Promise<IEngine> =>
  (await fetch(`${engine}?id=${id}&status=stopped`)).json();

export const drive = async (id: number): Promise<string> => {
  const res = await fetch(`${engine}?id=${id}&status=drive`).catch();
  return res.status !== 200 ? { success: false } : { ...(await res.json()) };
};

const getSortOrder = (sort: string, order: string) => {
  if (sort && order) return `&_sort=${sort}&_order=${order}`;
  return '';
};

interface IGetWinners {
  page?: number;
  limit?: number;
  sort: string;
  order: string;
}

interface IWinner {
  id: number;
  wins: number;
  time: number;
}

export const getWinners = async ({ page, limit = 10, sort, order }: IGetWinners) => {
  const response = await fetch(`${winners}?_page=${page}&_limit=${limit}${getSortOrder(sort, order)}`);
  const items = (await response.json()) as Promise<IWinner[]>;

  return {
    items: (await Promise.all(
      items.map(async (winner: ICar) => ({
        ...winner,
        car: await createCar(winner.id),
      }))
    )) as Promise<IWinner[]>,
    count: response.headers.get('X-Total-Count'),
  };
};

export const getWinner = async (id: number) => (await fetch(`${winners}/${id}`)).json();

export const getWinnerStatus = async (id: number) => (await fetch(`${winners}/${id}`)).status;

export const deleteWinner = async (id: number) =>
  (await fetch(`${winners}/${id}`, { method: 'DELETE' })).json() as Promise<string>;

interface ICreateWinner {
  id: number;
  wins?: number;
  time?: number;
}

export const createWinner = async (body: ICreateWinner): Promise<IWinner> =>
  (
    await fetch(winners, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  ).json();

export const updateWinner = async (body: IWinner | null, id: number): Promise<IWinner> =>
  (
    await fetch(`${winners}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  ).json();

export const saveWinner = async ({ id, time }: IWinner) => {
  const winnerStatus = await getWinnerStatus(id);

  if (winnerStatus === 404) {
    await createWinner({
      id,
      wins: 1,
      time,
    });
  } else {
    const winner = await getWinner(id);
    await updateWinner(
      {
        id,
        wins: winner.wins + 1,
        time: time < winner.time ? time : winner.time,
      },
      id
    );
  }
};
