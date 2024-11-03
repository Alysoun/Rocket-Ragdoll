import { Render } from 'matter-js';

export class RenderManager {
    constructor(canvas, engine) {
        this.canvas = canvas;
        this.engine = engine;
        this.ctx = canvas.getContext('2d');
    }

    render(camera) {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save the current context state
        this.ctx.save();
        
        // Apply camera transform
        if (camera) {
            this.ctx.translate(
                this.canvas.width / 2 - camera.x,
                this.canvas.height / 2 - camera.y
            );
        }

        // Render world bodies
        const bodies = this.engine.world.bodies;
        bodies.forEach(body => {
            this.renderBody(body);
        });

        // Restore the context state
        this.ctx.restore();
    }

    renderBody(body) {
        const vertices = body.vertices;
        
        this.ctx.beginPath();
        this.ctx.moveTo(vertices[0].x, vertices[0].y);
        
        for (let i = 1; i < vertices.length; i++) {
            this.ctx.lineTo(vertices[i].x, vertices[i].y);
        }
        
        this.ctx.lineTo(vertices[0].x, vertices[0].y);
        
        this.ctx.fillStyle = body.render.fillStyle || '#fff';
        this.ctx.fill();
        this.ctx.strokeStyle = '#000';
        this.ctx.stroke();
    }
} 