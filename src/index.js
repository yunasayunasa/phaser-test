import Phaser from 'phaser';
import GameScene from './scenes/GameScene';
import config from './config';

// ゲーム設定を適用
const game = new Phaser.Game(config);

// メインシーンの追加
game.scene.add('GameScene', GameScene);

// ゲームを開始
game.scene.start('GameScene');