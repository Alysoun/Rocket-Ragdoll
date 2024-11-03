export default {
    id: 'training_1',
    name: 'First Steps',
    description: 'Learn to use your head rocket',
    objectives: [
        { type: 'collect', count: 1, description: 'Collect the orb using your head rocket' }
    ],
    collectibles: [
        { x: 0, y: -200 }  // Single orb directly above the player
    ],
    availableRockets: ['head'], // Only head rocket enabled
    unlocks: ['training_2'],  // Next level ID
    startPosition: { x: 0, y: 0 }
};
