// Input handling 

export class InputManager {
    constructor(game) {
        this.game = game;
        this.keys = {};
        
        // Bind event listeners
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    handleKeyDown(event) {
        this.keys[event.code] = true;
        
        if (!this.game.ragdoll) {
            console.warn('❌ No ragdoll available for input');
            return;
        }

        console.log('🎮 Key pressed:', {
            key: event.code,
            ragdollExists: !!this.game.ragdoll,
            hasRockets: !!this.game.ragdoll?.rockets,
            rocketStates: Object.entries(this.game.ragdoll.rockets).map(([key, rocket]) => ({
                name: key,
                hasBodyPart: !!rocket.bodyPart,
                position: rocket.bodyPart?.position
            }))
        });

        console.log('Ragdoll state:', {
            exists: !!this.game.ragdoll,
            position: this.game.ragdoll?.parts?.torso?.position
        });

        switch(event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.game.ragdoll.rockets.head.toggleThrust(true);
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.game.ragdoll.rockets.leftArm.toggleThrust(true);
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.game.ragdoll.rockets.rightArm.toggleThrust(true);
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.game.ragdoll.rockets.leftLeg.toggleThrust(true);
                this.game.ragdoll.rockets.rightLeg.toggleThrust(true);
                break;
        }
    }

    handleKeyUp(event) {
        this.keys[event.code] = false;
        
        if (!this.game.ragdoll) return;

        switch(event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.game.ragdoll.rockets.head.toggleThrust(false);
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.game.ragdoll.rockets.leftArm.toggleThrust(false);
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.game.ragdoll.rockets.rightArm.toggleThrust(false);
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.game.ragdoll.rockets.leftLeg.toggleThrust(false);
                this.game.ragdoll.rockets.rightLeg.toggleThrust(false);
                break;
        }
    }

    isKeyDown(keyCode) {
        return !!this.keys[keyCode];
    }
} 
