// マトリックス風タイトルシーン
class MatrixTitleScene extends Phaser.Scene {
    constructor() {
        super('MatrixTitleScene');
        this.matrixChars = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        this.columns = [];
        this.drops = [];
    }
    
    create() {
        // 黒い背景
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000).setOrigin(0);
        
        // マトリックス風の文字列を作成
        this.setupMatrixEffect();
        
        // タイトルテキスト
        const titleText = this.add.text(400, 200, 'CYBER WARFARE', {
            font: 'bold 48px "Courier New", monospace',
            fill: '#00ff00',
            stroke: '#003300',
            strokeThickness: 4,
            shadow: { offsetX: 2, offsetY: 2, color: '#003300', blur: 5, stroke: true, fill: true }
        }).setOrigin(0.5);
        
        // サブタイトル
        const subtitleText = this.add.text(400, 270, 'Enter the digital battlefield', {
            font: '24px "Courier New", monospace',
            fill: '#00ff00'
        }).setOrigin(0.5);
        
        // 点滅するプレスエンター
        const pressStart = this.add.text(400, 350, 'PRESS ANY KEY TO START', {
            font: '20px "Courier New", monospace',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // 点滅アニメーション
        this.tweens.add({
            targets: pressStart,
            alpha: 0,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
        
        // タイトルとサブタイトルのアニメーション
        this.animateTitle(titleText, subtitleText);
        
        // キー入力設定
        this.input.keyboard.on('keydown', () => {
            this.startGame();
        });
        
        // クリック/タップでも開始可能に
        this.input.on('pointerdown', () => {
            this.startGame();
        });
    }
    
    // マトリックス風エフェクトの設定
    setupMatrixEffect() {
        const fontSize = 14;
        const columns = Math.floor(this.cameras.main.width / fontSize);
        
        // 各列の設定
        for (let i = 0; i < columns; i++) {
            this.columns[i] = [];
            this.drops[i] = Phaser.Math.Between(-20, 0);
            
            // 各列に文字を配置
            for (let j = 0; j < 40; j++) {
                const char = this.matrixChars.charAt(Math.floor(Math.random() * this.matrixChars.length));
                const x = i * fontSize;
                const y = (j * fontSize) - 400; // 画面外から開始
                
                const text = this.add.text(x, y, char, {
                    font: `${fontSize}px monospace`,
                    fill: '#00ff00'
                });
                
                // 透明度をランダムに設定
                text.setAlpha(Phaser.Math.FloatBetween(0.2, 0.8));
                
                this.columns[i].push(text);
            }
        }
    }
    
    update() {
        // マトリックスエフェクトのアニメーション
        for (let i = 0; i < this.columns.length; i++) {
            // 一定確率で列を更新
            if (Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            
            // 列の文字を下に移動
            if (this.drops[i] > 0) {
                for (let j = 0; j < this.columns[i].length; j++) {
                    const text = this.columns[i][j];
                    text.y += 1;
                    
                    // 一定確率で文字を変更
                    if (Math.random() > 0.95) {
                        text.setText(this.matrixChars.charAt(Math.floor(Math.random() * this.matrixChars.length)));
                    }
                    
                    // 画面外に出たら上に戻す
                    if (text.y > this.cameras.main.height + 50) {
                        text.y = -14;
                        text.setText(this.matrixChars.charAt(Math.floor(Math.random() * this.matrixChars.length)));
                    }
                }
            }
            
            this.drops[i]++;
        }
    }
    
    // タイトルのアニメーション
    animateTitle(titleText, subtitleText) {
        // 初期状態
        titleText.setAlpha(0);
        subtitleText.setAlpha(0);
        
        // タイトルのフェードイン
        this.tweens.add({
            targets: titleText,
            alpha: 1,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                // タイトル表示後にサブタイトルをフェードイン
                this.tweens.add({
                    targets: subtitleText,
                    alpha: 1,
                    duration: 1500,
                    ease: 'Power2'
                });
            }
        });
    }
    
    // ゲーム開始
    startGame() {
        // キー入力を無効化（連打防止）
        this.input.keyboard.removeAllListeners();
        this.input.removeAllListeners();
        
        // フェードアウト効果
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('GameScene');
        });
    }
}
