// BOTクラス
class Bot {
    constructor(id, owner, gridX, gridY) {
        this.id = id;
        this.owner = owner; // 'player' または 'enemy'
        this.gridX = gridX;
        this.gridY = gridY;
        
        // 現在位置（ピクセル）
        this.x = gridX * CONFIG.GRID_CELL_SIZE + CONFIG.GRID_OFFSET_X;
        this.y = gridY * CONFIG.GRID_CELL_SIZE + CONFIG.GRID_OFFSET_Y;
        
        // 状態管理
        this.state = 'idle'; // idle, moving, action
        this.action = null; // scan, hack, defend, replicate, decoy, awall, worm, backdoor, honeypot, trojan, timebomb, decoybot
        this.actionProgress = 0;
        this.actionTime = 0;
        this.cooldowns = {
            scan: 0,
            hack: 0,
            defend: 0,
            replicate: 0,
            decoy: 0,
            // 新機能用のクールダウン
            awall: 0,
            worm: 0,
            backdoor: 0,
            honeypot: 0,
            trojan: 0,
            timebomb: 0,
            decoybot: 0
        };
        
        // 特殊能力
        this.hasDeepLearning = false;
        this.learningLevel = 0; // ディープラーニングレベル（最大6）
        
        // 移動関連
        this.targetX = this.x;
        this.targetY = this.y;
        this.targetGridX = gridX;
        this.targetGridY = gridY;
        this.path = [];
        
        // 視覚オブジェクト
        this.sprite = null;
        this.nameText = null;
        this.actionSprite = null;
    }
}
// BOTクラスのメソッドを追加
Bot.prototype.createVisuals = function(scene) {
    // BOT本体
    const color = this.owner === 'player' ? CONFIG.COLORS.BOT_PLAYER : CONFIG.COLORS.BOT_ENEMY;
    const strokeColor = this.owner === 'player' ? 0xffffff : CONFIG.COLORS.ENEMY;
    
    this.sprite = scene.add.circle(this.x, this.y, 10, color);
    this.sprite.setStrokeStyle(2, strokeColor);
    
    // BOT名表示
    this.nameText = scene.add.text(this.x, this.y - 20, `Bot${this.id}`, {
        font: '12px Courier',
        fill: this.owner === 'player' ? '#00ffff' : '#ff00ff'
    });
    this.nameText.setOrigin(0.5);
    
    // アクション表示用スプライト（初期は非表示）
    this.actionSprite = scene.add.circle(this.x, this.y, 15, 0xffffff, 0.3);
    this.actionSprite.setStrokeStyle(1, 0xffffff);
    this.actionSprite.setVisible(false);
};

// 状態テキストを取得
Bot.prototype.getStatusText = function() {
    if (this.state === 'action') {
        return `${this.getActionName(this.action)}中... ${Math.floor(this.actionProgress / this.actionTime * 100)}%`;
    } else if (this.state === 'moving') {
        return '移動中...';
    } else {
        return '待機中';
    }
};

// 指定座標への移動を開始
Bot.prototype.moveTo = function(gridX, gridY) {
    this.targetGridX = gridX;
    this.targetGridY = gridY;
    this.targetX = gridX * CONFIG.GRID_CELL_SIZE + CONFIG.GRID_OFFSET_X;
    this.targetY = gridY * CONFIG.GRID_CELL_SIZE + CONFIG.GRID_OFFSET_Y;
    this.state = 'moving';
    this.path = [];
};
// 更新処理
Bot.prototype.update = function(delta, scene) {
    // クールダウン更新
    Object.keys(this.cooldowns).forEach(key => {
        if (this.cooldowns[key] > 0) {
            this.cooldowns[key] = Math.max(0, this.cooldowns[key] - delta);
        }
    });
    
    // 状態に応じた更新
    switch (this.state) {
        case 'idle':
            // 待機中は何もしない
            break;
            
        case 'moving':
            this.updateMovement(delta);
            break;
            
        case 'action':
            this.updateAction(delta, scene);
            break;
    }
    
    // 視覚オブジェクトの位置更新
    if (this.sprite) {
        this.sprite.x = this.x;
        this.sprite.y = this.y;
    }
    
    if (this.nameText) {
        this.nameText.x = this.x;
        this.nameText.y = this.y - 20;
    }
    
    if (this.actionSprite) {
        this.actionSprite.x = this.x;
        this.actionSprite.y = this.y;
        
        if (this.state === 'action') {
            // アクション進行度を表示
            const progress = this.actionProgress / this.actionTime;
            this.actionSprite.setVisible(true);
            this.actionSprite.setScale(0.5 + progress * 0.5);
            this.actionSprite.alpha = 0.3 + progress * 0.4;
        }
    }
};

