import { Bodies, World, Composite } from 'matter-js';

export class WorldGenerator {
    constructor(canvas) {
        this.canvas = canvas;
        this.engine = null;
        this.groundSegments = new Map();
        this.segmentWidth = 800;
        this.segmentHeight = 60;
        this.groundLevel = canvas.height - 100;
        this.currentLeftmost = -5000;
        this.currentRightmost = 5000;
        this.bufferZone = 2000;
    }

    setupInitialGround(engine) {
        this.engine = engine;
        for (let x = -5000; x <= 5000; x += this.segmentWidth) {
            this.createGroundSegment(x);
        }
    }

    createGroundSegment(x) {
        const segment = Bodies.rectangle(
            x,
            this.groundLevel,
            this.segmentWidth,
            this.segmentHeight,
            {
                isStatic: true,
                friction: 0.8,
                render: {
                    fillStyle: '#222'
                },
                label: 'ground'
            }
        );

        World.add(this.engine.world, segment);
        this.groundSegments.set(x, segment);
    }

    updateGround(camera) {
        if (!camera || !this.engine) return;

        const viewportLeft = camera.x - this.canvas.width;
        const viewportRight = camera.x + this.canvas.width;

        while (this.currentRightmost < viewportRight + this.bufferZone) {
            this.createGroundSegment(this.currentRightmost + this.segmentWidth);
            this.currentRightmost += this.segmentWidth;
        }

        while (this.currentLeftmost > viewportLeft - this.bufferZone) {
            this.createGroundSegment(this.currentLeftmost - this.segmentWidth);
            this.currentLeftmost -= this.segmentWidth;
        }

        this.groundSegments.forEach((segment, x) => {
            if (x < viewportLeft - this.bufferZone * 2 || 
                x > viewportRight + this.bufferZone * 2) {
                World.remove(this.engine.world, segment);
                this.groundSegments.delete(x);
            }
        });

        console.log('Ground segments:', this.groundSegments.size);
    }

    getGroundLevel() {
        return this.groundLevel;
    }
} 