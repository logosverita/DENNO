// メインゲームシーン
class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        
        // ゲーム状態
        this.servers = [];
        this.playerBots = [];
        this.enemyBots = [];
        this.playerDecoyBots = []; // デコイBOT用
        this.enemyDecoyBots = []; // デコイBOT用
        this.nextBotId = 1;
        this.networkConnections = []; // ネットワーク接続を保存
        
        // リソース
        this.machinePower = CONFIG.INITIAL_POWER;
        this.maxMachinePower = CONFIG.INITIAL_POWER;
        
        // UI要素
        this.statusPanel = null;
        this.powerText = null;
        this.powerBar = null;
        this.botCountText = null;
        this.serverCountText = null;
        this.botListText = null;
        
        // コマンドインタープリター
        this.commandInterpreter = null;
        
        // タイマー
        this.enemyAiTimer = null;
        this.uiUpdateTimer = null;
        
        // ゲーム終了フラグ
        this.isGameOver = false;
    }
    
    create() {
        // グリッド作成
        this.createGrid();
        
        // サーバー配置
        this.createServers();
        
        // フラグ配置
        this.placeFlags();
        
        // BOT初期配置
        this.createInitialBots();
        
        // UI作成
        this.createUI();
        
        // コマンドインタープリター初期化
        this.commandInterpreter = new CommandInterpreter(this);
        
        // チャットイベント設定
        this.setupChatEvents();
        
        // 敵AI起動
        this.enemyAiTimer = this.time.addEvent({
            delay: CONFIG.ENEMY_AI_INTERVAL,
            callback: this.updateEnemyAI,
            callbackScope: this,
            loop: true
        });
        
        // UI更新タイマー
        this.uiUpdateTimer = this.time.addEvent({
            delay: CONFIG.UI_UPDATE_INTERVAL,
            callback: this.updateUI,
            callbackScope: this,
            loop: true
        });
        
        // フェードイン効果
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        
        // 初期メッセージ
        this.addChatMessage('SYSTEM', '電脳戦へようこそ。「ヘルプ」と入力してコマンド一覧を表示します。');
    }
    
    update(time, delta) {
        if (this.isGameOver) return;
        
        // BOT更新
        this.playerBots.forEach(bot => bot.update(delta, this));
        this.enemyBots.forEach(bot => bot.update(delta, this));
        
        // ネットワーク接続の表示更新
        this.networkConnections.forEach(connection => connection.update());
    }
    
    // グリッド作成
    createGrid() {
        const graphics = this.add.graphics();
        graphics.lineStyle(1, CONFIG.COLORS.GRID, 0.3);
        
        // 縦線
        for (let x = 0; x <= CONFIG.GRID_SIZE; x++) {
            const posX = x * CONFIG.GRID_CELL_SIZE + CONFIG.GRID_OFFSET_X;
            graphics.moveTo(posX, CONFIG.GRID_OFFSET_Y);
            graphics.lineTo(posX, CONFIG.GRID_OFFSET_Y + CONFIG.GRID_SIZE * CONFIG.GRID_CELL_SIZE);
        }
        
        // 横線
        for (let y = 0; y <= CONFIG.GRID_SIZE; y++) {
            const posY = y * CONFIG.GRID_CELL_SIZE + CONFIG.GRID_OFFSET_Y;
            graphics.moveTo(CONFIG.GRID_OFFSET_X, posY);
            graphics.lineTo(CONFIG.GRID_OFFSET_X + CONFIG.GRID_SIZE * CONFIG.GRID_CELL_SIZE, posY);
        }
        
        graphics.strokePath();
        
        // 座標番号を表示（線の延長線上に配置）
        // 上側の数字（X座標）
        for (let x = 0; x < CONFIG.GRID_SIZE; x++) {
            const posX = x * CONFIG.GRID_CELL_SIZE + CONFIG.GRID_OFFSET_X;
            const posY = CONFIG.GRID_OFFSET_Y - 15;
            
            this.add.text(posX, posY, `${x}`, {
                font: '14px Courier',
                fill: '#00ff00',
                align: 'center'
            }).setOrigin(0.5);
        }
        
        // 左側の数字（Y座標）
        for (let y = 0; y < CONFIG.GRID_SIZE; y++) {
            const posX = CONFIG.GRID_OFFSET_X - 15;
            const posY = y * CONFIG.GRID_CELL_SIZE + CONFIG.GRID_OFFSET_Y;
            
            this.add.text(posX, posY, `${y}`, {
                font: '14px Courier',
                fill: '#00ff00',
                align: 'center'
            }).setOrigin(0.5);
        }
    }
    
    // サーバー配置
    createServers() {
        // サーバー配置確率（0.33 = 33%）
        const serverPlacementRate = 0.33;
        
        for (let y = 0; y < CONFIG.GRID_SIZE; y++) {
            for (let x = 0; x < CONFIG.GRID_SIZE; x++) {
                if (Math.random() < serverPlacementRate) {
                    const server = new Server(x, y);
                    server.createVisuals(this);
                    this.servers.push(server);
                }
            }
        }
        
        // サーバー間の接続線を描画
        this.drawNetworkConnections();
    }
    
    // サーバー間のネットワーク接続を描画
    drawNetworkConnections() {
        const graphics = this.add.graphics();
        graphics.lineStyle(1, CONFIG.COLORS.GRID, 0.4);
        
        // 各サーバーから近隣のサーバーへ接続
        for (let i = 0; i < this.servers.length; i++) {
            const server1 = this.servers[i];
            const pos1 = server1.getPixelPosition();
            
            for (let j = i + 1; j < this.servers.length; j++) {
                const server2 = this.servers[j];
                const pos2 = server2.getPixelPosition();
                
                // マンハッタン距離で近いサーバー同士を接続
                const gridDist = Math.abs(server1.gridX - server2.gridX) + Math.abs(server1.gridY - server2.gridY);
                
                if (gridDist <= 2) {
                    // 接続線は最初は非表示
                    const line = this.add.line(0, 0, pos1.x, pos1.y, pos2.x, pos2.y, CONFIG.COLORS.GRID, 0.4);
                    line.setLineWidth(1);
                    line.setVisible(false);
                    
                    // 接続線の表示/非表示を制御するオブジェクト
                    const connection = {
                        line: line,
                        server1: server1,
                        server2: server2,
                        update: function() {
                            // 両方のサーバーがスキャン済みの場合のみ表示
                            this.line.setVisible(this.server1.isScanned && this.server2.isScanned);
                        }
                    };
                    
                    // 接続情報を保存
                    this.networkConnections.push(connection);
                }
            }
        }
    }
    
    // フラグ配置
    placeFlags() {
        // プレイヤーフラグ（下側3行）
        const playerFlagServers = this.servers.filter(server => 
            server.gridY >= CONFIG.GRID_SIZE - 3
        );
        
        if (playerFlagServers.length > 0) {
            const playerFlagServer = Phaser.Utils.Array.GetRandom(playerFlagServers);
            playerFlagServer.setFlag(true).setOwner('player').setScanned(true); // プレイヤーフラグは最初から見える
            this.addChatMessage('SYSTEM', 'プレイヤーフラグを配置しました');
        }
        
        // 敵フラグ（上側3行）
        const enemyFlagServers = this.servers.filter(server => 
            server.gridY < 3
        );
        
        if (enemyFlagServers.length > 0) {
            const enemyFlagServer = Phaser.Utils.Array.GetRandom(enemyFlagServers);
            enemyFlagServer.setFlag(true).setOwner('enemy');
            this.addChatMessage('SYSTEM', '敵フラグを配置しました');
        }
    }
    
    // BOT初期配置
    createInitialBots() {
        // プレイヤーBOT（下側）- 初期マシンパワーが0なので1体だけ
        const x = Math.floor(Math.random() * CONFIG.GRID_SIZE);
        const y = CONFIG.GRID_SIZE - 1 - Math.floor(Math.random() * 3);
        
        const bot = new Bot(this.nextBotId++, 'player', x, y);
        bot.createVisuals(this);
        this.playerBots.push(bot);
        
        // 敵BOT（上側）
        for (let i = 0; i < 3; i++) {
            const x = Math.floor(Math.random() * CONFIG.GRID_SIZE);
            const y = Math.floor(Math.random() * 3);
            
            const bot = new Bot(this.nextBotId++, 'enemy', x, y);
            bot.createVisuals(this);
            this.enemyBots.push(bot);
        }
    }
    
    // UI作成
    createUI() {
        // 基準となるマシンパワー表示の位置
        const basePosX = 600;
        const basePosY = 110;
        
        // ステータスパネル背景 - 右上に配置
        this.statusPanel = this.add.rectangle(basePosX + 100, basePosY + 90, 200, 200, 0x000000, 0.7);
        this.statusPanel.setStrokeStyle(1, CONFIG.COLORS.GRID);
        
        // タイトル
        this.add.text(basePosX + 100, 50, '電脳戦', {
            font: '16px Courier',
            fill: '#00ff00',
            align: 'center'
        }).setOrigin(0.5);
        
        // マシンパワー表示
        this.add.text(basePosX, basePosY, 'マシンパワー:', {
            font: '14px Courier',
            fill: '#00ff00'
        });
        
        this.powerText = this.add.text(basePosX, basePosY + 20, `${this.machinePower} / ∞`, {
            font: '14px Courier',
            fill: '#00ffff'
        });
        
        // パワーバー
        this.powerBar = this.add.rectangle(basePosX + 90, basePosY + 40, 180, 10, 0x003300);
        this.powerBar.setStrokeStyle(1, CONFIG.COLORS.GRID);
        
        this.powerBarFill = this.add.rectangle(basePosX, basePosY + 40, 0, 8, CONFIG.COLORS.PLAYER);
        this.powerBarFill.setOrigin(0, 0.5);
        
        // BOT数表示
        this.botCountText = this.add.text(basePosX, basePosY + 60, '活動中BOT: 1', {
            font: '14px Courier',
            fill: '#00ff00'
        });
        
        // サーバー数表示
        this.serverCountText = this.add.text(basePosX, basePosY + 80, '制御サーバー: 1', {
            font: '14px Courier',
            fill: '#00ff00'
        });
        
        // 区切り線
        const line = this.add.line(basePosX + 90, basePosY + 100, 0, 0, 180, 0, CONFIG.COLORS.GRID);
        line.setLineWidth(1);
        
        // BOTリスト
        this.add.text(basePosX, basePosY + 120, 'BOT一覧', {
            font: '14px Courier',
            fill: '#00ff00'
        });
        
        this.botListText = this.add.text(basePosX, basePosY + 140, '', {
            font: '12px Courier',
            fill: '#00ffff',
            wordWrap: { width: 180 }
        });
        
        // UI初期更新
        this.updateUI();
    }
    
    // UI更新
    updateUI() {
        // マシンパワー更新
        this.powerText.setText(`${this.machinePower} / ∞`);
        
        // パワーバー更新（上限なしなので常に100%表示）
        const barWidth = 180;
        this.powerBarFill.width = barWidth;
        
        // BOT数更新
        this.botCountText.setText(`活動中BOT: ${this.playerBots.length}`);
        
        // サーバー数更新
        const controlledServers = this.servers.filter(server => server.owner === 'player').length;
        this.serverCountText.setText(`制御サーバー: ${controlledServers}`);
        
        // BOTリスト更新
        let botListStr = '';
        this.playerBots.forEach(bot => {
            botListStr += `Bot${bot.id} - (${bot.gridX},${bot.gridY}) - ${bot.getStatusText()}\n`;
        });
        this.botListText.setText(botListStr);
    }
    
    // チャットイベント設定
    setupChatEvents() {
        const chatInput = document.getElementById('chat-input');
        const chatSend = document.getElementById('chat-send');
        
        // コマンド履歴の管理
        this.commandHistory = [];
        this.historyIndex = -1;
        this.currentInput = '';
        
        // 送信ボタンクリック
        chatSend.addEventListener('click', () => {
            this.processChat();
        });
        
        // キー入力
        chatInput.addEventListener('keydown', (e) => {
            // Enterキーで送信
            if (e.key === 'Enter') {
                this.processChat();
                return;
            }
            
            // 上キーで履歴を遡る
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                
                // 初回の上キー押下時は現在の入力を保存
                if (this.historyIndex === -1) {
                    this.currentInput = chatInput.value;
                }
                
                // 履歴がある場合は一つ前のコマンドを表示
                if (this.historyIndex < this.commandHistory.length - 1) {
                    this.historyIndex++;
                    chatInput.value = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
                }
            }
            
            // 下キーで履歴を進める
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                
                if (this.historyIndex > 0) {
                    // 履歴を一つ進める
                    this.historyIndex--;
                    chatInput.value = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
                } else if (this.historyIndex === 0) {
                    // 最新の履歴から抜けたら、保存していた入力を復元
                    this.historyIndex = -1;
                    chatInput.value = this.currentInput;
                }
            }
        });
    }
    
    // チャット処理
    processChat() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        
        if (message) {
            // コマンド履歴に追加
            this.commandHistory.push(message);
            
            // 履歴が長すぎる場合は古いものを削除
            if (this.commandHistory.length > 50) {
                this.commandHistory.shift();
            }
            
            // 履歴インデックスをリセット
            this.historyIndex = -1;
            this.currentInput = '';
            
            // プレイヤーメッセージ表示
            this.addChatMessage('YOU', message);
            
            // コマンド解析
            this.commandInterpreter.interpret(message);
            
            // 入力欄クリア
            chatInput.value = '';
        }
    }
    
    // チャットメッセージ追加
    addChatMessage(type, message) {
        const chatLog = document.getElementById('chat-log');
        const time = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        let cssClass = '';
        let prefix = '';
        
        switch (type) {
            case 'SYSTEM':
                cssClass = 'system-message';
                prefix = '[SYSTEM]';
                break;
            case 'YOU':
                cssClass = 'player-message';
                prefix = '[YOU]';
                break;
            case 'AI':
                cssClass = 'ai-message';
                prefix = '[AI]';
                break;
            case 'ENEMY':
                cssClass = 'enemy-message';
                prefix = '[ENEMY]';
                break;
            case 'ERROR':
                cssClass = 'error-message';
                prefix = '[ERROR]';
                break;
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = cssClass;
        messageElement.textContent = `[${time}] ${prefix} ${message}`;
        
        chatLog.appendChild(messageElement);
        chatLog.scrollTop = chatLog.scrollHeight;
    }
    
    // 敵AI更新
    updateEnemyAI() {
        if (this.isGameOver) return;
        
        this.enemyBots.forEach(bot => {
            // 既にアクション中なら何もしない
            if (bot.state !== 'idle') return;
            
            // 行動決定
            const action = Math.random();
            
            if (action < 0.4) {
                // プレイヤーサーバーへ移動
                const playerServers = this.servers.filter(server => server.owner === 'player');
                
                if (playerServers.length > 0) {
                    const target = Phaser.Utils.Array.GetRandom(playerServers);
                    bot.moveTo(target.gridX, target.gridY);
                    this.addChatMessage('ENEMY', `敵Bot${bot.id}がプレイヤーサーバーへ移動します`);
                } else {
                    // ランダム移動
                    this.moveEnemyBotRandomly(bot);
                }
            } else if (action < 0.7) {
                // ランダム移動
                this.moveEnemyBotRandomly(bot);
            } else if (action < 0.85) {
                // 現在地で侵入試行
                const server = this.getServerAt(bot.gridX, bot.gridY);
                if (server && server.owner !== 'enemy') {
                    bot.startAction('hack', this);
                    this.addChatMessage('ENEMY', `敵Bot${bot.id}が侵入を試みています`);
                } else {
                    // 何もしない
                }
            } else {
                // 待機
            }
        });
        
        // 敵BOT複製（一定確率）
        if (this.enemyBots.length < 5 && Math.random() < 0.3) {
            this.tryCreateEnemyBot();
        }
    }
    
    // 敵BOTをランダムに移動
    moveEnemyBotRandomly(bot) {
        const x = Math.floor(Math.random() * CONFIG.GRID_SIZE);
        const y = Math.floor(Math.random() * CONFIG.GRID_SIZE);
        
        bot.moveTo(x, y);
        this.addChatMessage('ENEMY', `敵Bot${bot.id}がランダムに移動します`);
    }
    
    // 敵BOT作成を試みる
    tryCreateEnemyBot() {
        // 敵制御サーバーを探す
        const enemyServers = this.servers.filter(server => server.owner === 'enemy');
        
        if (enemyServers.length === 0) return;
        
        const server = Phaser.Utils.Array.GetRandom(enemyServers);
        
        // 周囲の空きマスを探す
        const directions = [
            {x: 0, y: -1}, // 上
            {x: 1, y: 0},  // 右
            {x: 0, y: 1},  // 下
            {x: -1, y: 0}  // 左
        ];
        
        // ランダムに方向をシャッフル
        directions.sort(() => Math.random() - 0.5);
        
        for (const dir of directions) {
            const newX = server.gridX + dir.x;
            const newY = server.gridY + dir.y;
            
            // グリッド内かつ他のBOTがいない場所を探す
            if (newX >= 0 && newX < CONFIG.GRID_SIZE && 
                newY >= 0 && newY < CONFIG.GRID_SIZE && 
                !this.isBotAt(newX, newY)) {
                
                // 新しいBOT作成
                const newBotId = this.getNextBotId();
                const newBot = new Bot(newBotId, 'enemy', newX, newY);
                
                this.enemyBots.push(newBot);
                newBot.createVisuals(this);
                
                this.addChatMessage('ENEMY', `敵が新しいBot${newBotId}を作成しました`);
                break;
            }
        }
    }
    
    // 指定座標のサーバーを取得
    getServerAt(x, y) {
        return this.servers.find(server => server.gridX === x && server.gridY === y);
    }
    
    // 指定座標にBOTがいるか確認
    isBotAt(x, y) {
        return this.playerBots.some(bot => bot.gridX === x && bot.gridY === y) || 
               this.enemyBots.some(bot => bot.gridX === x && bot.gridY === y) ||
               (this.playerDecoyBots && this.playerDecoyBots.some(bot => bot.gridX === x && bot.gridY === y)) ||
               (this.enemyDecoyBots && this.enemyDecoyBots.some(bot => bot.gridX === x && bot.gridY === y));
    }
    
    // 次のBOT IDを取得
    getNextBotId() {
        return this.nextBotId++;
    }
    
    // マシンパワー追加
    addMachinePower(amount) {
        this.machinePower = Math.max(0, this.machinePower + amount);
    }
    
    // ゲーム終了
    gameOver(isWin) {
        if (this.isGameOver) return;
        
        this.isGameOver = true;
        
        // タイマー停止
        if (this.enemyAiTimer) this.enemyAiTimer.remove();
        if (this.uiUpdateTimer) this.uiUpdateTimer.remove();
        
        // 結果表示
        const resultText = isWin ? 
            '勝利！敵のフラグを奪取しました！' : 
            '敗北...あなたのフラグが奪われました';
        
        const textColor = isWin ? '#00ff00' : '#ff0000';
        
        const gameOverText = this.add.text(400, 300, resultText, {
            font: '32px Courier',
            fill: textColor,
            stroke: '#000000',
            strokeThickness: 4
        });
        gameOverText.setOrigin(0.5);
        
        // 再開ボタン
        const restartButton = this.add.text(400, 350, '再開する', {
            font: '24px Courier',
            fill: '#ffffff',
            backgroundColor: '#003300',
            padding: { x: 20, y: 10 }
        });
        restartButton.setOrigin(0.5);
        restartButton.setInteractive({ useHandCursor: true });
        
        restartButton.on('pointerdown', () => {
            this.scene.restart();
        });
        
        this.addChatMessage('SYSTEM', resultText);
    }
}
