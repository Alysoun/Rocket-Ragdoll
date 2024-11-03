import { Body, Vector } from 'matter-js';

export class Rocket {
    constructor(bodyPart, offset = { x: 0, y: 0 }, angle = 0) {
        this.bodyPart = bodyPart;
        this.offset = offset;
        this.angle = angle;
        
        // Adjust power based on body part
        this.power = this.getInitialPower(bodyPart.label);
        
        this.maxFuel = 100;
        this.fuel = this.maxFuel;
        this.active = false;
        this.recoveryRate = 0.5;
    }

    getInitialPower(bodyPartLabel) {
        // Significantly increased power levels
        const powerLevels = {
            head: 0.05,       // Strong enough to lift and control
            leftArm: 0.08,    // Powerful side thrusters
            rightArm: 0.08,
            leftLeg: 0.1,     // Very powerful leg thrusters
            rightLeg: 0.1,
            default: 0.07
        };
        
        return powerLevels[bodyPartLabel] || powerLevels.default;
    }

    getEmissionPoint() {
        if (!this.bodyPart || !this.bodyPart.position) {
            console.warn('Invalid body part for emission point calculation:', this.bodyPart);
            return { x: 0, y: 0 };
        }

        // Add debug logging
        console.log('Body part position:', {
            x: this.bodyPart.position.x,
            y: this.bodyPart.position.y,
            angle: this.bodyPart.angle
        });

        return {
            x: this.bodyPart.position.x,
            y: this.bodyPart.position.y
        };
    }

    toggleThrust(enabled) {
        // Log the state before toggle
        console.log('🚀 Thruster toggle:', {
            enabled,
            bodyPartLabel: this.bodyPart?.label,
            bodyPartExists: !!this.bodyPart,
            hasPosition: !!this.bodyPart?.position,
            position: this.bodyPart?.position,
            currentActive: this.active,
            fuel: this.fuel
        });

        if (enabled) {
            if (!this.bodyPart?.position) {
                console.error('❌ Cannot activate thruster: Invalid body part', {
                    bodyPart: this.bodyPart,
                    label: this.bodyPart?.label
                });
                return;
            }
            this.activate();
        } else {
            this.deactivate();
        }

        // Log the state after toggle
        console.log('🔄 Thruster state after toggle:', {
            enabled,
            bodyPartLabel: this.bodyPart?.label,
            active: this.active,
            position: this.bodyPart?.position
        });
    }

    update(particleSystem, camera) {
        // Log state at start of update
        console.log('🔄 Rocket update start:', {
            active: this.active,
            fuel: this.fuel,
            bodyPartPosition: { ...this.bodyPart.position }
        });

        if (this.active && this.fuel > 0) {
            this.applyThrust();
        } else if (!this.active && this.fuel < this.maxFuel) {
            // Recover fuel when not active
            this.fuel = Math.min(this.maxFuel, this.fuel + this.recoveryRate);
        }

        // Log state at end of update
        console.log('🔄 Rocket update end:', {
            active: this.active,
            fuel: this.fuel,
            bodyPartPosition: { ...this.bodyPart.position }
        });
    }

    activate() {
        if (!this.bodyPart?.position) {
            console.error('❌ Cannot activate rocket: invalid body part');
            return;
        }
        console.log('✅ Activating thruster for:', {
            bodyPartLabel: this.bodyPart.label,
            position: this.bodyPart.position,
            angle: this.angle,
            power: this.power
        });
        this.active = true;
    }

    deactivate() {
        this.active = false;
    }

    applyThrust() {
        if (!this.active || !this.bodyPart || this.fuel <= 0) {
            return;
        }

        // Calculate force vector with increased magnitude
        const force = {
            x: Math.cos(this.angle) * this.power,
            y: Math.sin(this.angle) * this.power
        };

        try {
            // Apply force at the body's position
            Body.applyForce(
                this.bodyPart,
                { x: this.bodyPart.position.x, y: this.bodyPart.position.y },
                force
            );

            // Log thrust application for debugging
            console.log('🚀 Thrust applied:', {
                part: this.bodyPart.label,
                force,
                power: this.power,
                position: { ...this.bodyPart.position },
                velocity: { ...this.bodyPart.velocity }
            });

            // Consume fuel
            this.fuel = Math.max(0, this.fuel - 1);
        } catch (error) {
            console.error('Error applying thrust:', error);
        }
    }
} 