// 移動更新
Bot.prototype.updateMovement = function(delta) {
    if (this.path.length > 0) {
        // パスに沿って移動
        const nextPoint = this.path[0];
        const dx = nextPoint.x - this.x;
        const dy = nextPoint.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
            // 次のポイントに到達
            this.x = nextPoint.x;
            this.y = nextPoint.y;
            this.path.shift();
            
            if (this.path.length === 0) {
                // 目的地に到達
                this.gridX = this.targetGridX;
                this.gridY = this.targetGridY;
                this.state = 'idle';
            }
        } else {
            // 移動継続
            const speed = CONFIG.BOT_SPEED * (delta / 1000);
            const ratio = speed / distance;
            this.x += dx * ratio;
            this.y += dy * ratio;
        }
    } else {
        // ネットワーク上の移動パスを生成
        this.generateNetworkPath();
        
        if (this.path.length === 0) {
            // パスが生成できなかった場合は直接移動
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 5) {
                // 目的地に到達
                this.x = this.targetX;
                this.y = this.targetY;
                this.gridX = this.targetGridX;
                this.gridY = this.targetGridY;
                this.state = 'idle';
            } else {
                // 移動継続
                const speed = CONFIG.BOT_SPEED * (delta / 1000);
                const ratio = speed / distance;
                this.x += dx * ratio;
                this.y += dy * ratio;
            }
        }
    }
};
// アクション処理
Bot.prototype.updateAction = function(delta, scene) {
    if (!this.action) {
        this.state = 'idle';
        return;
    }
    
    this.actionProgress += delta;
    
    // アクション完了チェック
    if (this.actionProgress >= this.actionTime) {
        this.completeAction(scene);
    }
};

// ネットワーク上の移動パスを生成
Bot.prototype.generateNetworkPath = function() {
    // 実装は省略（既存のコードを使用）
};

// アクションエフェクトを表示
Bot.prototype.showActionEffect = function(scene) {
    // 実装は省略（既存のコードを使用）
};

// アクション開始
Bot.prototype.startAction = function(action, scene) {
    // クールダウンチェック
    if (this.cooldowns[action] > 0) {
        scene.addChatMessage('ERROR', `Bot${this.id}の${this.getActionName(action)}はクールダウン中です (残り${Math.ceil(this.cooldowns[action] / 1000)}秒)`);
        return false;
    }
    
    // アクション時間設定
    switch (action) {
        // 既存のアクション
        case 'scan': this.actionTime = CONFIG.SCAN_TIME; break;
        case 'hack': this.actionTime = CONFIG.HACK_TIME; break;
        case 'defend': this.actionTime = CONFIG.DEFEND_TIME; break;
        case 'replicate': this.actionTime = CONFIG.REPLICATE_TIME; break;
        case 'decoy': this.actionTime = CONFIG.DECOY_TIME; break;
        
        // 新機能
        case 'awall': this.actionTime = 4000; break; // 攻性防壁
        case 'worm': this.actionTime = 4000; break; // ワーム
        case 'backdoor': this.actionTime = 3000; break; // バックドア
        case 'honeypot': this.actionTime = 3000; break; // ハニーネット
        case 'trojan': this.actionTime = 4000; break; // トロイの木馬
        case 'timebomb': this.actionTime = 3000; break; // タイムボム
        case 'decoybot': this.actionTime = 2000; break; // デコイBOT
        
        default: return false;
    }
    
    this.action = action;
    this.actionProgress = 0;
    this.state = 'action';
    
    scene.addChatMessage('SYSTEM', `Bot${this.id}が${this.getActionName(action)}を開始しました`);
    return true;
};
// アクション名を日本語で取得
Bot.prototype.getActionName = function(action) {
    switch (action) {
        // 既存のアクション
        case 'scan': return 'スキャン';
        case 'hack': return '侵入';
        case 'defend': return '防御';
        case 'replicate': return '複製';
        case 'decoy': return '偽装';
        
        // 新機能
        case 'awall': return '攻性防壁';
        case 'worm': return 'ワーム';
        case 'backdoor': return 'バックドア';
        case 'honeypot': return 'ハニーネット';
        case 'trojan': return 'トロイの木馬';
        case 'timebomb': return 'タイムボム';
        case 'decoybot': return 'デコイBOT';
        
        default: return action;
    }
};

