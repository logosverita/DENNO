// タイトルシーン
class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }
    
    create() {
        // 背景
        this.add.rectangle(400, 300, 800, 600, 0x0a0a0a);
        
        // ASCII Artで「CyberProtocol」を表示
        this.createAsciiTitle(400, 200);
        
        // タイトルテキスト（小さめに）
        this.add.text(400, 350, '電 脳 戦', {
            font: '36px "MS Gothic", monospace',
            fill: '#00ffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // サブタイトル
        this.add.text(400, 400, 'CYBER WARFARE', {
            font: '24px "Courier New", monospace',
            fill: '#00ff00',
            align: 'center'
        }).setOrigin(0.5);
        
        // 点滅するプレスエンター
        const pressEnter = this.add.text(400, 450, '[PRESS ENTER]', {
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
    
    // ASCII Artで「CyberProtocol」を表示
    createAsciiTitle(centerX, centerY) {
        const asciiArt = [
            " .d8888b.           888                     8888888b.                888                            888 ",
            "d88P  Y88b          888                     888   Y88b               888                            888 ",
            "888    888          888                     888    888               888                            888 ",
            "888         888  888 88888b.   .d88b.       888   d88P 888d888  .d88888  .d88b.   .d8888b  .d88b.  888 ",
            "888         888  888 888 \"88b d8P  Y8b      8888888P\"  888P\"   d88\" 888 d88\"\"88b d88P\"    d88\"\"88b 888 ",
            "888    888  888  888 888  888 88888888      888        888     888  888 888  888 888      888  888 888 ",
            "Y88b  d88P  Y88b 888 888 d88P Y8b.          888        888     Y88b 888 Y88..88P Y88b.    Y88..88P 888 ",
            " \"Y8888P\"    \"Y88888 88888P\"   \"Y8888       888        888      \"Y88888  \"Y88P\"   \"Y8888P  \"Y88P\"  888 "
        ];
        
        const style = {
            font: '12px "Courier New", monospace',
            fill: '#00ffff',
            align: 'center'
        };
        
        const textHeight = 14;
        const totalHeight = asciiArt.length * textHeight;
        const startY = centerY - totalHeight / 2;
        
        for (let i = 0; i < asciiArt.length; i++) {
            this.add.text(centerX, startY + i * textHeight, asciiArt[i], style).setOrigin(0.5);
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
