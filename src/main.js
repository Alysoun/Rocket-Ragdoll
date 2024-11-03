import { Game } from './game/Game';
import './style.css';

document.querySelector('#app').innerHTML = `
  <canvas id="game-canvas" width="800" height="600"></canvas>
`;

const canvas = document.querySelector('#game-canvas');
const game = new Game(canvas);
game.start();

// Add this for debugging
console.log('Game initialized');
