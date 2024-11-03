import { Bodies, Body, Vector } from 'matter-js';

export class Collectible {
    constructor(x, y) {
        this.body = Bodies.circle(x, y, 15, {
            isSensor: true,  // Makes it non-solid
            isStatic: true,  // Keeps it in place
            render: {
                fillStyle: '#FFD700',
                strokeStyle: '#FFA500',
                lineWidth: 2
            },
            label: 'collectible'
        });
        
        this.pulsePhase = Math.random() * Math.PI * 2; // Random starting phase
        this.collected = false;
        this.value = 100;  // Points value
    }

    update(time) {
        if (this.collected) return;

        // Make it pulse
        const scale = 1 + Math.sin(time * 0.005 + this.pulsePhase) * 0.1;
        Body.scale(this.body, scale, scale);
    }

    collect() {
        if (this.collected) return;
        this.collected = true;
        this.body.render.fillStyle = '#FFFFFF';
        return this.value;
    }
} 