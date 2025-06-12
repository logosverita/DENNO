// サーバーノードクラス
class Server {
    constructor(x, y) {
        this.gridX = x;
        this.gridY = y;
        this.owner = null; // null, 'player', 'enemy'
        this.defenseLevel = 0; // 0-3
        this.hasFlag = false;
        this.hasFakeFlag = false;
        this.isScanned = false;
        
        // 描画用オブジェクト
        this.sprite = null;
        this.flagSprite = null;
        this.fakeSprite = null;
        this.defenseSprite = null;
    }
    
    // サーバーの所有者を変更
    setOwner(owner) {
        this.owner = owner;
        this.updateVisuals();
        return this;
    }
    
    // 防御レベルを設定
    setDefenseLevel(level) {
        this.defenseLevel = Math.min(3, Math.max(0, level));
        this.updateVisuals();
        return this;
    }
    
    // フラグを設定
    setFlag(hasFlag) {
        this.hasFlag = hasFlag;
        this.updateVisuals();
        return this;
    }
    
    // 偽フラグを設定
    setFakeFlag(hasFake) {
        this.hasFakeFlag = hasFake;
        this.updateVisuals();
        return this;
    }
    
    // スキャン状態を設定
    setScanned(isScanned) {
        this.isScanned = isScanned;
        this.updateVisuals();
        return this;
    }
    
    // 侵入成功率を計算
    getHackSuccessRate() {
        return CONFIG.BASE_HACK_RATE - (this.defenseLevel * CONFIG.DEFENSE_REDUCTION);
    }
    
    // サーバーの視覚的表現を作成
    createVisuals(scene) {
        const pixelX = this.gridX * CONFIG.GRID_CELL_SIZE + CONFIG.GRID_OFFSET_X;
        const pixelY = this.gridY * CONFIG.GRID_CELL_SIZE + CONFIG.GRID_OFFSET_Y;
        
        // サーバーノード本体
        this.sprite = scene.add.circle(pixelX, pixelY, 20, CONFIG.COLORS.SERVER_NEUTRAL);
        this.sprite.setStrokeStyle(2, CONFIG.COLORS.GRID);
        this.sprite.setVisible(false); // 初期状態では非表示
        
        // 座標表示
        this.coordText = scene.add.text(pixelX, pixelY, `(${this.gridX},${this.gridY})`, {
            font: '12px Courier',
            fill: '#ffffff',
            align: 'center'
        });
        this.coordText.setOrigin(0.5);
        this.coordText.setVisible(false); // 初期状態では非表示
        
        // フラグ表示（初期は非表示）
        this.flagSprite = scene.add.star(pixelX, pixelY - 5, 5, 5, 10, CONFIG.COLORS.SYSTEM);
        this.flagSprite.setVisible(false);
        
        // 偽フラグ表示（初期は非表示）
        this.fakeSprite = scene.add.star(pixelX, pixelY - 5, 5, 5, 10, CONFIG.COLORS.ERROR);
        this.fakeSprite.setAlpha(0.7);
        this.fakeSprite.setVisible(false);
        
        // 防御レベル表示
        this.defenseSprite = scene.add.text(pixelX - 5, pixelY - 5, '', {
            font: '12px Courier',
            fill: '#ffffff'
        });
        this.defenseSprite.setOrigin(0.5);
        this.defenseSprite.setVisible(false);
        
        this.updateVisuals();
        return this;
    }
    
    // 視覚的表現を更新
    updateVisuals() {
        if (!this.sprite) return;
        
        // スキャン済みの場合のみ表示
        this.sprite.setVisible(this.isScanned);
        this.coordText.setVisible(this.isScanned);
        
        // サーバー色の更新
        let color = CONFIG.COLORS.SERVER_NEUTRAL;
        if (this.owner === 'player') {
            color = CONFIG.COLORS.SERVER_PLAYER;
        } else if (this.owner === 'enemy') {
            color = CONFIG.COLORS.SERVER_ENEMY;
        }
        this.sprite.fillColor = color;
        
        // 防御レベルの表示
        this.sprite.setStrokeStyle(2 + this.defenseLevel, CONFIG.COLORS.GRID);
        
        if (this.defenseLevel > 0 && this.isScanned) {
            this.defenseSprite.setText(this.defenseLevel);
            this.defenseSprite.setVisible(true);
        } else {
            this.defenseSprite.setVisible(false);
        }
        
        // フラグ表示
        this.flagSprite.setVisible(this.isScanned && this.hasFlag);
        this.fakeSprite.setVisible(this.isScanned && this.hasFakeFlag);
    }
    
    // ピクセル座標を取得
    getPixelPosition() {
        return {
            x: this.gridX * CONFIG.GRID_CELL_SIZE + CONFIG.GRID_OFFSET_X,
            y: this.gridY * CONFIG.GRID_CELL_SIZE + CONFIG.GRID_OFFSET_Y
        };
    }
}
