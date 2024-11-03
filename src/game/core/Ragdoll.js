import { Bodies, Constraint, Body } from 'matter-js';
import { Rocket } from '../mechanics/Rocket.js';

export class Ragdoll {
    constructor(x, y) {
        // Debug initial position
        console.log('Creating ragdoll at:', { x, y });

        // Body parts
        this.parts = {
            torso: Bodies.rectangle(x, y, 40, 60, {
                render: { fillStyle: '#3498db' },
                label: 'torso'  // Add labels for debugging
            }),
            head: Bodies.circle(x, y - 45, 15, {
                render: { fillStyle: '#e74c3c' },
                label: 'head'
            }),
            leftArm: Bodies.rectangle(x - 30, y - 10, 40, 10, {
                render: { fillStyle: '#2ecc71' },
                label: 'leftArm'
            }),
            rightArm: Bodies.rectangle(x + 30, y - 10, 40, 10, {
                render: { fillStyle: '#2ecc71' },
                label: 'rightArm'
            }),
            leftLeg: Bodies.rectangle(x - 15, y + 40, 15, 40, {
                render: { fillStyle: '#f1c40f' },
                label: 'leftLeg'
            }),
            rightLeg: Bodies.rectangle(x + 15, y + 40, 15, 40, {
                render: { fillStyle: '#f1c40f' },
                label: 'rightLeg'
            })
        };

        // Debug body parts creation
        Object.entries(this.parts).forEach(([name, part]) => {
            console.log(`Created ${name}:`, {
                position: part.position,
                id: part.id
            });
        });

        // Constraints (joints)
        this.constraints = {
            neck: Constraint.create({
                bodyA: this.parts.head,
                bodyB: this.parts.torso,
                pointA: { x: 0, y: 15 },
                pointB: { x: 0, y: -25 },
                stiffness: 0.6,
                render: { visible: false }
            }),
            leftShoulder: Constraint.create({
                bodyA: this.parts.leftArm,
                bodyB: this.parts.torso,
                pointA: { x: 15, y: 0 },
                pointB: { x: -20, y: -15 },
                stiffness: 0.6,
                render: { visible: false }
            }),
            rightShoulder: Constraint.create({
                bodyA: this.parts.rightArm,
                bodyB: this.parts.torso,
                pointA: { x: -15, y: 0 },
                pointB: { x: 20, y: -15 },
                stiffness: 0.6,
                render: { visible: false }
            }),
            leftHip: Constraint.create({
                bodyA: this.parts.leftLeg,
                bodyB: this.parts.torso,
                pointA: { x: 0, y: -15 },
                pointB: { x: -15, y: 25 },
                stiffness: 0.6,
                render: { visible: false }
            }),
            rightHip: Constraint.create({
                bodyA: this.parts.rightLeg,
                bodyB: this.parts.torso,
                pointA: { x: 0, y: -15 },
                pointB: { x: 15, y: 25 },
                stiffness: 0.6,
                render: { visible: false }
            })
        };

        // Add rockets to each limb
        this.rockets = {
            leftLeg: new Rocket(this.parts.leftLeg, { x: 0, y: 20 }, -Math.PI/2),
            rightLeg: new Rocket(this.parts.rightLeg, { x: 0, y: 20 }, -Math.PI/2),
            leftArm: new Rocket(this.parts.leftArm, { x: -15, y: 0 }, -Math.PI),
            rightArm: new Rocket(this.parts.rightArm, { x: 15, y: 0 }, 0),
            head: new Rocket(this.parts.head, { x: 0, y: -10 }, -Math.PI/2)
        };

        // Debug rocket creation
        Object.entries(this.rockets).forEach(([name, rocket]) => {
            console.log(`Created rocket for ${name}:`, {
                bodyPart: rocket.bodyPart?.label,
                position: rocket.bodyPart?.position
            });
        });
    }

    update(particleSystem, camera) {
        if (!this.parts.torso?.position) {
            console.error('Invalid torso position in update');
            return;
        }

        // Debug log the state before updating rockets
        console.log('Ragdoll update:', {
            torsoPosition: this.parts.torso.position,
            hasParticleSystem: !!particleSystem,
            hasCamera: !!camera
        });

        // Update each rocket
        Object.values(this.rockets).forEach(rocket => {
            if (!rocket.bodyPart?.position) {
                console.error('Invalid body part for rocket:', {
                    rocketBodyPart: rocket.bodyPart?.label,
                    position: rocket.bodyPart?.position
                });
                return;
            }
            rocket.update(particleSystem, camera);
        });
    }

    enableRockets(rocketList) {
        if (!this.rockets) {
            console.warn('No rockets initialized');
            return;
        }

        // Disable all rockets first
        Object.values(this.rockets).forEach(rocket => {
            rocket.enabled = false;
        });
        
        // Enable specified rockets
        rocketList.forEach(rocketName => {
            if (this.rockets[rocketName]) {
                this.rockets[rocketName].enabled = true;
            } else {
                console.warn(`Rocket ${rocketName} not found`);
            }
        });
    }
} 
