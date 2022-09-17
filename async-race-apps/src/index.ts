// console.log('im working');
import { render, listen, updateStateGarage } from './uiRace/indexUi';

render();
(async () => {
  await updateStateGarage();
})();
listen();
