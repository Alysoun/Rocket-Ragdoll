export class UI {
    constructor() {
        this.createUIElements();
    }

    createUIElements() {
        const ui = document.createElement('div');
        ui.className = 'game-ui';
        ui.innerHTML = `
            <div class="score">Score: <span id="score">0</span></div>
            <div class="multiplier">×<span id="multiplier">1</span></div>
            <div class="trick-text" id="trickText"></div>
        `;
        document.body.appendChild(ui);
    }

    update(scoreSystem) {
        document.getElementById('score').textContent = Math.floor(scoreSystem.current);
        document.getElementById('multiplier').textContent = scoreSystem.multiplier.toFixed(1);
    }

    showTrickText(text) {
        const trickText = document.getElementById('trickText');
        trickText.textContent = text;
        trickText.style.animation = 'none';
        trickText.offsetHeight; // Trigger reflow
        trickText.style.animation = 'trickText 1s ease-out';
    }

    showAchievement(name, points) {
        const achievementEl = document.createElement('div');
        achievementEl.className = 'achievement';
        achievementEl.innerHTML = `
            <div class="achievement-title">🏆 ${name}</div>
            <div class="achievement-points">+${points}</div>
        `;
        document.body.appendChild(achievementEl);
        
        setTimeout(() => {
            achievementEl.remove();
        }, 3000);
    }

    showSetupInstructions() {
        const instructions = document.createElement('div');
        instructions.className = 'setup-instructions';
        instructions.innerHTML = `
            <div class="instructions">
                <p>Drag limbs to adjust pose</p>
                <p>Press R to reset pose</p>
                <p>Press SPACE to start</p>
                <p>Use WASD + ZC for rockets</p>
            </div>
        `;
        document.body.appendChild(instructions);
    }

    hideSetupInstructions() {
        const instructions = document.querySelector('.setup-instructions');
        if (instructions) {
            instructions.remove();
        }
    }
} 