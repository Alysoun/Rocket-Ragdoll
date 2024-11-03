export class GameStateManager {
    constructor() {
        this.gameMode = null;
        this.paused = false;
        this.debug = true;
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }

    setGameMode(mode) {
        this.gameMode = mode;
    }

    toggleDebug() {
        this.debug = !this.debug;
    }
} 