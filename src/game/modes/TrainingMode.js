import { Bodies, World, Runner } from 'matter-js';

// Training mode 

export class TrainingMode {
    constructor(game) {
        this.game = game;
        this.currentLevel = null;
        this.initialScore = 0;
        this.walls = [];
        this.tutorialShown = false;
        this.levelCompleted = false;
        this.completionDelay = 2000; // 2 seconds before next level

        // Add reset button
        this.addResetButton();
    }

    startLevel(level) {
        this.currentLevel = level;
        this.createBoundaries();
        
        // Pause the game engine immediately
        if (this.game.runner) {
            Runner.stop(this.game.runner);
        }
        
        // Enable only specified rockets
        this.game.ragdoll.enableRockets(level.availableRockets);
        
        // Reset collectibles
        this.game.collectibleManager.clearAll();
        this.initialScore = this.game.collectibleManager.getScore();
        
        // Spawn new collectibles
        level.collectibles.forEach(pos => {
            this.game.collectibleManager.spawnCollectible(pos.x, pos.y);
        });

        // Show tutorial after everything is set up
        this.showTutorialPopup();
    }

    createBoundaries() {
        // Remove any existing walls
        this.walls.forEach(wall => World.remove(this.game.engine.world, wall));
        this.walls = [];

        const wallOptions = {
            isStatic: true,
            render: {
                fillStyle: 'rgba(255, 0, 0, 0.2)',
                visible: true // For debugging
            },
            label: 'boundary'
        };

        // Create much taller walls and add a ceiling
        const leftWall = Bodies.rectangle(-1000, 0, 100, 8000, wallOptions);
        const rightWall = Bodies.rectangle(1000, 0, 100, 8000, wallOptions);
        const ceiling = Bodies.rectangle(0, -2000, 2100, 100, wallOptions);
        
        this.walls.push(leftWall, rightWall, ceiling);
        World.add(this.game.engine.world, [leftWall, rightWall, ceiling]);
    }

    showTutorialPopup() {
        const popup = document.createElement('div');
        popup.className = 'tutorial-popup';
        
        const tutorialContent = this.currentLevel.tutorialText ? 
            this.currentLevel.tutorialText.map(text => `<p>${text}</p>`).join('') :
            `<p>Let's learn how to control your ragdoll.</p>`;

        popup.innerHTML = `
            <div class="tutorial-content">
                <h2>${this.currentLevel.name}</h2>
                ${tutorialContent}
                <div class="controls">
                    ${this.currentLevel.availableRockets.includes('head') ? 
                        '<div class="control-key"><kbd>W</kbd> Head Rocket</div>' : ''}
                    ${this.currentLevel.availableRockets.includes('leftArm') ? 
                        '<div class="control-key"><kbd>A</kbd> Left Arm</div>' : ''}
                    ${this.currentLevel.availableRockets.includes('rightArm') ? 
                        '<div class="control-key"><kbd>D</kbd> Right Arm</div>' : ''}
                </div>
                <button class="start-button">Got it, let's start!</button>
            </div>
        `;

        // Add the popup to the DOM first
        document.body.appendChild(popup);

        // Then add the styles
        const style = document.createElement('style');
        style.textContent = `
            .tutorial-popup {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            }
            .tutorial-content {
                background: white;
                padding: 30px;
                border-radius: 10px;
                max-width: 500px;
                text-align: center;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            }
            .controls {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin: 20px 0;
                padding: 15px;
                background: #f5f5f5;
                border-radius: 8px;
            }
            .control-key {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
            }
            kbd {
                background: #333;
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-family: monospace;
                font-size: 18px;
            }
            .tutorial-content p {
                margin: 15px 0;
                font-size: 18px;
                color: #333;
            }
            .start-button {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                margin-top: 20px;
            }
            .start-button:hover {
                background: #45a049;
            }
        `;
        document.head.appendChild(style);

        // Handle start button click
        const startButton = popup.querySelector('.start-button');
        startButton.addEventListener('click', () => {
            popup.remove();
            this.tutorialShown = true;
            // Resume the game
            if (this.game.runner) {
                Runner.run(this.game.runner, this.game.engine);
            }
        });
    }

    update() {
        if (!this.currentLevel || this.levelCompleted) return;

        // Check objectives
        const collectedCount = this.game.collectibleManager.getCollectedCount();
        const objective = this.currentLevel.objectives[0];
        
        if (collectedCount >= objective.count && !this.levelCompleted) {
            this.levelCompleted = true;
            this.showLevelComplete();
        }
    }

