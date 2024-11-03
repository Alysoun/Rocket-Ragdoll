export class ScoreSystem {
    constructor() {
        this.current = 0;
        this.multiplier = 1;
        this.airTime = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
        this.lastRotation = 0;
        this.rotationThreshold = 0.5;
    }

    update() {
        if (this.airTime > 0) {
            this.current += Math.floor(this.airTime * 0.1);
        }
        
        if (this.current > this.bestScore) {
            this.bestScore = this.current;
            localStorage.setItem('bestScore', this.bestScore);
        }
    }

    updateMultiplier(rotationSpeed) {
        if (rotationSpeed > this.rotationThreshold) {
            this.multiplier = Math.min(8, this.multiplier + 0.1);
            this.current += Math.floor(rotationSpeed * 10 * this.multiplier);
            console.log('Score added for rotation:', Math.floor(rotationSpeed * 10 * this.multiplier));
        } else {
            this.multiplier = Math.max(1, this.multiplier - 0.05);
        }
    }

    addScore(points, multiplier = true) {
        const finalPoints = multiplier ? points * this.multiplier : points;
        this.current += finalPoints;
        return finalPoints;
    }

    setAirborne(isAirborne) {
        if (isAirborne) {
            this.airTime++;
        } else {
            this.airTime = 0;
        }
    }

    reset() {
        this.current = 0;
        this.multiplier = 1;
        this.airTime = 0;
    }
} 