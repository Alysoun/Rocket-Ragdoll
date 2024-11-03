import { Bodies, Constraint, Body } from 'matter-js';

export class Ragdoll {
    constructor(x, y, scale = 1) {
        this.parts = {};
        this.constraints = {};
        
        // Create torso first
        this.parts.torso = Bodies.rectangle(x, y, 40 * scale, 60 * scale, {
            render: { fillStyle: '#ffffff' }
        });

        // Create head
        this.parts.head = Bodies.circle(x, y - 40 * scale, 20 * scale, {
            render: { fillStyle: '#ffffff' }
        });

        // Create limbs
        this.parts.leftArm = Bodies.rectangle(x - 30 * scale, y - 20 * scale, 40 * scale, 15 * scale, {
            render: { fillStyle: '#ffffff' }
        });
        
        this.parts.rightArm = Bodies.rectangle(x + 30 * scale, y - 20 * scale, 40 * scale, 15 * scale, {
            render: { fillStyle: '#ffffff' }
        });
        
        this.parts.leftLeg = Bodies.rectangle(x - 15 * scale, y + 40 * scale, 15 * scale, 40 * scale, {
            render: { fillStyle: '#ffffff' }
        });
        
        this.parts.rightLeg = Bodies.rectangle(x + 15 * scale, y + 40 * scale, 15 * scale, 40 * scale, {
            render: { fillStyle: '#ffffff' }
        });

        // Create constraints after all parts exist
        this.createConstraints(scale);
    }

    createConstraints(scale) {
        // Head to torso
        this.constraints.neck = Constraint.create({
            bodyA: this.parts.head,
            bodyB: this.parts.torso,
            pointA: { x: 0, y: 20 * scale },
            pointB: { x: 0, y: -30 * scale },
            stiffness: 0.5,
            render: { visible: false }
        });

        // Arms to torso
        this.constraints.leftShoulder = Constraint.create({
            bodyA: this.parts.leftArm,
            bodyB: this.parts.torso,
            pointA: { x: 20 * scale, y: 0 },
            pointB: { x: -20 * scale, y: -20 * scale },
            stiffness: 0.5,
            render: { visible: false }
        });

        this.constraints.rightShoulder = Constraint.create({
            bodyA: this.parts.rightArm,
            bodyB: this.parts.torso,
            pointA: { x: -20 * scale, y: 0 },
            pointB: { x: 20 * scale, y: -20 * scale },
            stiffness: 0.5,
            render: { visible: false }
        });

        // Legs to torso
        this.constraints.leftHip = Constraint.create({
            bodyA: this.parts.leftLeg,
            bodyB: this.parts.torso,
            pointA: { x: 0, y: -20 * scale },
            pointB: { x: -15 * scale, y: 30 * scale },
            stiffness: 0.5,
            render: { visible: false }
        });

        this.constraints.rightHip = Constraint.create({
            bodyA: this.parts.rightLeg,
            bodyB: this.parts.torso,
            pointA: { x: 0, y: -20 * scale },
            pointB: { x: 15 * scale, y: 30 * scale },
            stiffness: 0.5,
            render: { visible: false }
        });
    }

    getAllParts() {
        return Object.values(this.parts);
    }

    getAllConstraints() {
        return Object.values(this.constraints);
    }

    getCenter() {
        return this.parts.torso.position;
    }
}
