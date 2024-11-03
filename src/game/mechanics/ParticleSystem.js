export class ParticleSystem {
    constructor(camera, canvas) {
        this.camera = camera;
        this.canvas = canvas;
        this.particles = [];
    }

    worldToScreen(worldX, worldY) {
        if (!this.camera || typeof worldX !== 'number' || typeof worldY !== 'number') {
            console.warn('Invalid parameters for worldToScreen conversion:', { worldX, worldY });
            return { x: 0, y: 0 };
        }

        const cameraOffset = this.camera.getOffset();
        return {
            x: worldX - cameraOffset.x,
            y: worldY - cameraOffset.y
        };
    }

    emitRocketParticles(x, y, angle, color) {
        if (typeof x !== 'number' || typeof y !== 'number') {
            console.warn('Invalid coordinates for particle emission:', { x, y });
            return;
        }

        const screenPos = this.worldToScreen(x, y);
        
        // Create new particle
        const particle = {
            x: screenPos.x,
            y: screenPos.y,
            angle: angle,
            speed: Math.random() * 2 + 1,
            life: 1.0,
            color: color || '#FF5722'
        };

        this.particles.push(particle);
    }

    update(transform) {
        // Update existing particles
        this.particles = this.particles.filter(particle => {
            // Update particle position
            particle.x += Math.cos(particle.angle) * particle.speed;
            particle.y += Math.sin(particle.angle) * particle.speed;
            
            // Decrease life
            particle.life -= 0.016; // Roughly 60fps
            
            // Keep particle if still alive
            return particle.life > 0;
        });
    }

    render(ctx) {
        this.particles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }
}