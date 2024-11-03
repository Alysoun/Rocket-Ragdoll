import { Bodies } from 'matter-js';

export function createObstacles(worldBounds) {
    const obstacles = [];
    
    // Create some platforms
    for (let i = 0; i < 10; i++) {
        const x = -worldBounds.width/3 + Math.random() * worldBounds.width/1.5;
        const y = -worldBounds.height/3 + Math.random() * worldBounds.height/1.5;
        
        obstacles.push(
            Bodies.rectangle(x, y, 100 + Math.random() * 200, 20, {
                isStatic: true,
                angle: Math.random() * 0.5 - 0.25,
                render: {
                    fillStyle: '#444'
                }
            })
        );
    }

    // Create some bouncy obstacles
    for (let i = 0; i < 5; i++) {
        const x = -worldBounds.width/4 + Math.random() * worldBounds.width/2;
        const y = -worldBounds.height/4 + Math.random() * worldBounds.height/2;
        
        obstacles.push(
            Bodies.circle(x, y, 30, {
                isStatic: true,
                restitution: 1.2,
                render: {
                    fillStyle: '#663399'
                }
            })
        );
    }

    return obstacles;
} 