// アクション完了処理
Bot.prototype.completeAction = function(scene) {
    const gameScene = scene;
    const server = gameScene.getServerAt(this.gridX, this.gridY);
    
    switch (this.action) {
        case 'scan':
            // スキャン完了
            this.performScan(gameScene);
            this.cooldowns.scan = CONFIG.SCAN_COOLDOWN;
            break;
            
        case 'hack':
            // 侵入完了
            this.performHack(gameScene, server);
            this.cooldowns.hack = CONFIG.HACK_COOLDOWN;
            break;
            
        case 'defend':
            // 防御完了
            if (server && server.owner === this.owner) {
                server.setDefenseLevel(server.defenseLevel + 1);
                gameScene.addChatMessage('SYSTEM', `Bot${this.id}が防御レベルを強化しました (Lv.${server.defenseLevel})`);
            }
            this.cooldowns.defend = CONFIG.DEFEND_COOLDOWN;
            break;
            
        case 'replicate':
            // 複製完了
            this.performReplicate(gameScene);
            this.cooldowns.replicate = CONFIG.REPLICATE_COOLDOWN;
            break;
            
        case 'decoy':
            // 偽装完了
            if (server && server.owner === this.owner) {
                server.setFakeFlag(true);
                gameScene.addChatMessage('SYSTEM', `Bot${this.id}が偽フラグを設置しました`);
            }
            this.cooldowns.decoy = CONFIG.DECOY_COOLDOWN;
            break;
            
        // 新機能
        case 'awall':
            // 攻性防壁設置
            this.performAggressiveFirewall(gameScene, server);
            this.cooldowns.awall = 10000; // 10秒クールダウン
            break;
            
        case 'worm':
            // ワーム設置
            this.performWorm(gameScene, server);
            this.cooldowns.worm = 15000; // 15秒クールダウン
            break;
            
        case 'backdoor':
            // バックドア設置
            this.performBackdoor(gameScene, server);
            this.cooldowns.backdoor = 20000; // 20秒クールダウン
            break;
            
        case 'honeypot':
            // ハニーネット設置
            this.performHoneypot(gameScene, server);
            this.cooldowns.honeypot = 15000; // 15秒クールダウン
            break;
            
        case 'trojan':
            // トロイの木馬設置
            this.performTrojan(gameScene, server);
            this.cooldowns.trojan = 30000; // 30秒クールダウン
            break;
            
        case 'timebomb':
            // タイムボム設置
            this.performTimebomb(gameScene, server);
            this.cooldowns.timebomb = 25000; // 25秒クールダウン
            break;
            
        case 'decoybot':
            // デコイBOT作成
            this.performDecoyBot(gameScene);
            this.cooldowns.decoybot = 15000; // 15秒クールダウン
            break;
    }
    
    // エフェクト表示
    this.showActionEffect(scene);
    
    // 状態リセット
    this.state = 'idle';
    this.action = null;
    this.actionProgress = 0;
    this.actionTime = 0;
    this.actionSprite.setVisible(false);
};
// スキャン実行
Bot.prototype.performScan = function(scene) {
    // 周囲のサーバーをスキャン
    const directions = [
        {x: 0, y: -1}, // 上
        {x: 1, y: 0},  // 右
        {x: 0, y: 1},  // 下
        {x: -1, y: 0}  // 左
    ];
    
    let scannedCount = 0;
    
    // 現在地のサーバーもスキャン
    const currentServer = scene.getServerAt(this.gridX, this.gridY);
    if (currentServer && !currentServer.isScanned) {
        currentServer.setScanned(true);
        scannedCount++;
    }
    
    // 周囲のサーバーをスキャン
    directions.forEach(dir => {
        const scanX = this.gridX + dir.x;
        const scanY = this.gridY + dir.y;
        
        if (scanX >= 0 && scanX < CONFIG.GRID_SIZE && scanY >= 0 && scanY < CONFIG.GRID_SIZE) {
            const server = scene.getServerAt(scanX, scanY);
            if (server && !server.isScanned) {
                server.setScanned(true);
                scannedCount++;
            }
        }
    });
    
    scene.addChatMessage('SYSTEM', `Bot${this.id}が${scannedCount}個のサーバーをスキャンしました`);
};

