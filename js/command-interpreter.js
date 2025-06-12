// コマンドインタープリタークラス
class CommandInterpreter {
    constructor(scene) {
        this.scene = scene;
    }
    
    // コマンドを解析して実行
    interpret(command) {
        // 小文字に変換して空白を整理
        command = command.toLowerCase().trim();
        
        // ヘルプコマンド
        if (command === 'ヘルプ' || command === 'help' || command === 'h') {
            this.showHelp();
            return true;
        }
        
        // 簡略化コマンド形式: "Bot1 Scan" や "B1 Scan" など
        const shortCommandMatch = command.match(/(?:bot|b)(\d+)\s+(\w+)(?:\s+(\d+))?(?:\s+(\d+))?/i);
        if (shortCommandMatch) {
            const botId = parseInt(shortCommandMatch[1]);
            const action = shortCommandMatch[2].toLowerCase();
            const param1 = shortCommandMatch[3] ? parseInt(shortCommandMatch[3]) : null;
            const param2 = shortCommandMatch[4] ? parseInt(shortCommandMatch[4]) : null;
            
            return this.executeShortCommand(botId, action, param1, param2);
        }
        
        // 新BOT作成コマンド
        if (command.match(/新しいbot|botを作成|新規bot|new|create/)) {
            return this.createNewBot();
        }
        
        // BOT削除コマンド
        const deleteMatch = command.match(/bot(\d+)を削除|bot(\d+)\s+delete|del\s+(\d+)/);
        if (deleteMatch) {
            const botId = parseInt(deleteMatch[1] || deleteMatch[2] || deleteMatch[3]);
            return this.deleteBot(botId);
        }
        
        // BOT状態確認コマンド
        const statusMatch = command.match(/bot(\d+)の状態|bot(\d+)\s+status|status\s+(\d+)/);
        if (statusMatch) {
            const botId = parseInt(statusMatch[1] || statusMatch[2] || statusMatch[3]);
            return this.checkBotStatus(botId);
        }
        
        // 移動コマンド
        const moveMatch = command.match(/bot(\d+)を\((\d+),(\d+)\)に移動/);
        if (moveMatch) {
            const botId = parseInt(moveMatch[1]);
            const x = parseInt(moveMatch[2]);
            const y = parseInt(moveMatch[3]);
            return this.moveBot(botId, x, y);
        }
        
        // アクションコマンド
        const actionMatch = command.match(/bot(\d+)で(スキャン|侵入|防御|複製|偽装)/);
        if (actionMatch) {
            const botId = parseInt(actionMatch[1]);
            const action = this.getActionType(actionMatch[2]);
            return this.performBotAction(botId, action);
        }
        
        // コマンドが認識できない
        this.scene.addChatMessage('ERROR', 'コマンドを認識できません。「ヘルプ」と入力してコマンド一覧を表示します。');
        return false;
    }
    
    // 簡略化コマンドの実行
    executeShortCommand(botId, action, param1, param2) {
        switch (action) {
            case 'move':
            case 'm':
                if (param1 !== null && param2 !== null) {
                    return this.moveBot(botId, param1, param2);
                } else {
                    this.scene.addChatMessage('ERROR', `移動コマンドには座標が必要です。例: Bot${botId} move 3 5`);
                    return false;
                }
                
            case 'scan':
            case 's':
                return this.performBotAction(botId, 'scan');
                
            case 'hack':
            case 'h':
                return this.performBotAction(botId, 'hack');
                
            case 'defend':
            case 'd':
                return this.performBotAction(botId, 'defend');
                
            case 'replicate':
            case 'rep':
            case 'r':
                return this.performBotAction(botId, 'replicate');
                
            case 'decoy':
            case 'dec':
                return this.performBotAction(botId, 'decoy');
                
            case 'status':
            case 'st':
                return this.checkBotStatus(botId);
                
            case 'delete':
            case 'del':
                return this.deleteBot(botId);
                
            default:
                this.scene.addChatMessage('ERROR', `不明なアクション「${action}」です。「ヘルプ」と入力してコマンド一覧を表示します。`);
                return false;
        }
    }
    
    // ヘルプ表示
    showHelp() {
        const helpText = [
            '【コマンド一覧】',
            '■ 簡略化コマンド:',
            '・B1 scan (s) - Bot1でスキャン実行',
            '・B2 hack (h) - Bot2で侵入実行',
            '・B3 defend (d) - Bot3で防御実行',
            '・B4 replicate (r) - Bot4で複製実行',
            '・B5 decoy (dec) - Bot5で偽装実行',
            '・B6 move 3 5 (m) - Bot6を(3,5)に移動',
            '・B7 status (st) - Bot7の状態表示',
            '・B8 delete (del) - Bot8を削除',
            '・new (create) - 新規BOT作成',
            '・help (h) - コマンド一覧表示',
            '',
            '■ 従来のコマンド:',
            '・新しいbotを作成 - 新規BOTを作成 (コスト: 30)',
            '・botXを削除 - 指定したBOTを削除 (回収: 15)',
            '・botXを(Y,Z)に移動 - 指定座標へ移動',
            '・botXでスキャン - 周囲4マスの情報取得',
            '・botXで侵入 - 現在地のサーバー制圧を試みる',
            '・botXで防御 - 防御レベルを+1（最大3）',
            '・botXで複製 - 隣接マスに新BOT作成',
            '・botXで偽装 - 偽フラグを設置',
            '・botXの状態 - BOT情報表示'
        ];
        
        helpText.forEach(text => {
            this.scene.addChatMessage('SYSTEM', text);
        });
        
        return true;
    }
    
