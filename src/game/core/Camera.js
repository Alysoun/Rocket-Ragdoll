// Camera system 

export class Camera {
    constructor(canvas, engine) {
        this.canvas = canvas;
        this.engine = engine;
        this.x = 0;
        this.y = 0;
        this.smoothing = 0.1;
    }

    follow(target) {
        if (!target || !target.x || !target.y) {
            return;
        }

        // Smooth camera movement
        this.x += (target.x - this.x) * this.smoothing;
        this.y += (target.y - this.y) * this.smoothing;
    }

    // Convert world coordinates to screen coordinates
    worldToScreen(worldPos) {
        return {
            x: worldPos.x - this.x + this.canvas.width / 2,
            y: worldPos.y - this.y + this.canvas.height / 2
        };
    }

    // Convert screen coordinates to world coordinates (might be useful later)
    screenToWorld(screenPos) {
        return {
            x: screenPos.x + this.x - this.canvas.width / 2,
            y: screenPos.y + this.y - this.canvas.height / 2
        };
    }

    getRagdollPosition() {
        const ragdoll = this.engine.world.bodies.find(body => body.label === 'torso');
        if (!ragdoll) {
            return null;
        }
        return ragdoll.position;
    }

    getOffset() {
        return {
            x: this.x || 0,
            y: this.y || 0
        };
    }

    getTransform() {
        return {
            x: this.x || 0,
            y: this.y || 0,
            scale: 1,
            bounds: this.bounds
        };
    }

    applyToRender(render) {
        if (!render || !render.bounds) {
            console.warn('Invalid render object provided to camera');
            return;
        }

        // Update render bounds based on camera position
        render.bounds.min.x = this.x;
        render.bounds.min.y = this.y;
        render.bounds.max.x = this.x + this.canvas.width;
        render.bounds.max.y = this.y + this.canvas.height;
    }
} 