// 複製実行
Bot.prototype.performReplicate = function(scene) {
    // 周囲の空きマスを探す
    const directions = [
        {x: 0, y: -1}, // 上
        {x: 1, y: 0},  // 右
        {x: 0, y: 1},  // 下
        {x: -1, y: 0}  // 左
    ];
    
    // ランダムに方向をシャッフル
    directions.sort(() => Math.random() - 0.5);
    
    // マシンパワーチェック（プレイヤーのみ）
    if (this.owner === 'player' && scene.machinePower < CONFIG.BOT_COST) {
        scene.addChatMessage('ERROR', `Bot複製に必要なマシンパワーが不足しています (必要: ${CONFIG.BOT_COST})`);
        return;
    }
    
    let created = false;
    
    for (const dir of directions) {
        const newX = this.gridX + dir.x;
        const newY = this.gridY + dir.y;
        
        // グリッド内かつ他のBOTがいない場所を探す
        if (newX >= 0 && newX < CONFIG.GRID_SIZE && 
            newY >= 0 && newY < CONFIG.GRID_SIZE && 
            !scene.isBotAt(newX, newY)) {
            
            // 新しいBOT作成
            const newBotId = scene.getNextBotId();
            const newBot = new Bot(newBotId, this.owner, newX, newY);
            
            if (this.owner === 'player') {
                scene.playerBots.push(newBot);
                scene.addMachinePower(-CONFIG.BOT_COST);
            } else {
                scene.enemyBots.push(newBot);
            }
            
            newBot.createVisuals(scene);
            
            scene.addChatMessage('SYSTEM', `Bot${this.id}が新しいBot${newBotId}を作成しました`);
            created = true;
            break;
        }
    }
    
    if (!created) {
        scene.addChatMessage('ERROR', `Bot${this.id}の複製に失敗しました: 周囲に空きがありません`);
    }
};
// 攻性防壁設置
Bot.prototype.performAggressiveFirewall = function(scene, server) {
    // サーバーチェック
    if (!server || server.owner !== this.owner) {
        scene.addChatMessage('ERROR', `Bot${this.id}の攻性防壁設置に失敗しました: 自分のサーバーである必要があります`);
        return;
    }
    
    // マシンパワーチェック（プレイヤーのみ）
    if (this.owner === 'player' && scene.machinePower < 40) {
        scene.addChatMessage('ERROR', `攻性防壁設置に必要なマシンパワーが不足しています (必要: 40)`);
        return;
    }
    
    // 攻性防壁設置
    server.setAggressiveFirewall(true);
    scene.addChatMessage('SYSTEM', `Bot${this.id}が攻性防壁を設置しました`);
    
    // マシンパワー消費
    if (this.owner === 'player') {
        scene.addMachinePower(-40);
    }
};

