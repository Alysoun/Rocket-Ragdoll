import { Vector, Body } from 'matter-js';

export class Rocket {
    constructor(bodyPart, thrustPower = 0.015) {
        this.bodyPart = bodyPart;
        this.baseThrustPower = thrustPower;
        this.thrustPower = thrustPower;
        this.isActive = false;
        this.thrustMultiplier = 1;
        
        // Store the attachment point relative to the body part
        this.attachPoint = {
            x: 0,
            y: bodyPart.bounds.max.y - bodyPart.bounds.min.y,  // Attach at bottom of part
        };
    }

    activate() {
        console.log('Rocket activated'); // Debug log
        this.isActive = true;
    }

    deactivate() {
        console.log('Rocket deactivated'); // Debug log
        this.isActive = false;
    }

    update() {
        if (this.isActive) {
            // Gradually increase thrust while active for better control
            this.thrustMultiplier = Math.min(this.thrustMultiplier * 1.1, 2.5);  // Faster ramp-up, higher max
            
            const angle = this.bodyPart.angle;
            const force = Vector.create(
                Math.cos(angle + Math.PI) * this.thrustPower * this.thrustMultiplier,
                Math.sin(angle + Math.PI) * this.thrustPower * this.thrustMultiplier
            );
            
            Body.applyForce(this.bodyPart, this.bodyPart.position, force);
            console.log('Applying force:', force); // Debug log
        } else {
            this.thrustMultiplier = 1;
        }
    }

    getPosition() {
        const angle = this.bodyPart.angle;
        return {
            x: this.bodyPart.position.x + (Math.cos(angle) * this.attachPoint.x - Math.sin(angle) * this.attachPoint.y),
            y: this.bodyPart.position.y + (Math.sin(angle) * this.attachPoint.x + Math.cos(angle) * this.attachPoint.y)
        };
    }
}
