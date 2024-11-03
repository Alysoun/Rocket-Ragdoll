export class LevelManager {
    constructor() {
        this.levels = new Map();
        this.loadLevels();
    }

    loadLevels() {
        // Load all training levels
        const trainingLevels = [
            {
                id: 'training_1',
                name: 'First Steps',
                description: 'Learn to use your head rocket',
                objectives: [
                    { type: 'collect', count: 1, description: 'Collect the orb using your head rocket (W key)' }
                ],
                collectibles: [
                    { x: 0, y: -200 }
                ],
                availableRockets: ['head'],
                unlocks: ['training_2'],
                startPosition: { x: 0, y: 0 }
            },
            {
                id: 'training_2',
                name: 'Arm Control',
                description: 'Learn to use your arm rockets',
                objectives: [
                    { type: 'collect', count: 1, description: 'Collect the orb using your arm rockets (A and D keys)' }
                ],
                collectibles: [
                    { x: 200, y: 0 }  // Start with just one orb to the right
                ],
                availableRockets: ['leftArm', 'rightArm'],
                unlocks: ['training_3'],
                startPosition: { x: 0, y: 0 },
                tutorialText: [
                    "Now let's try the arm rockets!",
                    "Press D to fire your right arm rocket",
                    "Press A to fire your left arm rocket",
                    "Try to reach the orb on your right"
                ]
            }
        ];

        trainingLevels.forEach(level => {
            this.levels.set(level.id, level);
        });
    }

    loadLevel(levelId) {
        const level = this.levels.get(levelId);
        if (!level) {
            console.error('Level not found:', levelId);
            return null;
        }
        return level;
    }
} 