// ワーム設置
Bot.prototype.performWorm = function(scene, server) {
    // サーバーチェック
    if (!server || server.owner !== this.owner) {
        scene.addChatMessage('ERROR', `Bot${this.id}のワーム設置に失敗しました: 自分のサーバーである必要があります`);
        return;
    }
    
    // マシンパワーチェック（プレイヤーのみ）
    if (this.owner === 'player' && scene.machinePower < 45) {
        scene.addChatMessage('ERROR', `ワーム設置に必要なマシンパワーが不足しています (必要: 45)`);
        return;
    }
    
    // ワーム設置
    server.setWorm(true, scene);
    scene.addChatMessage('SYSTEM', `Bot${this.id}がワームを設置しました`);
    
    // マシンパワー消費
    if (this.owner === 'player') {
        scene.addMachinePower(-45);
    }
};

// バックドア設置
Bot.prototype.performBackdoor = function(scene, server) {
    // サーバーチェック
    if (!server || server.owner !== this.owner) {
        scene.addChatMessage('ERROR', `Bot${this.id}のバックドア設置に失敗しました: 自分のサーバーである必要があります`);
        return;
    }
    
    // マシンパワーチェック（プレイヤーのみ）
    if (this.owner === 'player' && scene.machinePower < 35) {
        scene.addChatMessage('ERROR', `バックドア設置に必要なマシンパワーが不足しています (必要: 35)`);
        return;
    }
    
    // バックドア設置
    server.setBackdoor(true);
    scene.addChatMessage('SYSTEM', `Bot${this.id}がバックドアを設置しました`);
    
    // マシンパワー消費
    if (this.owner === 'player') {
        scene.addMachinePower(-35);
    }
};
// ハニーネット設置
Bot.prototype.performHoneypot = function(scene, server) {
    // サーバーチェック
    if (!server || server.owner !== this.owner) {
        scene.addChatMessage('ERROR', `Bot${this.id}のハニーネット設置に失敗しました: 自分のサーバーである必要があります`);
        return;
    }
    
    // マシンパワーチェック（プレイヤーのみ）
    if (this.owner === 'player' && scene.machinePower < 25) {
        scene.addChatMessage('ERROR', `ハニーネット設置に必要なマシンパワーが不足しています (必要: 25)`);
        return;
    }
    
    // ハニーネット設置
    server.setHoneypot(true);
    scene.addChatMessage('SYSTEM', `Bot${this.id}がハニーネットを設置しました`);
    
    // マシンパワー消費
    if (this.owner === 'player') {
        scene.addMachinePower(-25);
    }
};

// トロイの木馬設置
Bot.prototype.performTrojan = function(scene, server) {
    // サーバーチェック
    if (!server || server.owner === this.owner) {
        scene.addChatMessage('ERROR', `Bot${this.id}のトロイの木馬設置に失敗しました: 敵のサーバーである必要があります`);
        return;
    }
    
    // マシンパワーチェック（プレイヤーのみ）
    if (this.owner === 'player' && scene.machinePower < 50) {
        scene.addChatMessage('ERROR', `トロイの木馬設置に必要なマシンパワーが不足しています (必要: 50)`);
        return;
    }
    
    // トロイの木馬設置
    server.setTrojan(true, scene);
    scene.addChatMessage('SYSTEM', `Bot${this.id}がトロイの木馬を設置しました`);
    
    // マシンパワー消費
    if (this.owner === 'player') {
        scene.addMachinePower(-50);
    }
};

