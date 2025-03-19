import Phaser from 'phaser';
import VisualNovelManager from '../components/novel/VisualNovelManager';
import { SampleNovel } from '../data/SampleNovel';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }
    
    preload() {
        // ゲームのアセット読み込み
    }
    
    create() {
        // ゲーム画面の作成
        this.add.text(400, 300, 'ゲーム画面', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // 「ノベルを開始」ボタン
        const startButton = this.add.text(400, 400, 'ノベルを開始', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();
        
        startButton.on('pointerdown', () => {
            this.startNovel();
        });
        
        // ビジュアルノベルマネージャーの初期化
        this.novelManager = new VisualNovelManager(this.game, {
            onStateChange: (key, value) => {
                // ゲーム状態の更新
                console.log(`Game state updated: ${key} = ${value}`);
            },
            checkCondition: (condition) => {
                // 条件チェック
                return this.checkGameCondition(condition);
            }
        });
    }
    
    startNovel() {
        // ビジュアルノベルの開始
        this.novelManager.start(SampleNovel, 'intro', () => {
            console.log('ビジュアルノベルが終了しました');
        });
    }
    
    checkGameCondition(condition) {
        // ゲーム固有の条件チェック
        switch(condition) {
            case 'hasSecretKey':
                return false; // 例：鍵を持っているかどうか
            default:
                return false;
        }
    }
}