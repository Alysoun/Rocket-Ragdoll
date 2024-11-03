import { World, Events } from 'matter-js';
import { Collectible } from '../mechanics/Collectible.js';

export class CollectibleManager {
    constructor(engine, ragdoll) {
        this.engine = engine;
        this.ragdoll = ragdoll;
        this.collectibles = new Set();
        this.score = 0;
        this.setupCollisionEvents();
    }

    setupCollisionEvents() {
        Events.on(this.engine, 'collisionStart', (event) => {
            event.pairs.forEach((pair) => {
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;
                
                // Check if either body is a collectible and the other is part of the ragdoll
                if (bodyA.label === 'collectible' || bodyB.label === 'collectible') {
                    const collectible = this.findCollectibleByBody(
                        bodyA.label === 'collectible' ? bodyA : bodyB
                    );
                    
                    if (collectible && !collectible.collected) {
                        this.score += collectible.collect();
                        console.log('🌟 Score:', this.score);
                        
                        // Remove after a short delay for collection animation
                        setTimeout(() => {
                            World.remove(this.engine.world, collectible.body);
                            this.collectibles.delete(collectible);
                        }, 500);
                    }
                }
            });
        });
    }

    findCollectibleByBody(body) {
        return Array.from(this.collectibles).find(c => c.body === body);
    }

    spawnCollectible(x, y) {
        const collectible = new Collectible(x, y);
        World.add(this.engine.world, collectible.body);
        this.collectibles.add(collectible);
        return collectible;
    }

    update(time, camera) {
        this.collectibles.forEach(collectible => collectible.update(time));
        this.drawDirectionalArrows(camera);
    }

    getScore() {
        return this.score;
    }

    clearAll() {
        // Remove all collectibles from the world and clear the set
        this.collectibles.forEach(collectible => {
            World.remove(this.engine.world, collectible.body);
        });
        this.collectibles.clear();
        console.log('🧹 Cleared all collectibles');
    }

    resetScore() {
        this.score = 0;
        console.log('🔄 Score reset to 0');
    }

    getCollectedCount() {
        // Return how many collectibles have been collected this session
        return this.score;
    }

    getRemainingCount() {
        // Return how many collectibles are still in the world
        return this.collectibles.size;
    }

    drawDirectionalArrows(ctx, camera, ragdoll) {
        if (!ragdoll || !ragdoll.parts || !ragdoll.parts.torso) return;

        const playerPos = ragdoll.parts.torso.position;
        const screenCenter = {
            x: camera.canvas.width / 2,
            y: camera.canvas.height / 2
        };
        
        this.collectibles.forEach(collectible => {
            // Calculate direction to collectible
            const dx = collectible.body.position.x - playerPos.x;
            const dy = collectible.body.position.y - playerPos.y;
            const angle = Math.atan2(dy, dx);
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Draw arrow
            ctx.save();
            
            // Position arrow at edge of screen when collectible is off-screen
            const arrowRadius = 100; // Distance from screen center to arrow
            const screenX = screenCenter.x + Math.cos(angle) * arrowRadius;
            const screenY = screenCenter.y + Math.sin(angle) * arrowRadius;
            
            ctx.translate(screenX, screenY);
            ctx.rotate(angle);

            // Draw pulsing arrow
            ctx.beginPath();
            ctx.moveTo(-20, -15);  // Arrow base left
            ctx.lineTo(20, 0);     // Arrow tip
            ctx.lineTo(-20, 15);   // Arrow base right
            ctx.closePath();
            
            // Pulse effect based on distance
            const opacity = 0.5 + 0.5 * Math.sin(Date.now() / 500);
            ctx.fillStyle = `rgba(255, 235, 59, ${opacity})`;
            ctx.fill();
            
            // Distance indicator
            if (distance > 200) {
                ctx.rotate(-angle); // Reset rotation for text
                ctx.font = 'bold 16px Arial';
                ctx.fillStyle = '#ffeb3b';
                ctx.fillText(`${Math.round(distance)}`, 25, 0);
            }
            
            ctx.restore();
        });
    }
} 