// Menu system 

export class Menu {
    constructor(game) {
        this.game = game;
        this.container = null;
        this.currentMode = null;
        this.initialize();
    }

    initialize() {
        console.log('Initializing menu...');
        this.container = document.createElement('div');
        this.container.className = 'menu';
        document.body.appendChild(this.container);
        console.log('Menu container created:', this.container);
        this.showMainMenu();
    }

    showMainMenu() {
        this.container.innerHTML = `
            <div class="menu-content">
                <h1>Rocket Ragdoll</h1>
                <div class="menu-options">
                    <button data-mode="training">Training Mode</button>
                    <button data-mode="challenge">Challenge Mode</button>
                    <button data-mode="endless">Endless Mode</button>
                </div>
            </div>
        `;

        this.addMenuListeners();
    }

    addMenuListeners() {
        const buttons = this.container.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const mode = button.dataset.mode;
                this.startGameMode(mode);
            });
        });
    }

    startGameMode(mode) {
        this.hide();
        switch(mode) {
            case 'training':
                this.game.startMode('training');
                break;
            case 'challenge':
                this.game.startMode('challenge');
                break;
            case 'endless':
                this.game.startMode('endless');
                break;
        }
    }

    show() {
        this.container.style.display = 'flex';
    }

    hide() {
        this.container.style.display = 'none';
    }
} 
