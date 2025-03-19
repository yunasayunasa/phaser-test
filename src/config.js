import Phaser from 'phaser';

export default {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#222222',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};