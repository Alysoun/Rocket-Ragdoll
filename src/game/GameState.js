export const GameStates = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
};

export class GameState {
    constructor() {
        this.state = GameStates.MENU;
        this.score = 0;
        this.timeInAir = 0;
        this.tricks = [];
        this.bestScore = localStorage.getItem('bestScore') || 0;
    }

    setState(newState) {
        this.state = newState;
    }

    addScore(points) {
        this.score += points;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore', this.bestScore);
        }
    }

    reset() {
        this.score = 0;
        this.timeInAir = 0;
        this.tricks = [];
    }
} 