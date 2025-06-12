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
        
        // 新機能用のプロパティ
        this.hasAggressiveFirewall = false;
        this.hasWorm = false;
        this.hasBackdoor = false;
        this.hasHoneypot = false;
        this.hasTrojan = false;
        this.hasTimebomb = false;
        this.trojianTimer = null;
        this.timebombTimer = null;
        this.wormTimer = null;
        
        // 描画用オブジェクト
        this.sprite = null;
        this.flagSprite = null;
        this.fakeSprite = null;
        this.defenseSprite = null;
        this.coordText = null;
        
        // 特殊機能の視覚表現
        this.aggressiveFirewallSprite = null;
        this.wormSprite = null;
        this.backdoorSprite = null;
        this.honeypotSprite = null;
        this.trojanSprite = null;
        this.timebombSprite = null;
    }
    
    // サーバーの所有者を変更
    setOwner(owner) {
        const oldOwner = this.owner;
        this.owner = owner;
        
        // 所有者変更時の特殊処理
        if (oldOwner !== owner) {
            // バックドアの発動チェック
            if (oldOwner === 'player' && owner === 'enemy' && this.hasBackdoor) {
                this.activateBackdoor();
            }
            
            // タイムボムの発動チェック
            if (oldOwner === 'player' && owner === 'enemy' && this.hasTimebomb) {
                this.activateTimebomb();
            }
        }
        
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
    
    // 攻性防壁を設定
    setAggressiveFirewall(hasFirewall) {
        this.hasAggressiveFirewall = hasFirewall;
        this.updateVisuals();
        return this;
    }
    
    // ワームを設定
    setWorm(hasWorm, scene) {
        this.hasWorm = hasWorm;
        
        // 既存のワームタイマーをクリア
        if (this.wormTimer) {
            this.wormTimer.remove();
            this.wormTimer = null;
        }
        
        // 新しいワームを設置
        if (hasWorm && scene) {
            this.wormTimer = scene.time.addEvent({
                delay: 15000, // 15秒ごと
                callback: this.performWormScan,
                callbackScope: this,
                args: [scene],
                loop: true
            });
        }
        
        this.updateVisuals();
        return this;
    }
    
    // バックドアを設定
    setBackdoor(hasBackdoor) {
        this.hasBackdoor = hasBackdoor;
        this.updateVisuals();
        return this;
    }
    
    // ハニーネットを設定
    setHoneypot(hasHoneypot) {
        this.hasHoneypot = hasHoneypot;
        this.updateVisuals();
        return this;
    }
    
    // トロイの木馬を設定
    setTrojan(hasTrojan, scene) {
        this.hasTrojan = hasTrojan;
        
        // 既存のトロイの木馬タイマーをクリア
        if (this.trojianTimer) {
            this.trojianTimer.remove();
            this.trojianTimer = null;
        }
        
        // 新しいトロイの木馬を設置
        if (hasTrojan && scene) {
            this.trojianTimer = scene.time.addEvent({
                delay: 15000, // 15秒後に発動
                callback: this.activateTrojan,
                callbackScope: this,
                args: [scene],
                loop: false
            });
        }
        
        this.updateVisuals();
        return this;
    }
    
    // タイムボムを設定
    setTimebomb(hasTimebomb) {
        this.hasTimebomb = hasTimebomb;
        this.updateVisuals();
        return this;
    }
    
    // ワームによる自動スキャン
    performWormScan(scene) {
        if (!this.hasWorm || !this.isScanned) return;
        
        // 周囲のサーバーをスキャン
        const directions = [
            {x: 0, y: -1}, // 上
            {x: 1, y: 0},  // 右
            {x: 0, y: 1},  // 下
            {x: -1, y: 0}  // 左
        ];
        
        let scannedCount = 0;
        let enemyBotDetected = false;
        
        // 現在地のサーバーもスキャン
        if (!this.isScanned) {
            this.setScanned(true);
            scannedCount++;
        }
        
        // 周囲のサーバーをスキャン
        directions.forEach(dir => {
            const scanX = this.gridX + dir.x;
            const scanY = this.gridY + dir.y;
            
            if (scanX >= 0 && scanX < CONFIG.GRID_SIZE && scanY >= 0 && scanY < CONFIG.GRID_SIZE) {
                // サーバーのスキャン
                const server = scene.getServerAt(scanX, scanY);
                if (server && !server.isScanned) {
                    server.setScanned(true);
                    scannedCount++;
                }
                
                // 敵BOTの検出
                if (scene.enemyBots.some(bot => bot.gridX === scanX && bot.gridY === scanY)) {
                    enemyBotDetected = true;
                }
            }
        });
        
        // スキャン結果の通知
        if (scannedCount > 0) {
            scene.addChatMessage('SYSTEM', `ワームが${scannedCount}個のサーバーをスキャンしました`);
        }
        
        // 敵BOT検出の警告
        if (enemyBotDetected) {
            scene.addChatMessage('SYSTEM', `警告: ワームが周囲に敵BOTを検出しました！`);
        }
    }
    
    // バックドアの発動
    activateBackdoor() {
        // バックドアがない場合は何もしない
        if (!this.hasBackdoor) return;
        
        // 60%の確率で自動的に奪還を試みる
        if (Math.random() < 0.6) {
            // 所有者を元に戻す
            this.owner = 'player';
            
            // バックドアを消費
            this.hasBackdoor = false;
            
            // 通知
            const scene = this.sprite.scene;
            scene.addChatMessage('SYSTEM', `バックドアが発動し、サーバー(${this.gridX},${this.gridY})を自動的に奪還しました！`);
        } else {
            // 失敗した場合もバックドアは消費される
            this.hasBackdoor = false;
        }
        
        this.updateVisuals();
    }
    
    // トロイの木馬の発動
    activateTrojan(scene) {
        // トロイの木馬がない場合は何もしない
        if (!this.hasTrojan) return;
        
        // 80%の確率で自動的に制圧を試みる
        if (Math.random() < 0.8) {
            // 所有者を変更
            this.owner = 'player';
            
            // 通知
            scene.addChatMessage('SYSTEM', `トロイの木馬が発動し、サーバー(${this.gridX},${this.gridY})を制圧しました！`);
            
            // マシンパワー加算
            scene.addMachinePower(CONFIG.SERVER_POWER);
        } else {
            // 失敗通知
            scene.addChatMessage('SYSTEM', `トロイの木馬の発動に失敗しました`);
        }
        
        // トロイの木馬を消費
        this.hasTrojan = false;
        this.trojianTimer = null;
        
        this.updateVisuals();
    }
    
    // タイムボムの発動
    activateTimebomb() {
        // タイムボムがない場合は何もしない
        if (!this.hasTimebomb) return;
        
        // タイマーを設定
        const scene = this.sprite.scene;
        this.timebombTimer = scene.time.addEvent({
            delay: 30000, // 30秒後に発動
            callback: () => {
                // 50%の確率で自動的に奪還を試みる
                if (Math.random() < 0.5) {
                    // 所有者を元に戻す
                    this.owner = 'player';
                    
                    // 通知
                    scene.addChatMessage('SYSTEM', `タイムボムが発動し、サーバー(${this.gridX},${this.gridY})を自動的に奪還しました！`);
                } else {
                    // 失敗通知
                    scene.addChatMessage('SYSTEM', `タイムボムの発動に失敗しました`);
                }
                
                // タイムボムを消費
                this.hasTimebomb = false;
                this.timebombTimer = null;
                
                this.updateVisuals();
            },
            loop: false
        });
        
        // 通知
        scene.addChatMessage('SYSTEM', `サーバー(${this.gridX},${this.gridY})のタイムボムがカウントダウンを開始しました！`);
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
        
        // 攻性防壁表示
        this.aggressiveFirewallSprite = scene.add.circle(pixelX, pixelY, 25, 0xff0000, 0.3);
        this.aggressiveFirewallSprite.setStrokeStyle(2, 0xff0000);
        this.aggressiveFirewallSprite.setVisible(false);
        
        // ワーム表示
        this.wormSprite = scene.add.circle(pixelX, pixelY, 15, 0x00ff00, 0.3);
        this.wormSprite.setStrokeStyle(2, 0x00ff00);
        this.wormSprite.setVisible(false);
        
        // バックドア表示
        this.backdoorSprite = scene.add.circle(pixelX, pixelY, 15, 0x0000ff, 0.3);
        this.backdoorSprite.setStrokeStyle(2, 0x0000ff);
        this.backdoorSprite.setVisible(false);
        
        // ハニーネット表示
        this.honeypotSprite = scene.add.circle(pixelX, pixelY, 15, 0xffff00, 0.3);
        this.honeypotSprite.setStrokeStyle(2, 0xffff00);
        this.honeypotSprite.setVisible(false);
        
        // トロイの木馬表示
        this.trojanSprite = scene.add.circle(pixelX, pixelY, 15, 0xff00ff, 0.3);
        this.trojanSprite.setStrokeStyle(2, 0xff00ff);
        this.trojanSprite.setVisible(false);
        
        // タイムボム表示
        this.timebombSprite = scene.add.circle(pixelX, pixelY, 15, 0xff5500, 0.3);
        this.timebombSprite.setStrokeStyle(2, 0xff5500);
        this.timebombSprite.setVisible(false);
        
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
        
        // 特殊機能の表示（スキャン済みの場合のみ）
        if (this.isScanned) {
            // 攻性防壁
            if (this.aggressiveFirewallSprite) {
                this.aggressiveFirewallSprite.setVisible(this.hasAggressiveFirewall);
            }
            
            // ワーム
            if (this.wormSprite) {
                this.wormSprite.setVisible(this.hasWorm);
            }
            
            // バックドア
            if (this.backdoorSprite) {
                this.backdoorSprite.setVisible(this.hasBackdoor);
            }
            
            // ハニーネット
            if (this.honeypotSprite) {
                this.honeypotSprite.setVisible(this.hasHoneypot);
            }
            
            // トロイの木馬
            if (this.trojanSprite) {
                this.trojanSprite.setVisible(this.hasTrojan);
            }
            
            // タイムボム
            if (this.timebombSprite) {
                this.timebombSprite.setVisible(this.hasTimebomb);
            }
        } else {
            // スキャンされていない場合は全て非表示
            if (this.aggressiveFirewallSprite) this.aggressiveFirewallSprite.setVisible(false);
            if (this.wormSprite) this.wormSprite.setVisible(false);
            if (this.backdoorSprite) this.backdoorSprite.setVisible(false);
            if (this.honeypotSprite) this.honeypotSprite.setVisible(false);
            if (this.trojanSprite) this.trojanSprite.setVisible(false);
            if (this.timebombSprite) this.timebombSprite.setVisible(false);
        }
    }
    
    // ピクセル座標を取得
    getPixelPosition() {
        return {
            x: this.gridX * CONFIG.GRID_CELL_SIZE + CONFIG.GRID_OFFSET_X,
            y: this.gridY * CONFIG.GRID_CELL_SIZE + CONFIG.GRID_OFFSET_Y
        };
    }
}