    showLevelComplete() {
        // Create level complete overlay
        const overlay = document.createElement('div');
        overlay.className = 'level-complete-overlay';
        overlay.innerHTML = `
            <div class="level-complete-content">
                <h2>Level Complete! 🎉</h2>
                <p>You've mastered ${this.currentLevel.name}</p>
                <div class="stats">
                    <div>Orbs Collected: ${this.game.collectibleManager.getCollectedCount()}</div>
                </div>
                <button class="next-level-button">Next Level</button>
            </div>
        `;
        document.body.appendChild(overlay);

        // Add CSS
        const style = document.createElement('style');
        style.textContent = `
            .level-complete-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                animation: fadeIn 0.5s ease-out;
            }
            .level-complete-content {
                background: white;
                padding: 30px;
                border-radius: 10px;
                text-align: center;
                animation: slideIn 0.5s ease-out;
            }
            .level-complete-content h2 {
                color: #4CAF50;
                margin-bottom: 20px;
            }
            .stats {
                margin: 20px 0;
                padding: 10px;
                background: #f5f5f5;
                border-radius: 5px;
            }
            .next-level-button {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 18px;
                transition: background 0.3s;
            }
            .next-level-button:hover {
                background: #45a049;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideIn {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        // Handle next level button
        const nextButton = overlay.querySelector('.next-level-button');
        nextButton.addEventListener('click', () => {
            this.startNextLevel();
            overlay.remove();
        });
    }

    startNextLevel() {
        // Get next level from level manager
        if (!this.currentLevel || !this.currentLevel.unlocks) {
            console.error('No next level defined');
            this.showTrainingComplete();
            return;
        }

        const nextLevelId = this.currentLevel.unlocks[0];
        if (!nextLevelId) {
            console.log('Training complete - no more levels');
            this.showTrainingComplete();
            return;
        }

        try {
            const nextLevel = this.game.levelManager.loadLevel(nextLevelId);
            if (nextLevel) {
                this.levelCompleted = false;
                this.cleanup();
                
                // Reset ragdoll position before starting next level
                if (this.game.ragdoll) {
                    this.game.ragdoll.resetPosition(0, 0);
                }
                
                this.startLevel(nextLevel);
            } else {
                console.error('Could not load next level:', nextLevelId);
                this.showTrainingComplete();
            }
        } catch (error) {
            console.error('Error loading next level:', error);
            this.showTrainingComplete();
        }
    }

    showTrainingComplete() {
        const overlay = document.createElement('div');
        overlay.className = 'training-complete-overlay';
        overlay.innerHTML = `
            <div class="training-complete-content">
                <h2>Training Complete! 🎓</h2>
                <p>You've completed all training levels!</p>
                <p>Ready to take on the real challenges?</p>
                <button class="challenge-mode-button">Start Challenge Mode</button>
                <button class="menu-button">Back to Menu</button>
            </div>
        `;
        document.body.appendChild(overlay);

        // Handle buttons
        overlay.querySelector('.challenge-mode-button').addEventListener('click', () => {
            this.game.startMode('challenge');
            overlay.remove();
        });

        overlay.querySelector('.menu-button').addEventListener('click', () => {
            this.game.menu.show();
            overlay.remove();
        });
    }

    cleanup() {
        // Remove walls
        this.walls.forEach(wall => World.remove(this.game.engine.world, wall));
        this.walls = [];
        
        // Clear collectibles
        this.game.collectibleManager.clearAll();
        
        // Reset ragdoll position and state
        if (this.game.ragdoll) {
            this.game.ragdoll.resetPosition(0, 0);
            // Optional: reset any ragdoll state (like active rockets)
            this.game.ragdoll.deactivateAllRockets();
        }
    }

    addResetButton() {
        const resetButton = document.createElement('button');
        resetButton.className = 'reset-button';
        resetButton.textContent = 'Reset Position (R)';
        document.body.appendChild(resetButton);

        // Add CSS for the reset button
        const style = document.createElement('style');
        style.textContent = `
            .reset-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #ff4444;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                z-index: 1000;
            }
            .reset-button:hover {
                background: #ff0000;
            }
        `;
        document.head.appendChild(style);

        // Reset functionality
        const resetPosition = () => {
            if (this.game.ragdoll) {
                this.game.ragdoll.resetPosition(0, 0);
            }
        };

        resetButton.addEventListener('click', resetPosition);
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'r') {
                resetPosition();
            }
        });
    }
} 
