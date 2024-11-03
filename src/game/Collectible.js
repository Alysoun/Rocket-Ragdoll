import { Bodies, Body } from 'matter-js';

export class Collectible {
    constructor(x, y, type = 'coin') {
        this.type = type;
        this.collected = false;
        
        const options = {
            isSensor: true,
            isStatic: false,
            render: {
                fillStyle: type === 'coin' ? '#FFD700' : '#FF00FF',
                strokeStyle: 'transparent'
            },
            collisionFilter: {
                category: 0x0002,
                mask: 0x0001
            }
        };

        this.body = Bodies.circle(x, y, type === 'coin' ? 15 : 25, options);
        this.body.collectible = this;
        
        // Add floating animation
        this.originalY = y;
        this.floatOffset = 0;
    }

    update() {
        if (this.collected) return;
        
        // Floating animation
        this.floatOffset += 0.05;
        const newY = this.originalY + Math.sin(this.floatOffset) * 10;
        Body.setPosition(this.body, {
            x: this.body.position.x,
            y: newY
        });
        
        // Rotation
        Body.setAngle(this.body, this.body.angle + 0.02);
    }
} 