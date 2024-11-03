import { Game } from './game/core/Game.js';
import './style.css';

document.addEventListener('DOMContentLoaded', () => {
    // Create the canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    document.body.appendChild(canvas);
    
    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Initialize game
    const game = new Game(canvas);
});
