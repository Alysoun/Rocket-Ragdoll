export class Camera {
    constructor(options = {}) {
        this.x = 0;
        this.y = 0;
        this.scale = 1;
        this.followSpeed = options.followSpeed || 0.05;
        this.bounds = options.bounds || {
            min: { x: -10000, y: -10000 },
            max: { x: 10000, y: 10000 }
        };
        this.canvas = options.canvas;
    }

    follow(target) {
        if (!target) return;
        
        // Smooth camera movement
        this.x += (target.x - this.x) * this.followSpeed;
        this.y += (target.y - this.y) * this.followSpeed;

        // Clamp to bounds
        const margin = 1000;
        this.x = Math.max(this.bounds.min.x + margin, Math.min(this.bounds.max.x - margin, this.x));
        this.y = Math.max(this.bounds.min.y + margin, Math.min(this.bounds.max.y - margin, this.y));
    }

    updateRender(render, canvas) {
        const viewWidth = (canvas.width / this.scale);
        const viewHeight = (canvas.height / this.scale);

        render.bounds.min.x = this.x - viewWidth/2;
        render.bounds.min.y = this.y - viewHeight/2;
        render.bounds.max.x = this.x + viewWidth/2;
        render.bounds.max.y = this.y + viewHeight/2;
    }
} 