// タイトルシーン
class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }
    
    create() {
        // 背景
        this.add.rectangle(400, 300, 800, 600, 0x0a0a0a);
        
        // タイトルロゴ（ブロック状）
        this.createBlockLogo(400, 150);
        
        // タイトルテキスト
        this.add.text(400, 250, '電 脳 戦', {
            font: '48px "MS Gothic", monospace',
            fill: '#00ffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // サブタイトル
        this.add.text(400, 300, 'CYBER WARFARE', {
            font: '24px "Courier New", monospace',
            fill: '#00ff00',
            align: 'center'
        }).setOrigin(0.5);
        
        // 点滅するプレスエンター
        const pressEnter = this.add.text(400, 400, '[PRESS ENTER]', {
            font: '20px "Courier New", monospace',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // 点滅アニメーション
        this.tweens.add({
            targets: pressEnter,
            alpha: 0,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
        
        // コピーライト
        this.add.text(400, 550, '© 2025 DENNO NETWORK SYSTEMS', {
            font: '14px "Courier New", monospace',
            fill: '#666666',
            align: 'center'
        }).setOrigin(0.5);
        
        // キー入力設定
        this.input.keyboard.on('keydown-ENTER', () => {
            this.startGame();
        });
        
        // クリック/タップでも開始可能に
        this.input.on('pointerdown', () => {
            this.startGame();
        });
        
        // サイバー風の背景エフェクト
        this.createBackgroundEffect();
    }
    
    // ブロック状のロゴを作成
    createBlockLogo(centerX, centerY) {
        const blockSize = 15;
        const gap = 2;
        const color = 0x00ffff;
        
        // "電" の形を表現するブロック配置
        const denPattern = [
            [1,1,1,1,1],
            [1,0,0,0,0],
            [1,1,1,1,0],
            [1,0,0,0,0],
            [1,1,1,1,1]
        ];
        
        // "脳" の形を表現するブロック配置
        const nouPattern = [
            [1,1,1,1,1],
            [1,0,0,0,1],
            [1,1,1,1,1],
            [1,0,0,0,1],
            [1,0,0,0,1]
        ];
        
        // "戦" の形を表現するブロック配置
        const senPattern = [
            [1,1,1,1,1],
            [1,0,0,0,1],
            [1,1,1,1,1],
            [1,0,1,0,0],
            [1,0,0,0,1]
        ];
        
        // 各文字のブロックを描画
        this.drawBlockPattern(denPattern, centerX - 120, centerY, blockSize, gap, color);
        this.drawBlockPattern(nouPattern, centerX, centerY, blockSize, gap, color);
        this.drawBlockPattern(senPattern, centerX + 120, centerY, blockSize, gap, color);
    }
    
    // ブロックパターンを描画
    drawBlockPattern(pattern, centerX, centerY, blockSize, gap, color) {
        const totalWidth = pattern[0].length * (blockSize + gap) - gap;
        const totalHeight = pattern.length * (blockSize + gap) - gap;
        const startX = centerX - totalWidth / 2;
        const startY = centerY - totalHeight / 2;
        
        for (let y = 0; y < pattern.length; y++) {
            for (let x = 0; x < pattern[y].length; x++) {
                if (pattern[y][x] === 1) {
                    const blockX = startX + x * (blockSize + gap);
                    const blockY = startY + y * (blockSize + gap);
                    this.add.rectangle(blockX, blockY, blockSize, blockSize, color);
                }
            }
        }
    }
    
    // サイバー風の背景エフェクト
    createBackgroundEffect() {
        // 背景に流れるデジタルラインを作成
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, 800);
            const y = Phaser.Math.Between(0, 600);
            const length = Phaser.Math.Between(20, 100);
            const thickness = Phaser.Math.Between(1, 2);
            const alpha = Phaser.Math.FloatBetween(0.1, 0.3);
            
            const line = this.add.line(0, 0, x, y, x, y + length, 0x00ff00, alpha);
            line.setLineWidth(thickness);
            
            // ラインを下に流す
            this.tweens.add({
                targets: line,
                y: '+=' + Phaser.Math.Between(300, 600),
                duration: Phaser.Math.Between(3000, 8000),
                onComplete: () => {
                    line.y = -length;
                    line.x = Phaser.Math.Between(0, 800);
                    this.tweens.add({
                        targets: line,
                        y: '+=' + 800,
                        duration: Phaser.Math.Between(3000, 8000),
                        onComplete: function() {
                            this.targets[0].y = -length;
                            this.restart();
                        }
                    });
                }
            });
        }
        
        // 背景に点滅するドットを追加
        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(0, 800);
            const y = Phaser.Math.Between(0, 600);
            const size = Phaser.Math.Between(1, 3);
            
            const dot = this.add.circle(x, y, size, 0x00ff00, 0.5);
            
            // ドットを点滅させる
            this.tweens.add({
                targets: dot,
                alpha: 0,
                duration: Phaser.Math.Between(500, 2000),
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 1000)
            });
        }
    }
    
    // ゲーム開始
    startGame() {
        // フェードアウト効果
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('GameScene');
        });
    }
}
