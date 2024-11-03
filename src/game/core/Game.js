import { Engine, World, Runner } from 'matter-js';
import { Ragdoll } from './Ragdoll.js';
import { Camera } from './Camera.js';
import { GameStateManager } from './GameStateManager.js';
import { RenderManager } from './RenderManager.js';
import { WorldGenerator } from '../mechanics/WorldGenerator.js';
import { InputManager } from './InputManager.js';
import { Menu } from '../ui/Menu.js';
import { TrainingMode } from '../modes/TrainingMode.js';
import { ChallengeMode } from '../modes/ChallengeMode.js';
import { EndlessMode } from '../modes/EndlessMode.js';
import { LevelManager } from '../managers/LevelManager.js';
import { CollectibleManager } from '../managers/CollectibleManager.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.engine = Engine.create();
        this.runner = Runner.create();
        this.currentMode = null;
        this.levelManager = new LevelManager();
        
        this.initializeWorld();
        this.initializeManagers(canvas);
        
        Runner.run(this.runner, this.engine);
        requestAnimationFrame(() => this.gameLoop());
    }

    initializeWorld() {
        // Create world with gravity
        this.engine.world.gravity.y = 1;
        
        // Initialize world generator and ground
        this.worldGenerator = new WorldGenerator(this.canvas);
        this.worldGenerator.setupInitialGround(this.engine);
        
        // Create ragdoll
        const groundLevel = this.worldGenerator.getGroundLevel();
        this.setupRagdoll(0, groundLevel - 100);
    }

    initializeManagers(canvas) {
        this.stateManager = new GameStateManager();
        this.renderManager = new RenderManager(canvas, this.engine);
        this.inputManager = new InputManager(this);
        this.camera = new Camera(canvas, this.engine);
        this.collectibleManager = new CollectibleManager(this.engine);
        this.menu = new Menu(this);

        // Ensure render manager is properly initialized
        if (!this.renderManager.render) {
            console.error('RenderManager not properly initialized');
        }
    }

    setupRagdoll(x, y) {
        if (this.ragdoll) {
            // Clean up existing ragdoll if it exists
            World.remove(this.engine.world, this.ragdoll);
        }
        this.ragdoll = new Ragdoll(x, y);
        
        // Add all ragdoll parts to the world
        Object.values(this.ragdoll.parts).forEach(part => {
            World.add(this.engine.world, part);
        });
        
        // Add all constraints
        Object.values(this.ragdoll.constraints).forEach(constraint => {
            World.add(this.engine.world, constraint);
        });
    }

    startMode(modeName) {
        console.log(`Starting ${modeName} mode`);
        
        // Clean up previous mode if exists
        if (this.currentMode) {
            this.currentMode.cleanup();
        }

        // Initialize new mode
        switch(modeName) {
            case 'training':
                this.currentMode = new TrainingMode(this);
                const firstLevel = this.levelManager.loadLevel('training_1');
                if (firstLevel) {
                    this.currentMode.startLevel(firstLevel);
                }
                break;
            
            case 'challenge':
                this.currentMode = new ChallengeMode(this);
                break;
            
            case 'endless':
                this.currentMode = new EndlessMode(this);
                break;
            
            default:
                console.error('Unknown game mode:', modeName);
                return;
        }
    }

    update() {
        // Update camera position based on ragdoll
        if (this.ragdoll && this.ragdoll.parts.torso) {
            this.camera.follow(this.ragdoll.parts.torso.position);
        }

        // Update world generation
        if (this.worldGenerator) {
            this.worldGenerator.updateGround(this.camera);
        }

        // Update current game mode
        if (this.currentMode) {
            this.currentMode.update();
        }

        // Update ragdoll
        if (this.ragdoll) {
            this.ragdoll.update(this.particleSystem, this.camera);
        }
    }

    gameLoop() {
        this.update();
        
        // Clear the canvas
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Main render
        this.renderManager.render(this.camera);
        
        // Draw UI elements
        if (this.collectibleManager && this.ragdoll) {
            this.collectibleManager.drawDirectionalArrows(
                ctx,
                this.camera,
                this.ragdoll
            );
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
}
