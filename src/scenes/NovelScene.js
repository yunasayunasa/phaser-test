import Phaser from 'phaser';

export default class NovelScene extends Phaser.Scene {
    constructor(config) {
        super({
            key: config.key || 'NovelScene'
        });
        
        // デフォルト設定
        this.config = {
            width: config.width || 800,
            height: config.height || 600,
            textBoxX: config.textBoxX || 50,
            textBoxY: config.textBoxY || 400,
            textBoxWidth: config.textBoxWidth || 700,
            textBoxHeight: config.textBoxHeight || 150,
            textStyle: config.textStyle || { 
                fontFamily: 'Arial', 
                fontSize: '18px', 
                color: '#FFFFFF',
                wordWrap: { width: 680 }
            },
            ...config
        };
        
        // シーンデータ
        this.currentScene = null;
        this.sceneHistory = [];
        this.characterSprites = {};
        this.textSpeed = config.textSpeed || 30; // ミリ秒/文字
        
        // UI要素
        this.textBox = null;
        this.contentText = null;
        this.nameText = null;
        this.choiceButtons = [];
        
        // 状態
        this.isTyping = false;
        this.fullText = '';
        this.currentTextIndex = 0;
        this.dialogIndex = 0;
        
        // デバッグモード
        this.debug = config.debug || false;
    }
    
    // シーンのプリロード
    preload() {
        // 必要なアセットをロード
        if (this.currentScene && this.currentScene.assets) {
            this.currentScene.assets.forEach(asset => {
                switch (asset.type) {
                    case 'image':
                        this.load.image(asset.key, asset.path);
                        break;
                    case 'spritesheet':
                        this.load.spritesheet(asset.key, asset.path, asset.config);
                        break;
                    case 'audio':
                        this.load.audio(asset.key, asset.path);
                        break;
                }
            });
        }
    }
    
    // シーンの作成
    create() {
        this.createUI();
        
        // 背景の設定
        if (this.currentScene && this.currentScene.background) {
            this.background = this.add.image(this.config.width / 2, this.config.height / 2, this.currentScene.background);
            this.background.setDisplaySize(this.config.width, this.config.height);
        } else {
            // デフォルト背景（黒）
            this.background = this.add.rectangle(
                this.config.width / 2, 
                this.config.height / 2, 
                this.config.width, 
                this.config.height, 
                0x000000
            );
        }
        
        // クリックイベントの設定
        this.input.on('pointerdown', this.handleClick, this);
        
        // 初期ダイアログの表示
        if (this.currentScene && this.currentScene.dialog && this.currentScene.dialog.length > 0) {
            this.showDialog(0);
        }
    }
    
    // UIの作成
    createUI() {
        // テキストボックス背景
        this.textBox = this.add.rectangle(
            this.config.textBoxX + this.config.textBoxWidth / 2,
            this.config.textBoxY + this.config.textBoxHeight / 2,
            this.config.textBoxWidth,
            this.config.textBoxHeight,
            0x000000,
            0.7
        );
        
        // 名前テキスト
        this.nameText = this.add.text(
            this.config.textBoxX + 10,
            this.config.textBoxY - 30,
            '',
            { ...this.config.textStyle, fontSize: '22px', color: '#FFFF00' }
        );
        
        // 内容テキスト
        this.contentText = this.add.text(
            this.config.textBoxX + 20,
            this.config.textBoxY + 20,
            '',
            this.config.textStyle
        );
        
        // "Next" インジケーター
        this.nextIndicator = this.add.text(
            this.config.textBoxX + this.config.textBoxWidth - 40,
            this.config.textBoxY + this.config.textBoxHeight - 30,
            '▼',
            { fontSize: '24px', color: '#FFFFFF' }
        );
        this.nextIndicator.setVisible(false);
        
        // UIレイヤーをカメラに固定
        this.textBox.setScrollFactor(0);
        this.nameText.setScrollFactor(0);
        this.contentText.setScrollFactor(0);
        this.nextIndicator.setScrollFactor(0);
    }
    
    // ダイアログの表示
    showDialog(index) {
        if (!this.currentScene || !this.currentScene.dialog || index >= this.currentScene.dialog.length) {
            return false;
        }
        
        const dialog = this.currentScene.dialog[index];
        this.dialogIndex = index;
        this.fullText = dialog.text;
        this.currentTextIndex = 0;
        
        // キャラクター名の設定
        if (dialog.character) {
            this.nameText.setText(dialog.character);
            this.nameText.setVisible(true);
        } else {
            this.nameText.setVisible(false);
        }
        
        // キャラクターの表示/更新
        this.updateCharacters(dialog.characters);
        
        // テキストのタイピング表示開始
        this.contentText.setText('');
        this.isTyping = true;
        this.nextIndicator.setVisible(false);
        
        this.typeText();
        
        return true;
    }
    
    // 文字を1つずつ表示
    typeText() {
        if (!this.isTyping) return;
        
        if (this.currentTextIndex < this.fullText.length) {
            this.contentText.setText(this.contentText.text + this.fullText.charAt(this.currentTextIndex));
            this.currentTextIndex++;
            
            this.time.delayedCall(this.textSpeed, this.typeText, [], this);
        } else {
            this.isTyping = false;
            this.nextIndicator.setVisible(true);
            
            // 選択肢の表示
            const dialog = this.currentScene.dialog[this.dialogIndex];
            if (dialog.choices) {
                this.showChoices(dialog.choices);
            }
        }
    }
    
