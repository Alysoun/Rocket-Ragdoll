import { 
    Engine, 
    Render, 
    World, 
    Runner, 
    Events, 
    Bodies,
    Composite,
    Body,
    Vector,
    MouseConstraint,
    Mouse
} from 'matter-js';
import { Camera } from './Camera';
import { ParticleSystem } from './ParticleSystem';
import { ScoreSystem } from './ScoreSystem';
import { UI } from './UI';
import { Ragdoll } from './Ragdoll';
import { Rocket } from './Rocket';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        
        // Initialize game state first
        this.gameState = {
            current: 'SETUP',
            started: false,
            selectedPart: null,
            mouseConstraint: null
        };

        // Define world bounds
        this.worldBounds = {
            min: { x: -10000, y: -10000 },
            max: { x: 10000, y: 10000 }
        };

        // Initialize engine
        this.engine = Engine.create({
            enableSleeping: false,
            constraintIterations: 4,
            velocityIterations: 8,
            positionIterations: 6
        });

        // Create runner
        this.runner = Runner.create();

        // Initialize camera
        this.camera = new Camera({
            followSpeed: 0.05,
            bounds: this.worldBounds
        });

        // Initialize systems
        this.particles = new ParticleSystem({ maxParticles: 50 });
        this.scoreSystem = new ScoreSystem();
        this.ui = new UI();
        
        // Track terrain chunks
        this.terrainChunks = new Map();
        this.chunkSize = 800;
        this.visibleChunks = 3;
        this.floorY = 590;

        // Initialize first set of chunks
        for (let x = -this.visibleChunks; x <= this.visibleChunks; x++) {
            this.generateTerrainChunk(x);
        }

        // Setup the game world and event listeners
        this.setupRenderer();
        this.setupWorld();
        this.setupEventListeners();
    }

    setupRenderer() {
        this.render = Render.create({
            canvas: this.canvas,
            engine: this.engine,
            options: {
                width: 800,
                height: 600,
                wireframes: false,
                background: '#1b1b1b',
                showAngleIndicator: false
            }
        });
    }

    setupWorld() {
        // Create ragdoll in ready stance
        this.ragdoll = new Ragdoll(400, this.floorY - 200);
        
        World.add(this.engine.world, [
            ...this.ragdoll.getAllParts(),
            ...this.ragdoll.getAllConstraints()
        ]);

        // Create rockets
        this.rockets = {
            head: new Rocket(this.ragdoll.parts.head, 0.015),
            leftArm: new Rocket(this.ragdoll.parts.leftArm, 0.012),
            rightArm: new Rocket(this.ragdoll.parts.rightArm, 0.012),
            leftLeg: new Rocket(this.ragdoll.parts.leftLeg, 0.012),
            rightLeg: new Rocket(this.ragdoll.parts.rightLeg, 0.012)
        };

        // Set initial ragdoll stance
        this.setRagdollReadyStance();
    }

    setRagdollReadyStance() {
        if (!this.ragdoll || !this.ragdoll.parts.torso) {
            console.error('Ragdoll not properly initialized');
            return;
        }

        // Make parts moveable but with very low gravity
        Object.values(this.ragdoll.parts).forEach(part => {
            Body.setStatic(part, false);
            part.plugin = part.plugin || {};
            // Reduce friction and air resistance for easier positioning
            part.friction = 0.1;
            part.frictionAir = 0.01;
        });

        // Set very low gravity for setup phase
        this.engine.world.gravity.y = 0.001;

        // Set initial pose
        this.resetToDefaultPose();

        // Add instructions to UI
        this.ui.showSetupInstructions();
    }

    resetToDefaultPose() {
        const baseY = this.floorY - 200;
        const baseX = this.ragdoll.parts.torso.position.x;

        // Reset to perfect standing pose
        const poses = {
            torso: { x: baseX, y: baseY, angle: 0 },
            head: { x: baseX, y: baseY - 40, angle: 0 },
            leftArm: { x: baseX - 30, y: baseY - 20, angle: -Math.PI / 4 },
            rightArm: { x: baseX + 30, y: baseY - 20, angle: Math.PI / 4 },
            leftLeg: { x: baseX - 15, y: baseY + 40, angle: 0 },
            rightLeg: { x: baseX + 15, y: baseY + 40, angle: 0 }
        };

        // Apply poses with proper physics handling
        Object.entries(poses).forEach(([partName, pose]) => {
            const part = this.ragdoll.parts[partName];
            if (part) {
                Body.setPosition(part, { x: pose.x, y: pose.y });
                Body.setAngle(part, pose.angle);
                Body.setVelocity(part, { x: 0, y: 0 });
                Body.setAngularVelocity(part, 0);
            }
        });
    }

    setupEventListeners() {
        // Create mouse and constraint
        const mouse = Mouse.create(this.canvas);
        const mouseConstraint = MouseConstraint.create(this.engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: true
                }
            }
        });

        this.mouse = mouse;
        this.mouseConstraint = mouseConstraint;

        // Only add mouse constraint during SETUP phase
        World.add(this.engine.world, mouseConstraint);

        // Space bar to start game
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.gameState.current === 'SETUP') {
                e.preventDefault();
                this.startGame();
            } else if (e.code === 'KeyR' && this.gameState.current === 'SETUP') {
                e.preventDefault();
                this.resetToDefaultPose();
            }
        });

        // Prevent default canvas click during setup
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.gameState.current === 'SETUP') {
                e.preventDefault();
                return;
            }
            // Handle rocket clicks only during PLAYING state
            if (this.gameState.current === 'PLAYING') {
                const worldPoint = this.screenToWorld(e.offsetX, e.offsetY);
                Object.entries(this.ragdoll.parts).forEach(([partName, part]) => {
                    if (this.rockets[partName] && this.isPointInBody(worldPoint, part)) {
                        this.rockets[partName].activate();
                    }
                });
            }
        });

        // Rocket controls only work after game starts
        document.addEventListener('keydown', (e) => {
            if (this.gameState.current !== 'PLAYING') return;

            switch(e.key.toLowerCase()) {
                case 'w':
                    this.rockets.head?.activate();
                    break;
                case 'a':
                    this.rockets.leftArm?.activate();
                    break;
                case 'd':
                    this.rockets.rightArm?.activate();
                    break;
                case 'z':
                    this.rockets.leftLeg?.activate();
                    break;
                case 'c':
                    this.rockets.rightLeg?.activate();
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (this.gameState.current !== 'PLAYING') return;

            switch(e.key.toLowerCase()) {
                case 'w':
                    this.rockets.head?.deactivate();
                    break;
                case 'a':
                    this.rockets.leftArm?.deactivate();
                    break;
                case 'd':
                    this.rockets.rightArm?.deactivate();
                    break;
                case 'z':
                    this.rockets.leftLeg?.deactivate();
                    break;
                case 'c':
                    this.rockets.rightLeg?.deactivate();
                    break;
            }
        });

        // Mouse controls
        this.canvas.addEventListener('mousedown', (e) => {
            // Start game on first rocket activation
            if (!this.gameState.started) {
                this.startGame();
            }

            const mousePosition = {
                x: e.offsetX,
                y: e.offsetY
            };
            
            Object.entries(this.ragdoll.parts).forEach(([partName, part]) => {
                if (this.rockets[partName] && this.isPointInBody(mousePosition, part)) {
                    this.rockets[partName].activate();
                }
            });
        });

        this.canvas.addEventListener('mouseup', () => {
            Object.values(this.rockets).forEach(rocket => rocket.deactivate());
        });

        // Mouse wheel zoom
        window.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.camera.scale = Math.max(0.5, Math.min(2, this.camera.scale - e.deltaY * 0.001));
        }, { passive: false });
    }

    isPointInBody(point, body) {
        const dx = point.x - body.position.x;
        const dy = point.y - body.position.y;
        return Math.sqrt(dx * dx + dy * dy) < 30;
    }

    generateTerrainChunk(chunkX) {
        if (this.terrainChunks.has(chunkX)) return;

        const chunkObjects = [];
        const chunkStartX = chunkX * this.chunkSize;

        // Create floor segment for this chunk
        const floorSegment = Bodies.rectangle(
            chunkStartX + this.chunkSize/2, // Center of chunk
            this.floorY,
            this.chunkSize + 2, // Slightly overlap to prevent gaps
            60,
            {
                isStatic: true,
                render: {
                    fillStyle: '#2c2c2c'
                },
                friction: 0.8,
                label: 'floor'
            }
        );
        chunkObjects.push(floorSegment);

        // Generate platforms at various heights
        const heights = [-500, -400, -300, -200];
        for (let i = 0; i < 2; i++) {
            const height = heights[Math.floor(Math.random() * heights.length)];
            const platform = Bodies.rectangle(
                chunkStartX + Math.random() * this.chunkSize,
                this.floorY + height,
                100 + Math.random() * 200,
                20,
                {
                    isStatic: true,
                    render: {
                        fillStyle: '#2c2c2c'
                    },
                    friction: 0.8,
                    label: 'platform'
                }
            );
            chunkObjects.push(platform);
        }

        // Add bouncy obstacles at various heights
        if (Math.random() < 0.7) {
            const height = heights[Math.floor(Math.random() * heights.length)];
            const bouncer = Bodies.circle(
                chunkStartX + Math.random() * this.chunkSize,
                this.floorY + height,
                30,
                {
                    isStatic: true,
                    restitution: 1.2,
                    render: {
                        fillStyle: '#663399'
                    },
                    label: 'bouncer'
                }
            );
            chunkObjects.push(bouncer);
        }

        this.terrainChunks.set(chunkX, chunkObjects);
        World.add(this.engine.world, chunkObjects);
    }

    removeTerrainChunk(chunkX) {
        const chunk = this.terrainChunks.get(chunkX);
        if (chunk) {
            chunk.forEach(object => {
                World.remove(this.engine.world, object);
            });
            this.terrainChunks.delete(chunkX);
        }
    }

    updateTerrain() {
        const centerChunkX = Math.floor(this.camera.x / this.chunkSize);

        // Generate new chunks in view range
        for (let x = -this.visibleChunks; x <= this.visibleChunks; x++) {
            this.generateTerrainChunk(centerChunkX + x);
        }

        // Remove chunks that are too far away
        for (const chunkX of this.terrainChunks.keys()) {
            if (Math.abs(chunkX - centerChunkX) > this.visibleChunks + 1) {
                this.removeTerrainChunk(chunkX);
            }
        }
    }

    update() {
        const center = this.ragdoll.getCenter();
        
        // Update terrain generation
        const currentChunkX = Math.floor(center.x / this.chunkSize);
        
        // Generate more chunks ahead in movement direction
        const extraChunksAhead = 2;
        const movementDirection = this.ragdoll.parts.torso.velocity.x > 0 ? 1 : -1;
        
        // Generate chunks with extra buffer in movement direction
        for (let x = currentChunkX - this.visibleChunks; 
             x <= currentChunkX + this.visibleChunks + (extraChunksAhead * movementDirection); 
             x++) {
            if (!this.terrainChunks.has(x)) {
                this.generateTerrainChunk(x);
            }
        }

        // Clean up far chunks
        for (const [chunkX, chunk] of this.terrainChunks.entries()) {
            if (Math.abs(chunkX - currentChunkX) > this.visibleChunks + extraChunksAhead) {
                chunk.forEach(body => World.remove(this.engine.world, body));
                this.terrainChunks.delete(chunkX);
            }
        }

        // Update camera with lookahead
        const lookaheadX = center.x + (this.ragdoll.parts.torso.velocity.x * 100);
        const cameraTarget = {
            x: lookaheadX,
            y: center.y
        };
        this.camera.follow(cameraTarget);

        // Reset if fallen too far
        if (center.y > this.floorY + 1000) {
            this.resetRagdoll();
        }

        // Only update physics if game has started
        if (this.gameState.current === 'PLAYING') {
            // Apply camera transform to render
            Render.lookAt(this.render, {
                min: { 
                    x: this.camera.x - (this.canvas.width / 2) / this.camera.scale,
                    y: this.camera.y - (this.canvas.height / 2) / this.camera.scale
                },
                max: { 
                    x: this.camera.x + (this.canvas.width / 2) / this.camera.scale,
                    y: this.camera.y + (this.canvas.height / 2) / this.camera.scale
                }
            });

            // Update rockets and particles
            Object.values(this.rockets).forEach(rocket => {
                rocket.update();
                if (rocket.isActive) {
                    // Create multiple particles per frame for better effect
                    for (let i = 0; i < 3; i++) {
                        const pos = rocket.getPosition();
                        if (pos) {
                            // Adjust particle position based on camera
                            this.particles.createParticle(
                                pos.x,
                                pos.y,
                                rocket.bodyPart.angle,
                                '#ff6600',
                                this.camera  // Pass camera for position adjustment
                            );
                        }
                    }
                }
            });

            // Update particles with camera transform
            const context = this.render.context;
            context.save();
            context.scale(this.camera.scale, this.camera.scale);
            context.translate(-this.camera.x + this.canvas.width/2/this.camera.scale, 
                             -this.camera.y + this.canvas.height/2/this.camera.scale);
            this.particles.update(context);
            context.restore();

            // Update score system with better rotation detection
            const parts = this.ragdoll.getAllParts();
            let isAirborne = true;
            let totalRotationSpeed = 0;

            parts.forEach(part => {
                if (part.position.y > this.floorY - 30) {
                    isAirborne = false;
                }
                // Increase rotation sensitivity
                totalRotationSpeed += Math.abs(part.angularVelocity) * 10; // Multiplied for better detection
            });

            // Update score with rotation info
            this.scoreSystem.setAirborne(isAirborne);
            this.scoreSystem.updateMultiplier(totalRotationSpeed);
            
            if (totalRotationSpeed > 1) {
                console.log('Rotation detected:', totalRotationSpeed); // Debug log
            }

            this.scoreSystem.update();
            this.ui.update(this.scoreSystem);
        }

        // Always update camera and rendering
        this.camera.follow(this.ragdoll.getCenter());
        this.camera.updateRender(this.render, this.canvas);
    }

    resetRagdoll() {
        // Remove old ragdoll
        this.ragdoll.getAllParts().forEach(part => {
            World.remove(this.engine.world, part);
        });
        
        // Create new ragdoll at reset position
        this.ragdoll = new Ragdoll(400, this.floorY - 200);
        World.add(this.engine.world, [
            ...this.ragdoll.getAllParts(),
            ...this.ragdoll.getAllConstraints()
        ]);

        // Reset rockets
        this.rockets = {
            head: new Rocket(this.ragdoll.parts.head, 0.015),
            leftArm: new Rocket(this.ragdoll.parts.leftArm, 0.012),
            rightArm: new Rocket(this.ragdoll.parts.rightArm, 0.012),
            leftLeg: new Rocket(this.ragdoll.parts.leftLeg, 0.012),
            rightLeg: new Rocket(this.ragdoll.parts.rightLeg, 0.012)
        };

        // Add mouse constraint back for setup
        World.add(this.engine.world, this.mouseConstraint);
        
        this.setRagdollReadyStance();
    }

    startGame() {
        if (this.gameState.current !== 'SETUP') return;

        // Remove mouse constraint
        if (this.mouseConstraint) {
            World.remove(this.engine.world, this.mouseConstraint);
        }
        
        // Reset gravity to normal
        this.engine.world.gravity.y = 1;
        
        // Remove any residual velocity from setup
        Object.values(this.ragdoll.parts).forEach(part => {
            Body.setVelocity(part, { x: 0, y: 0 });
            Body.setAngularVelocity(part, 0);
        });

        this.gameState.current = 'PLAYING';
        this.gameState.started = true;

        // Hide setup instructions
        this.ui.hideSetupInstructions();
    }

    start() {
        // Start the physics engine
        Runner.run(this.runner, this.engine);
        
        // Start the renderer
        Render.run(this.render);
        
        // Start the game loop
        const gameLoop = () => {
            this.update();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }

    screenToWorld(screenX, screenY) {
        const canvasBounds = this.canvas.getBoundingClientRect();
        const worldX = (screenX - canvasBounds.width/2) / this.camera.scale + this.camera.x;
        const worldY = (screenY - canvasBounds.height/2) / this.camera.scale + this.camera.y;
        return { x: worldX, y: worldY };
    }
}