    // 新BOT作成
    createNewBot() {
        // マシンパワーチェック
        if (this.scene.machinePower < CONFIG.BOT_COST) {
            this.scene.addChatMessage('ERROR', `BOT作成に必要なマシンパワーが不足しています (必要: ${CONFIG.BOT_COST})`);
            return false;
        }
        
        // 空いている場所を探す
        const availableSpots = [];
        
        for (let y = 0; y < CONFIG.GRID_SIZE; y++) {
            for (let x = 0; x < CONFIG.GRID_SIZE; x++) {
                // 既にBOTがいる場所は除外
                if (this.scene.isBotAt(x, y)) continue;
                
                // プレイヤー所有のサーバーの場所を優先
                const server = this.scene.getServerAt(x, y);
                if (server && server.owner === 'player') {
                    availableSpots.push({x, y, priority: 2});
                } else if (!server) {
                    // サーバーがない場所も候補
                    availableSpots.push({x, y, priority: 1});
                } else {
                    // その他の場所
                    availableSpots.push({x, y, priority: 0});
                }
            }
        }
        
        // 優先度でソート
        availableSpots.sort((a, b) => b.priority - a.priority);
        
        if (availableSpots.length === 0) {
            this.scene.addChatMessage('ERROR', 'BOT作成に利用可能な場所がありません');
            return false;
        }
        
        // 最適な場所にBOT作成
        const spot = availableSpots[0];
        const botId = this.scene.getNextBotId();
        const newBot = new Bot(botId, 'player', spot.x, spot.y);
        
        this.scene.playerBots.push(newBot);
        newBot.createVisuals(this.scene);
        
        // マシンパワー消費
        this.scene.addMachinePower(-CONFIG.BOT_COST);
        
        this.scene.addChatMessage('SYSTEM', `新しいBot${botId}を作成しました (${spot.x}, ${spot.y})`);
        return true;
    }
    
    // BOT削除
    deleteBot(botId) {
        const botIndex = this.scene.playerBots.findIndex(bot => bot.id === botId);
        
        if (botIndex === -1) {
            this.scene.addChatMessage('ERROR', `Bot${botId}が見つかりません`);
            return false;
        }
        
        const bot = this.scene.playerBots[botIndex];
        
        // 視覚オブジェクト削除
        if (bot.sprite) bot.sprite.destroy();
        if (bot.nameText) bot.nameText.destroy();
        if (bot.actionSprite) bot.actionSprite.destroy();
        
        // BOTリストから削除
        this.scene.playerBots.splice(botIndex, 1);
        
        // マシンパワー回収
        this.scene.addMachinePower(CONFIG.BOT_REFUND);
        
        this.scene.addChatMessage('SYSTEM', `Bot${botId}を削除しました (+${CONFIG.BOT_REFUND}パワー回収)`);
        return true;
    }
    
    // BOT状態確認
    checkBotStatus(botId) {
        const bot = this.scene.playerBots.find(bot => bot.id === botId);
        
        if (!bot) {
            this.scene.addChatMessage('ERROR', `Bot${botId}が見つかりません`);
            return false;
        }
        
        const status = bot.getStatusText();
        this.scene.addChatMessage('SYSTEM', `Bot${botId} - 位置(${bot.gridX},${bot.gridY}) - ${status}`);
        return true;
    }
    
    // BOT移動
    moveBot(botId, x, y) {
        const bot = this.scene.playerBots.find(bot => bot.id === botId);
        
        if (!bot) {
            this.scene.addChatMessage('ERROR', `Bot${botId}が見つかりません`);
            return false;
        }
        
        if (bot.state !== 'idle') {
            this.scene.addChatMessage('ERROR', `Bot${botId}は現在${bot.state === 'moving' ? '移動中' : 'アクション実行中'}です`);
            return false;
        }
        
        // 移動範囲チェック
        if (x < 0 || x >= CONFIG.GRID_SIZE || y < 0 || y >= CONFIG.GRID_SIZE) {
            this.scene.addChatMessage('ERROR', `移動先(${x},${y})はグリッド範囲外です`);
            return false;
        }
        
        // 移動開始
        bot.moveTo(x, y);
        this.scene.addChatMessage('SYSTEM', `Bot${botId}を(${x},${y})へ移動します`);
        return true;
    }
    
    // BOTアクション実行
    performBotAction(botId, action) {
        const bot = this.scene.playerBots.find(bot => bot.id === botId);
        
        if (!bot) {
            this.scene.addChatMessage('ERROR', `Bot${botId}が見つかりません`);
            return false;
        }
        
        if (bot.state !== 'idle') {
            this.scene.addChatMessage('ERROR', `Bot${botId}は現在${bot.state === 'moving' ? '移動中' : 'アクション実行中'}です`);
            return false;
        }
        
        // アクション開始
        return bot.startAction(action, this.scene);
    }
    
    // アクションタイプを取得
    getActionType(actionName) {
        switch (actionName) {
            case 'スキャン': return 'scan';
            case '侵入': return 'hack';
            case '防御': return 'defend';
            case '複製': return 'replicate';
            case '偽装': return 'decoy';
            default: return null;
        }
    }
}
