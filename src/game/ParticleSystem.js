export class ParticleSystem {
    constructor(options = {}) {
        this.maxParticles = options.maxParticles || 100;
        this.particles = [];
    }

    createParticle(x, y, angle, color = '#ff6600') {
        if (this.particles.length > this.maxParticles) {
            this.particles.splice(0, 10);
        }

        const speed = 3 + Math.random() * 2;
        const spread = 0.3;

        this.particles.push({
            x,
            y,
            vx: Math.cos(angle + Math.PI + (Math.random() - 0.5) * spread) * speed,
            vy: Math.sin(angle + Math.PI + (Math.random() - 0.5) * spread) * speed,
            life: 1.0,
            color: '#ff8833',
            size: 4 + Math.random() * 3
        });
    }

    update(context) {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.02;
            
            if (particle.life > 0) {
                context.globalAlpha = Math.min(1, particle.life * 1.5);
                context.fillStyle = particle.color;
                context.beginPath();
                context.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
                context.fill();
            }
            
            return particle.life > 0;
        });
    }

    clear() {
        this.particles = [];
    }
} 