// タイムボム設置
Bot.prototype.performTimebomb = function(scene, server) {
    // サーバーチェック
    if (!server || server.owner !== this.owner) {
        scene.addChatMessage('ERROR', `Bot${this.id}のタイムボム設置に失敗しました: 自分のサーバーである必要があります`);
        return;
    }
    
    // マシンパワーチェック（プレイヤーのみ）
    if (this.owner === 'player' && scene.machinePower < 45) {
        scene.addChatMessage('ERROR', `タイムボム設置に必要なマシンパワーが不足しています (必要: 45)`);
        return;
    }
    
    // タイムボム設置
    server.setTimebomb(true);
    scene.addChatMessage('SYSTEM', `Bot${this.id}がタイムボムを設置しました`);
    
    // マシンパワー消費
    if (this.owner === 'player') {
        scene.addMachinePower(-45);
    }
};
// デコイBOT作成
Bot.prototype.performDecoyBot = function(scene) {
    // マシンパワーチェック（プレイヤーのみ）
    if (this.owner === 'player' && scene.machinePower < 20) {
        scene.addChatMessage('ERROR', `デコイBOT作成に必要なマシンパワーが不足しています (必要: 20)`);
        return;
    }
    
    // 隣接マスに空きがあるか確認
    const directions = [
        {x: 0, y: -1}, // 上
        {x: 1, y: 0},  // 右
        {x: 0, y: 1},  // 下
        {x: -1, y: 0}  // 左
    ];
    
    // ランダムに方向をシャッフル
    directions.sort(() => Math.random() - 0.5);
    
    let created = false;
    
    for (const dir of directions) {
        const newX = this.gridX + dir.x;
        const newY = this.gridY + dir.y;
        
        // グリッド内かつ他のBOTがいない場所を探す
        if (newX >= 0 && newX < CONFIG.GRID_SIZE && 
            newY >= 0 && newY < CONFIG.GRID_SIZE && 
            !scene.isBotAt(newX, newY)) {
            
            // デコイBOT作成
            const decoyBot = {
                id: scene.getNextBotId(),
                owner: this.owner,
                gridX: newX,
                gridY: newY,
                isDecoy: true,
                sprite: null,
                nameText: null
            };
            
            // デコイBOTの視覚表現
            const color = this.owner === 'player' ? CONFIG.COLORS.BOT_PLAYER : CONFIG.COLORS.BOT_ENEMY;
            const strokeColor = this.owner === 'player' ? 0xffffff : CONFIG.COLORS.ENEMY;
            
            const pixelX = newX * CONFIG.GRID_CELL_SIZE + CONFIG.GRID_OFFSET_X;
            const pixelY = newY * CONFIG.GRID_CELL_SIZE + CONFIG.GRID_OFFSET_Y;
            
            decoyBot.sprite = scene.add.circle(pixelX, pixelY, 10, color, 0.7); // 透明度で区別
            decoyBot.sprite.setStrokeStyle(2, strokeColor);
            
            decoyBot.nameText = scene.add.text(pixelX, pixelY - 20, `Bot${decoyBot.id}`, {
                font: '12px Courier',
                fill: this.owner === 'player' ? '#00ffff' : '#ff00ff'
            });
            decoyBot.nameText.setOrigin(0.5);
            
            // デコイBOTをリストに追加
            if (this.owner === 'player') {
                scene.playerDecoyBots = scene.playerDecoyBots || [];
                scene.playerDecoyBots.push(decoyBot);
            } else {
                scene.enemyDecoyBots = scene.enemyDecoyBots || [];
                scene.enemyDecoyBots.push(decoyBot);
            }
            
            scene.addChatMessage('SYSTEM', `Bot${this.id}がデコイBot${decoyBot.id}を作成しました`);
            
            // マシンパワー消費
            if (this.owner === 'player') {
                scene.addMachinePower(-20);
            }
            
            created = true;
            break;
        }
    }
    
    if (!created) {
        scene.addChatMessage('ERROR', `Bot${this.id}のデコイBOT作成に失敗しました: 周囲に空きがありません`);
    }
};
// 侵入実行
Bot.prototype.performHack = function(scene, server) {
    if (!server) return;
    
    // 既に所有している場合は何もしない
    if (server.owner === this.owner) {
        scene.addChatMessage('SYSTEM', `Bot${this.id}の侵入: 既に制御下のサーバーです`);
        return;
    }
    
    // ハニーネットチェック
    if (server.hasHoneypot && server.owner !== this.owner) {
        scene.addChatMessage('SYSTEM', `Bot${this.id}がハニーネットに捕捉されました！`);
        
        // 10秒間すべてのアクションをクールダウン状態に
        Object.keys(this.cooldowns).forEach(key => {
            this.cooldowns[key] = 10000;
        });
        
        // ハニーネットを消費
        server.setHoneypot(false);
        return;
    }
    
    // ディープラーニングによる成功率ボーナス
    let successRateBonus = 0;
    if (this.hasDeepLearning) {
        successRateBonus = this.learningLevel * 0.05; // 5%ずつ上昇
    }
    
    // 侵入成功率計算
    const successRate = Math.min(0.95, server.getHackSuccessRate() + successRateBonus);
    const success = Math.random() < successRate;
    
    if (success) {
        // 侵入成功
        const oldOwner = server.owner;
        server.setOwner(this.owner);
        
        // マシンパワー加算
        if (this.owner === 'player') {
            scene.addMachinePower(CONFIG.SERVER_POWER);
            scene.addChatMessage('SYSTEM', `Bot${this.id}がサーバーを制圧しました! (+${CONFIG.SERVER_POWER}パワー)`);
            
            // ディープラーニングレベル上昇
            if (this.hasDeepLearning && this.learningLevel < 6) {
                this.learningLevel++;
                scene.addChatMessage('SYSTEM', `Bot${this.id}のディープラーニングレベルが上昇しました (Lv.${this.learningLevel})`);
            }
        } else {
            scene.addChatMessage('ENEMY', `敵Bot${this.id}がサーバーを制圧しました`);
        }
        
        // フラグチェック
        if (server.hasFlag) {
            if (oldOwner === 'player' && this.owner === 'enemy') {
                // プレイヤー敗北
                scene.gameOver(false);
            } else if (oldOwner === 'enemy' && this.owner === 'player') {
                // プレイヤー勝利
                scene.gameOver(true);
            }
        }
    } else {
        // 侵入失敗
        scene.addChatMessage('SYSTEM', `Bot${this.id}の侵入に失敗しました (成功率: ${Math.floor(successRate * 100)}%)`);
        
        // 攻性防壁の効果
        if (server.hasAggressiveFirewall) {
            const destroyChance = Math.random();
            
            if (destroyChance < 0.5) {
                // BOT破壊
                scene.addChatMessage('SYSTEM', `${server.owner === 'player' ? 'あなた' : '敵'}の攻性防壁がBot${this.id}を破壊しました!`);
                
                // BOTを削除
                if (this.owner === 'player') {
                    const botIndex = scene.playerBots.findIndex(bot => bot.id === this.id);
                    if (botIndex !== -1) {
                        scene.playerBots.splice(botIndex, 1);
                    }
                } else {
                    const botIndex = scene.enemyBots.findIndex(bot => bot.id === this.id);
                    if (botIndex !== -1) {
                        scene.enemyBots.splice(botIndex, 1);
                    }
                }
                
                // 視覚オブジェクト削除
                if (this.sprite) this.sprite.destroy();
                if (this.nameText) this.nameText.destroy();
                if (this.actionSprite) this.actionSprite.destroy();
                
                // 攻性防壁の弱体化
                server.defenseLevel = Math.max(0, server.defenseLevel - 1);
                server.setAggressiveFirewall(false);
                scene.addChatMessage('SYSTEM', `攻性防壁が消滅しました`);
            } else {
                // 一時的に行動不能
                scene.addChatMessage('SYSTEM', `${server.owner === 'player' ? 'あなた' : '敵'}の攻性防壁がBot${this.id}を一時的に無効化しました!`);
                
                // 10秒間すべてのアクションをクールダウン状態に
                Object.keys(this.cooldowns).forEach(key => {
                    this.cooldowns[key] = 10000;
                });
                
                // 攻性防壁の弱体化
                server.defenseLevel = Math.max(0, server.defenseLevel - 1);
            }
        }
    }
};
