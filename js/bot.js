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
        this.action = null; // scan, hack, defend, replicate, decoy
        this.actionProgress = 0;
        this.actionTime = 0;
        this.cooldowns = {
            scan: 0,
            hack: 0,
            defend: 0,
            replicate: 0,
            decoy: 0
        };
        
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
    
    // BOTの視覚的表現を作成
    createVisuals(scene) {
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
        
        // アクション進行表示（初期は非表示）
        this.actionSprite = scene.add.arc(this.x, this.y, 15, 0, 0, false, 0xffffff, 0.5);
        this.actionSprite.setVisible(false);
        
        return this;
    }
    
    // BOTを更新（毎フレーム呼び出し）
    update(delta, scene) {
        // クールダウン更新
        Object.keys(this.cooldowns).forEach(key => {
            if (this.cooldowns[key] > 0) {
                this.cooldowns[key] = Math.max(0, this.cooldowns[key] - delta);
            }
        });
        
        // 状態に応じた処理
        switch (this.state) {
            case 'moving':
                this.updateMovement(delta);
                break;
                
            case 'action':
                this.updateAction(delta, scene);
                break;
        }
        
        // 視覚表現の更新
        this.updateVisuals();
    }
    
    // 移動処理
    updateMovement(delta) {
        if (this.path.length > 0) {
            // パス移動
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
    }
    
    // アクション処理
    updateAction(delta, scene) {
        if (!this.action) {
            this.state = 'idle';
            return;
        }
        
        this.actionProgress += delta;
        
        // アクション完了チェック
        if (this.actionProgress >= this.actionTime) {
            this.completeAction(scene);
        }
    }
    
    // アクション完了処理
    completeAction(scene) {
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
        }
        
        // エフェクト表示
        this.showActionEffect(scene);
        
        // 状態リセット
        this.state = 'idle';
        this.action = null;
        this.actionProgress = 0;
        this.actionTime = 0;
        this.actionSprite.setVisible(false);
    }
    
    // スキャン実行
    performScan(scene) {
        // 隣接4マスをスキャン
        const directions = [
            {x: 0, y: -1}, // 上
            {x: 1, y: 0},  // 右
            {x: 0, y: 1},  // 下
            {x: -1, y: 0}  // 左
        ];
        
        let scannedCount = 0;
        
        // 現在地のサーバーもスキャン
        const currentServer = scene.getServerAt(this.gridX, this.gridY);
        if (currentServer) {
            currentServer.setScanned(true);
            scannedCount++;
        }
        
        directions.forEach(dir => {
            const scanX = this.gridX + dir.x;
            const scanY = this.gridY + dir.y;
            
            if (scanX >= 0 && scanX < CONFIG.GRID_SIZE && scanY >= 0 && scanY < CONFIG.GRID_SIZE) {
                const server = scene.getServerAt(scanX, scanY);
                if (server) {
                    server.setScanned(true);
                    scannedCount++;
                    
                    // スキャンラインエフェクト
                    const startX = this.x;
                    const startY = this.y;
                    const endX = server.getPixelPosition().x;
                    const endY = server.getPixelPosition().y;
                    
                    const line = scene.add.line(0, 0, startX, startY, endX, endY, CONFIG.COLORS.ACTION_SCAN, 0.8);
                    line.setLineWidth(2);
                    
                    scene.tweens.add({
                        targets: line,
                        alpha: 0,
                        duration: 1000,
                        onComplete: () => {
                            line.destroy();
                        }
                    });
                }
            }
        });
        
        scene.addChatMessage('SYSTEM', `Bot${this.id}が周囲をスキャンしました (${scannedCount}サーバー検出)`);
    }
    
    // 侵入実行
    performHack(scene, server) {
        if (!server) return;
        
        // 既に所有している場合は何もしない
        if (server.owner === this.owner) {
            scene.addChatMessage('SYSTEM', `Bot${this.id}の侵入: 既に制御下のサーバーです`);
            return;
        }
        
        // 侵入成功率計算
        const successRate = server.getHackSuccessRate();
        const success = Math.random() < successRate;
        
        if (success) {
            // 侵入成功
            const oldOwner = server.owner;
            server.setOwner(this.owner);
            
            // マシンパワー加算
            if (this.owner === 'player') {
                scene.addMachinePower(CONFIG.SERVER_POWER);
                scene.addChatMessage('SYSTEM', `Bot${this.id}がサーバーを制圧しました! (+${CONFIG.SERVER_POWER}パワー)`);
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
        }
    }
    
    // 複製実行
    performReplicate(scene) {
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
                
                // マシンパワーチェック（プレイヤーのみ）
                if (this.owner === 'player' && scene.machinePower < CONFIG.BOT_COST) {
                    scene.addChatMessage('ERROR', `BOT複製に必要なマシンパワーが不足しています (必要: ${CONFIG.BOT_COST})`);
                    break;
                }
                
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
                
                // 複製エフェクト
                this.showReplicateEffect(scene, newBot);
                
                scene.addChatMessage('SYSTEM', `Bot${this.id}が新しいBot${newBotId}を作成しました`);
                created = true;
                break;
            }
        }
        
        if (!created) {
            scene.addChatMessage('ERROR', `Bot${this.id}の複製に失敗しました: 周囲に空きがありません`);
        }
    }
    
    // 指定座標への移動を開始
    moveTo(targetGridX, targetGridY) {
        // グリッド範囲チェック
        if (targetGridX < 0 || targetGridX >= CONFIG.GRID_SIZE || 
            targetGridY < 0 || targetGridY >= CONFIG.GRID_SIZE) {
            return false;
        }
        
        this.targetGridX = targetGridX;
        this.targetGridY = targetGridY;
        this.targetX = targetGridX * CONFIG.GRID_CELL_SIZE + CONFIG.GRID_OFFSET_X;
        this.targetY = targetGridY * CONFIG.GRID_CELL_SIZE + CONFIG.GRID_OFFSET_Y;
        
        // ネットワークパスを生成
        this.path = [];
        this.generateNetworkPath();
        this.state = 'moving';
        
        return true;
    }
    
    // ネットワーク上のパスを生成
    generateNetworkPath() {
        // 現在のシーンを取得
        const scene = this.sprite.scene;
        
        // 開始点と終了点
        const startX = this.gridX;
        const startY = this.gridY;
        const endX = this.targetGridX;
        const endY = this.targetGridY;
        
        // 同じ場所なら何もしない
        if (startX === endX && startY === endY) {
            return;
        }
        
        // サーバーノードの位置を取得
        const servers = scene.servers;
        const serverPositions = servers.map(server => ({
            x: server.gridX,
            y: server.gridY
        }));
        
        // 開始点と終了点をノードリストに追加
        const nodes = [...serverPositions];
        
        // 開始点と終了点が既存のノードになければ追加
        const startExists = nodes.some(node => node.x === startX && node.y === startY);
        const endExists = nodes.some(node => node.x === endX && node.y === endY);
        
        if (!startExists) {
            nodes.push({ x: startX, y: startY });
        }
        
        if (!endExists) {
            nodes.push({ x: endX, y: endY });
        }
        
        // 最短経路を見つける（単純なグリーディアルゴリズム）
        let currentNode = { x: startX, y: startY };
        const path = [currentNode];
        
        // 最大ホップ数を制限（無限ループ防止）
        const maxHops = 10;
        let hops = 0;
        
        while ((currentNode.x !== endX || currentNode.y !== endY) && hops < maxHops) {
            // 現在のノードから最も近いノードを見つける
            let closestNode = null;
            let minDistance = Infinity;
            
            for (const node of nodes) {
                // 既に訪問したノードはスキップ
                if (path.some(p => p.x === node.x && p.y === node.y)) {
                    continue;
                }
                
                // 現在のノードからの距離
                const distance = Math.abs(node.x - currentNode.x) + Math.abs(node.y - currentNode.y);
                
                // 目標ノードへの距離
                const targetDistance = Math.abs(node.x - endX) + Math.abs(node.y - endY);
                
                // 合計スコア（現在からの距離 + 目標への距離）
                const score = distance + targetDistance;
                
                if (score < minDistance) {
                    minDistance = score;
                    closestNode = node;
                }
            }
            
            // 次のノードが見つからなければ終了
            if (!closestNode) {
                break;
            }
            
            // パスに追加
            path.push(closestNode);
            currentNode = closestNode;
            hops++;
        }
        
        // 最後のノードが目標でなければ、目標を追加
        if (currentNode.x !== endX || currentNode.y !== endY) {
            path.push({ x: endX, y: endY });
        }
        
        // パスをピクセル座標に変換
        this.path = path.slice(1).map(node => ({
            x: node.x * CONFIG.GRID_CELL_SIZE + CONFIG.GRID_OFFSET_X,
            y: node.y * CONFIG.GRID_CELL_SIZE + CONFIG.GRID_OFFSET_Y
        }));
    }
    
    // アクション開始
    startAction(action, scene) {
        // クールダウンチェック
        if (this.cooldowns[action] > 0) {
            scene.addChatMessage('ERROR', `Bot${this.id}の${this.getActionName(action)}はクールダウン中です (残り${Math.ceil(this.cooldowns[action] / 1000)}秒)`);
            return false;
        }
        
        // アクション時間設定
        switch (action) {
            case 'scan':
                this.actionTime = CONFIG.SCAN_TIME;
                break;
            case 'hack':
                this.actionTime = CONFIG.HACK_TIME;
                break;
            case 'defend':
                this.actionTime = CONFIG.DEFEND_TIME;
                break;
            case 'replicate':
                this.actionTime = CONFIG.REPLICATE_TIME;
                break;
            case 'decoy':
                this.actionTime = CONFIG.DECOY_TIME;
                break;
            default:
                return false;
        }
        
        this.action = action;
        this.actionProgress = 0;
        this.state = 'action';
        
        scene.addChatMessage('SYSTEM', `Bot${this.id}が${this.getActionName(action)}を開始しました`);
        return true;
    }
    
    // アクション名を日本語で取得
    getActionName(action) {
        switch (action) {
            case 'scan': return 'スキャン';
            case 'hack': return '侵入';
            case 'defend': return '防御';
            case 'replicate': return '複製';
            case 'decoy': return '偽装';
            default: return action;
        }
    }
    
    // 視覚表現の更新
    updateVisuals() {
        if (!this.sprite) return;
        
        // 位置更新
        this.sprite.setPosition(this.x, this.y);
        this.nameText.setPosition(this.x, this.y - 20);
        
        // アクション進行表示
        if (this.state === 'action' && this.action) {
            this.actionSprite.setPosition(this.x, this.y);
            this.actionSprite.setVisible(true);
            
            // 進行度に応じてアークを描画
            const progress = this.actionProgress / this.actionTime;
            const angle = progress * 360;
            this.actionSprite.setStartAngle(0);
            this.actionSprite.setEndAngle(Phaser.Math.DegToRad(angle));
            
            // アクションタイプに応じた色
            let color;
            switch (this.action) {
                case 'scan': color = CONFIG.COLORS.ACTION_SCAN; break;
                case 'hack': color = CONFIG.COLORS.ACTION_HACK; break;
                case 'defend': color = CONFIG.COLORS.ACTION_DEFEND; break;
                case 'replicate': color = CONFIG.COLORS.ACTION_REPLICATE; break;
                case 'decoy': color = CONFIG.COLORS.ACTION_DECOY; break;
                default: color = 0xffffff;
            }
            this.actionSprite.fillColor = color;
        } else {
            this.actionSprite.setVisible(false);
        }
    }
    
    // アクションエフェクト表示
    showActionEffect(scene) {
        if (!this.action) return;
        
        let color;
        switch (this.action) {
            case 'scan': color = CONFIG.COLORS.ACTION_SCAN; break;
            case 'hack': color = CONFIG.COLORS.ACTION_HACK; break;
            case 'defend': color = CONFIG.COLORS.ACTION_DEFEND; break;
            case 'replicate': color = CONFIG.COLORS.ACTION_REPLICATE; break;
            case 'decoy': color = CONFIG.COLORS.ACTION_DECOY; break;
            default: color = 0xffffff;
        }
        
        const effect = scene.add.circle(this.x, this.y, 15, color, 0.5);
        
        scene.tweens.add({
            targets: effect,
            radius: 30,
            alpha: 0,
            duration: 1000,
            onUpdate: () => {
                effect.setRadius(effect.radius);
            },
            onComplete: () => {
                effect.destroy();
            }
        });
    }
    
    // 複製エフェクト表示
    showReplicateEffect(scene, newBot) {
        // 8方向に粒子を飛ばす
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const dx = Math.cos(angle) * 30;
            const dy = Math.sin(angle) * 30;
            
            const particle = scene.add.circle(this.x, this.y, 3, CONFIG.COLORS.ACTION_REPLICATE, 0.8);
            
            scene.tweens.add({
                targets: particle,
                x: this.x + dx,
                y: this.y + dy,
                alpha: 0,
                duration: 800,
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }
    
    // 状態情報を取得
    getStatusText() {
        let status = '';
        
        if (this.state === 'moving') {
            status = '移動中';
        } else if (this.state === 'action') {
            status = `${this.getActionName(this.action)} ${Math.floor((this.actionProgress / this.actionTime) * 100)}%`;
        } else {
            status = '待機中';
        }
        
        // クールダウン情報
        const cooldowns = [];
        Object.keys(this.cooldowns).forEach(key => {
            if (this.cooldowns[key] > 0) {
                cooldowns.push(`${this.getActionName(key)}:${Math.ceil(this.cooldowns[key] / 1000)}s`);
            }
        });
        
        if (cooldowns.length > 0) {
            status += ` (CD: ${cooldowns.join(', ')})`;
        }
        
        return status;
    }
}
