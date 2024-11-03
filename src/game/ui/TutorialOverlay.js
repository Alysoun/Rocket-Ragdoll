export class TutorialOverlay {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'tutorial-overlay';
        document.body.appendChild(this.container);
        
        this.messageBox = document.createElement('div');
        this.messageBox.className = 'tutorial-message';
        this.container.appendChild(this.messageBox);
        
        this.keyHint = document.createElement('div');
        this.keyHint.className = 'key-hint';
        this.container.appendChild(this.keyHint);
    }

    showMessage(message) {
        this.messageBox.textContent = message;
        this.messageBox.style.opacity = '1';
    }

    showKeyHint(key, action) {
        this.keyHint.innerHTML = `
            <div class="key">${key}</div>
            <div class="action">${action}</div>
        `;
        this.keyHint.style.opacity = '1';
    }
} 