    // 選択肢の表示
    showChoices(choices) {
        // 既存の選択肢をクリア
        this.clearChoices();
        
        const startY = this.config.textBoxY + this.config.textBoxHeight + 20;
        
        choices.forEach((choice, index) => {
            // 条件チェック
            if (choice.condition && !this.evaluateCondition(choice.condition)) {
                return; // 条件を満たさない選択肢はスキップ
            }
            
            const button = this.add.rectangle(
                this.config.width / 2,
                startY + index * 50,
                this.config.textBoxWidth * 0.8,
                40,
                0x333333,
                0.8
            );
            
            const text = this.add.text(
                this.config.width / 2,
                startY + index * 50,
                choice.text,
                { ...this.config.textStyle, align: 'center' }
            );
            text.setOrigin(0.5);
            
            // クリック可能にする
            button.setInteractive();
            button.on('pointerdown', () => {
                this.handleChoice(choice);
            });
            button.on('pointerover', () => {
                button.fillColor = 0x555555;
            });
            button.on('pointerout', () => {
                button.fillColor = 0x333333;
            });
            
            // 選択肢を配列に追加
            this.choiceButtons.push({ button, text });
        });
    }
    
    // 選択肢のクリア
    clearChoices() {
        this.choiceButtons.forEach(choiceObj => {
            choiceObj.button.destroy();
            choiceObj.text.destroy();
        });
        this.choiceButtons = [];
    }
    
    // 選択肢の処理
    handleChoice(choice) {
        this.clearChoices();
        
        // 状態の更新
        if (choice.setState) {
            for (const key in choice.setState) {
                this.setState(key, choice.setState[key]);
            }
        }
        
        // 次のシーンまたはダイアログへ
        if (choice.nextScene) {
            this.loadScene(choice.nextScene);
        } else if (choice.nextDialog !== undefined) {
            this.showDialog(choice.nextDialog);
        } else {
            this.showDialog(this.dialogIndex + 1);
        }
    }
    
    // クリックの処理
    handleClick() {
        // 選択肢表示中は何もしない
        if (this.choiceButtons.length > 0) {
            return;
        }
        
        // タイピング中ならテキストを全て表示
        if (this.isTyping) {
            this.isTyping = false;
            this.contentText.setText(this.fullText);
            this.nextIndicator.setVisible(true);
            
            // 現在のダイアログに選択肢があれば表示
            const dialog = this.currentScene.dialog[this.dialogIndex];
            if (dialog.choices) {
                this.showChoices(dialog.choices);
            }
            return;
        }
        
        // 次のダイアログへ
        if (!this.showDialog(this.dialogIndex + 1)) {
            // ダイアログが終了したらコールバックを呼び出す
            if (this.config.onComplete) {
                this.config.onComplete();
            }
        }
    }
    
    // キャラクターの表示/更新
    updateCharacters(characters) {
        if (!characters) return;
        
        // 既存のキャラクターをリセット
        for (const key in this.characterSprites) {
            this.characterSprites[key].setVisible(false);
        }
        
        // 新しいキャラクター配置
        characters.forEach(char => {
            if (!char.key) return;
            
            let sprite;
            if (this.characterSprites[char.key]) {
                // 既存のスプライトを更新
                sprite = this.characterSprites[char.key];
                sprite.setVisible(true);
            } else {
                // 新しいスプライトを作成
                const x = char.position === 'left' ? this.config.width * 0.25 :
                         char.position === 'right' ? this.config.width * 0.75 :
                         this.config.width * 0.5;
                         
                sprite = this.add.sprite(x, this.config.height * 0.5, char.key);
                this.characterSprites[char.key] = sprite;
            }
            
            // 表情/ポーズの更新
            if (char.frame !== undefined) {
                sprite.setFrame(char.frame);
            }
            
            // アニメーション
            if (char.animation) {
                sprite.play(char.animation);
            }
            
            // フリップ
            if (char.flip !== undefined) {
                sprite.setFlipX(char.flip);
            }
        });
    }
    
    // シーンのロード
    loadScene(sceneKey) {
        // 現在のシーンを履歴に追加
        if (this.currentScene) {
            this.sceneHistory.push({
                scene: this.currentScene,
                dialogIndex: this.dialogIndex
            });
        }
        
        // 新しいシーンをロード
        this.scene.restart();
        this.loadSceneData(sceneKey);
    }
    
    // シーンデータのロード
    loadSceneData(sceneKey) {
        // 実際のプロジェクトでは、この部分でJSONまたはモジュールからシーンデータをロード
        // ここではダミー実装
        // 実際には this.scene.get('SceneManager').getSceneData(sceneKey) などで取得
        this.currentScene = {
            key: sceneKey,
            background: 'background_key',
            dialog: [
                // ダイアログデータ
            ]
        };
    }
    
    // 状態の設定
    setState(key, value) {
        // 親のゲームシーンまたはデータマネージャーに状態を設定
        // 例: this.scene.get('GameScene').setNovelState(key, value);
        if (this.config.onStateChange) {
            this.config.onStateChange(key, value);
        }
        
        if (this.debug) {
            console.log(`State change: ${key} = ${value}`);
        }
    }
    
    // 条件の評価
    evaluateCondition(condition) {
        // 条件式を評価して真偽を返す
        // 実際の実装では親のゲームシーンから状態を取得する
        // 例: return this.scene.get('GameScene').evaluateCondition(condition);
        if (this.config.checkCondition) {
            return this.config.checkCondition(condition);
        }
        
        // デフォルトでは常に真
        return true;
    }
    
    // バックログの表示
    showBacklog() {
        // 実装例
    }
    
    // 前のシーンに戻る
    goBack() {
        if (this.sceneHistory.length > 0) {
            const lastScene = this.sceneHistory.pop();
            this.currentScene = lastScene.scene;
            this.scene.restart();
            this.dialogIndex = lastScene.dialogIndex;
        }
    }
}