export default {
    id: 'training_2',
    name: 'Arms Control',
    description: 'Master arm rockets (A and D keys)',
    objectives: [
        { type: 'collect', count: 4, description: 'Collect orbs using arm rockets' }
    ],
    collectibles: [
        { x: -200, y: 0 },  // Far left
        { x: 200, y: 0 },   // Far right
        { x: -300, y: -50 },
        { x: 300, y: -50 }
    ],
    availableRockets: ['leftArm', 'rightArm'], // Only arm rockets
    startPosition: { x: 0, y: 0 },
    timeLimit: null,
    unlocks: ['training_3']
};
