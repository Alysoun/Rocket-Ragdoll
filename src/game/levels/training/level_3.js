export default {
    id: 'training_3',
    name: 'Full Control',
    description: 'Use all rockets to navigate a course',
    objectives: [
        { type: 'collect', count: 6, description: 'Collect all orbs using any rockets' }
    ],
    collectibles: [
        { x: 0, y: -300 },     // High up
        { x: -200, y: -200 },  // Upper left
        { x: 200, y: -200 },   // Upper right
        { x: -300, y: 0 },     // Mid left
        { x: 300, y: 0 },      // Mid right
        { x: 0, y: -100 }      // Center
    ],
    availableRockets: ['head', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'],
    startPosition: { x: 0, y: 0 },
    timeLimit: null,
    unlocks: ['challenge_1']
};
