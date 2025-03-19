import Phaser from 'phaser';
import NovelScene from '../../scenes/NovelScene';

export default class VisualNovelManager {
    constructor(game, config = {}) {
        this.game = game;
        this.config = {
            key: 'novelScene',
            width: game.config.width,
            height: game.config.height,
            ...config
        };
        
        // シーンの追加（まだ起動はしない）
        this.novelScene = new NovelScene(this.config);
        this.game.scene.add(this.config.key, this.novelScene, false);
        
        // シナリオデータ
        this.novelData = null;
    }
    
    // ビジュアルノベルを起動
    start(novelData, startScene = null, onComplete = null) {
        this.novelData = novelData;
        
        // コールバックの設定
        const novelConfig = {
            ...this.config,
            onComplete: () => {
                this.stop();
                if (onComplete) onComplete();
            },
            onStateChange: this.config.onStateChange || null,
            checkCondition: this.config.checkCondition || null
        };
        
        // シーン設定の更新
        this.game.scene.remove(this.config.key);
        this.novelScene = new NovelScene(novelConfig);
        this.game.scene.add(this.config.key, this.novelScene, false);
        
        // シーンデータの設定と起動
        const sceneKey = startScene || Object.keys(novelData.scenes)[0];
        this.novelScene.currentScene = novelData.scenes[sceneKey];
        this.game.scene.start(this.config.key);
        
        return this;
    }
    
    // ビジュアルノベルを停止
    stop() {
        this.game.scene.stop(this.config.key);
        return this;
    }
    
    // シーンの切り替え
    changeScene(sceneKey) {
        if (this.novelData && this.novelData.scenes[sceneKey]) {
            this.novelScene.currentScene = this.novelData.scenes[sceneKey];
            this.game.scene.start(this.config.key);
        }
        return this;
    }
    
    // 状態のチェック
    checkCondition(condition) {
        // ゲーム固有の条件チェックロジックを実装
        // 例：this.game.registry.get(condition) === true
        return false;
    }
    
    // 状態の変更
    setState(key, value) {
        // ゲーム固有の状態管理ロジックを実装
        // 例：this.game.registry.set(key, value);
        return this;
    }
}