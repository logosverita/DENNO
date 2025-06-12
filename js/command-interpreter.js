// コマンドインタープリター
class CommandInterpreter {
    constructor(scene) {
        this.scene = scene;
        
        // コマンド一覧
        this.commands = {
            'ヘルプ': { method: this.showHelp, args: 0 },
            'help': { method: this.showHelp, args: 0 },
            '?': { method: this.showHelp, args: 0 },
            
            'スキャン': { method: this.executeScan, args: 0 },
            'scan': { method: this.executeScan, args: 0 },
            
            '移動': { method: this.executeMove, args: 2 },
            'move': { method: this.executeMove, args: 2 },
            
            '侵入': { method: this.executeHack, args: 0 },
            'hack': { method: this.executeHack, args: 0 },
            
            '防御': { method: this.executeDefend, args: 0 },
            'defend': { method: this.executeDefend, args: 0 },
            
            '複製': { method: this.executeReplicate, args: 0 },
            'replicate': { method: this.executeReplicate, args: 0 },
            
            '偽装': { method: this.executeDecoy, args: 0 },
            'decoy': { method: this.executeDecoy, args: 0 },
            
            'ボット': { method: this.showBots, args: 0 },
            'bots': { method: this.showBots, args: 0 },
            
            'サーバー': { method: this.showServers, args: 0 },
            'servers': { method: this.showServers, args: 0 },
            
            'ステータス': { method: this.showStatus, args: 0 },
            'status': { method: this.showStatus, args: 0 },
            
            // 新機能
            '攻性防壁': { method: this.executeAggressiveFirewall, args: 0 },
            'awall': { method: this.executeAggressiveFirewall, args: 0 },
            
            'ワーム': { method: this.executeWorm, args: 0 },
            'worm': { method: this.executeWorm, args: 0 },
            
            'バックドア': { method: this.executeBackdoor, args: 0 },
            'backdoor': { method: this.executeBackdoor, args: 0 },
            
            'ハニーネット': { method: this.executeHoneypot, args: 0 },
            'honeypot': { method: this.executeHoneypot, args: 0 },
            
            'トロイの木馬': { method: this.executeTrojan, args: 0 },
            'trojan': { method: this.executeTrojan, args: 0 },
            
            'タイムボム': { method: this.executeTimebomb, args: 0 },
            'timebomb': { method: this.executeTimebomb, args: 0 },
            
            'デコイボット': { method: this.executeDecoyBot, args: 0 },
            'decoybot': { method: this.executeDecoyBot, args: 0 },
            
            'ディープラーニング': { method: this.executeDeepLearning, args: 1 },
            'deeplearning': { method: this.executeDeepLearning, args: 1 },
            
            'ボットネット': { method: this.executeBotnet, args: -1 },
            'botnet': { method: this.executeBotnet, args: -1 },
            
            'ブロックチェーン': { method: this.executeBlockchain, args: 0 },
            'blockchain': { method: this.executeBlockchain, args: 0 },
            
            'ddos': { method: this.executeDDoSAttack, args: 2 }
        };
    }
    // コマンド解析
    interpret(command) {
        // 空のコマンドは無視
        if (!command || command.trim() === '') return false;
        
        // コマンドを小文字に変換して先頭と末尾の空白を削除
        const normalizedCommand = command.trim();
        
        // 直接コマンド実行
        for (const [cmd, info] of Object.entries(this.commands)) {
            if (normalizedCommand.toLowerCase() === cmd.toLowerCase()) {
                return info.method.call(this);
            }
        }
        
        // 引数付きコマンド
        for (const [cmd, info] of Object.entries(this.commands)) {
            if (info.args > 0 || info.args === -1) {
                const regex = new RegExp(`^${cmd}\\s+(.+)$`, 'i');
                const match = normalizedCommand.match(regex);
                
                if (match) {
                    const args = match[1].split(/\s+/);
                    
                    // 引数の数が一致するか、可変長引数の場合
                    if (args.length === info.args || info.args === -1) {
                        return info.method.apply(this, args);
                    }
                }
            }
        }
        
        // 特殊コマンド解析
        
        // BOT指定コマンド（例: bot1 move 3 5）
        const botCommandMatch = command.match(/bot(\d+)\s+(\w+)(?:\s+(\d+))?(?:\s+(\d+))?/i);
        if (botCommandMatch) {
            const botId = parseInt(botCommandMatch[1]);
            const action = botCommandMatch[2].toLowerCase();
            const param1 = botCommandMatch[3] ? parseInt(botCommandMatch[3]) : null;
            const param2 = botCommandMatch[4] ? parseInt(botCommandMatch[4]) : null;
            
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
                }
                break;
                
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
            case 'r':
                return this.performBotAction(botId, 'replicate');
                
            case 'decoy':
            case 'dc':
                return this.performBotAction(botId, 'decoy');
                
            // 新機能
            case 'awall':
            case 'aw':
                return this.performBotAction(botId, 'awall');
                
            case 'worm':
            case 'w':
                return this.performBotAction(botId, 'worm');
                
            case 'backdoor':
            case 'bd':
                return this.performBotAction(botId, 'backdoor');
                
            case 'honeypot':
            case 'hp':
                return this.performBotAction(botId, 'honeypot');
                
            case 'trojan':
            case 'tj':
                return this.performBotAction(botId, 'trojan');
                
            case 'timebomb':
            case 'tb':
                return this.performBotAction(botId, 'timebomb');
                
            case 'decoybot':
            case 'db':
                return this.performBotAction(botId, 'decoybot');
        }
        
        this.scene.addChatMessage('ERROR', `Bot${botId}への不明なコマンドです: ${action}`);
        return false;
    }
    
    // ヘルプ表示
    showHelp() {
        const helpText = `
【基本コマンド】
- ヘルプ / help / ? : このヘルプを表示
- ステータス / status : 現在の状態を表示
- ボット / bots : 所有BOTの一覧を表示
- サーバー / servers : 制御下のサーバー一覧を表示

【BOT操作】
- bot<番号> move <X> <Y> : 指定座標に移動
- bot<番号> scan : 周囲をスキャン
- bot<番号> hack : 現在地のサーバーに侵入
- bot<番号> defend : 現在地のサーバーの防御を強化
- bot<番号> replicate : BOTを複製
- bot<番号> decoy : 偽フラグを設置

【新機能】
- bot<番号> awall : 攻性防壁を設置
- bot<番号> worm : ワームを設置
- bot<番号> backdoor : バックドアを設置
- bot<番号> honeypot : ハニーネットを設置
- bot<番号> trojan : トロイの木馬を設置
- bot<番号> timebomb : タイムボムを設置
- bot<番号> decoybot : デコイBOTを作成
- ディープラーニング <番号> : BOTにディープラーニングを実装
- ボットネット <番号1> <番号2> ... <アクション> : 複数BOTで同時アクション
- ブロックチェーン : 分散型防御を構築
- ddos <X> <Y> : 分散型ウィルス攻撃を実行
`;
        
        this.scene.addChatMessage('SYSTEM', helpText);
        return true;
    }
    
    // BOT一覧表示
    showBots() {
        const bots = this.scene.playerBots;
        
        if (bots.length === 0) {
            this.scene.addChatMessage('SYSTEM', '現在アクティブなBOTはありません');
            return true;
        }
        
        let botList = '【アクティブBOT一覧】\n';
        bots.forEach(bot => {
            botList += `Bot${bot.id} - 位置(${bot.gridX},${bot.gridY}) - ${bot.getStatusText()}\n`;
            
            // 特殊能力表示
            if (bot.hasDeepLearning) {
                botList += `  ディープラーニング Lv.${bot.learningLevel}\n`;
            }
        });
        
        this.scene.addChatMessage('SYSTEM', botList);
        return true;
    }
    
    // サーバー一覧表示
    showServers() {
        const servers = this.scene.servers.filter(server => server.owner === 'player');
        
        if (servers.length === 0) {
            this.scene.addChatMessage('SYSTEM', '現在制御下のサーバーはありません');
            return true;
        }
        
        let serverList = '【制御下サーバー一覧】\n';
        servers.forEach(server => {
            serverList += `サーバー(${server.gridX},${server.gridY}) - 防御Lv.${server.defenseLevel}`;
            
            if (server.hasFlag) {
                serverList += ' - フラグあり';
            }
            
            if (server.hasFakeFlag) {
                serverList += ' - 偽フラグあり';
            }
            
            if (server.hasAggressiveFirewall) {
                serverList += ' - 攻性防壁あり';
            }
            
            if (server.hasWorm) {
                serverList += ' - ワームあり';
            }
            
            if (server.hasBackdoor) {
                serverList += ' - バックドアあり';
            }
            
            if (server.hasHoneypot) {
                serverList += ' - ハニーネットあり';
            }
            
            if (server.hasTimebomb) {
                serverList += ' - タイムボムあり';
            }
            
            serverList += '\n';
        });
        
        this.scene.addChatMessage('SYSTEM', serverList);
        return true;
    }
    
    // ステータス表示
    showStatus() {
        const playerBots = this.scene.playerBots.length;
        const playerServers = this.scene.servers.filter(server => server.owner === 'player').length;
        const enemyBots = this.scene.enemyBots.length;
        const enemyServers = this.scene.servers.filter(server => server.owner === 'enemy').length;
        const machinePower = this.scene.machinePower;
        
        const statusText = `
【システムステータス】
マシンパワー: ${machinePower}
アクティブBOT: ${playerBots}
制御サーバー: ${playerServers}

【敵情報】
敵BOT: ${enemyBots}
敵サーバー: ${enemyServers}
`;
        
        this.scene.addChatMessage('SYSTEM', statusText);
        return true;
    }
    
    // BOT移動
    moveBot(botId, x, y) {
        const bot = this.scene.playerBots.find(bot => bot.id === botId);
        
        if (!bot) {
            this.scene.addChatMessage('ERROR', `Bot${botId}が見つかりません`);
            return false;
        }
        
        // 座標範囲チェック
        if (x < 0 || x >= CONFIG.GRID_SIZE || y < 0 || y >= CONFIG.GRID_SIZE) {
            this.scene.addChatMessage('ERROR', `移動先座標が範囲外です: (${x},${y})`);
            return false;
        }
        
        // 移動開始
        bot.moveTo(x, y);
        this.scene.addChatMessage('SYSTEM', `Bot${botId}を(${x},${y})に移動します`);
        return true;
    }
    
    // BOTアクション実行
    performBotAction(botId, action) {
        const bot = this.scene.playerBots.find(bot => bot.id === botId);
        
        if (!bot) {
            this.scene.addChatMessage('ERROR', `Bot${botId}が見つかりません`);
            return false;
        }
        
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
            default: return actionName;
        }
    }
    
    // 新BOT作成
    createNewBot() {
        this.scene.addChatMessage('SYSTEM', 'BOTを作成するには複製コマンドを使用してください');
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
        
        this.scene.addChatMessage('SYSTEM', `Bot${botId}を削除しました`);
        return true;
    }
    
    // BOT状態確認
    checkBotStatus(botId) {
        const bot = this.scene.playerBots.find(bot => bot.id === botId);
        
        if (!bot) {
            this.scene.addChatMessage('ERROR', `Bot${botId}が見つかりません`);
            return false;
        }
        
        let statusText = `Bot${botId} - 位置(${bot.gridX},${bot.gridY}) - ${bot.getStatusText()}\n`;
        
        // クールダウン情報
        statusText += '【クールダウン状態】\n';
        for (const [action, time] of Object.entries(bot.cooldowns)) {
            if (time > 0) {
                statusText += `${this.getActionName(action)}: ${Math.ceil(time / 1000)}秒\n`;
            }
        }
        
        // 特殊能力
        if (bot.hasDeepLearning) {
            statusText += `\nディープラーニング Lv.${bot.learningLevel}\n`;
        }
        
        this.scene.addChatMessage('SYSTEM', statusText);
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
            case 'awall': return '攻性防壁';
            case 'worm': return 'ワーム';
            case 'backdoor': return 'バックドア';
            case 'honeypot': return 'ハニーネット';
            case 'trojan': return 'トロイの木馬';
            case 'timebomb': return 'タイムボム';
            case 'decoybot': return 'デコイBOT';
            default: return action;
        }
    }
    
    // スキャンコマンド実行
    executeScan() {
        if (this.scene.playerBots.length === 0) {
            this.scene.addChatMessage('ERROR', 'アクティブなBOTがありません');
            return false;
        }
        
        // 最初のBOTでスキャン実行
        const bot = this.scene.playerBots[0];
        return bot.startAction('scan', this.scene);
    }
    
    // 移動コマンド実行
    executeMove(x, y) {
        if (this.scene.playerBots.length === 0) {
            this.scene.addChatMessage('ERROR', 'アクティブなBOTがありません');
            return false;
        }
        
        // 座標変換
        const gridX = parseInt(x);
        const gridY = parseInt(y);
        
        if (isNaN(gridX) || isNaN(gridY)) {
            this.scene.addChatMessage('ERROR', '移動先座標が無効です');
            return false;
        }
        
        // 最初のBOTを移動
        const bot = this.scene.playerBots[0];
        return this.moveBot(bot.id, gridX, gridY);
    }
    
    // 侵入コマンド実行
    executeHack() {
        if (this.scene.playerBots.length === 0) {
            this.scene.addChatMessage('ERROR', 'アクティブなBOTがありません');
            return false;
        }
        
        // 最初のBOTで侵入実行
        const bot = this.scene.playerBots[0];
        return bot.startAction('hack', this.scene);
    }
    
    // 防御コマンド実行
    executeDefend() {
        if (this.scene.playerBots.length === 0) {
            this.scene.addChatMessage('ERROR', 'アクティブなBOTがありません');
            return false;
        }
        
        // 最初のBOTで防御実行
        const bot = this.scene.playerBots[0];
        return bot.startAction('defend', this.scene);
    }
    
    // 複製コマンド実行
    executeReplicate() {
        if (this.scene.playerBots.length === 0) {
            this.scene.addChatMessage('ERROR', 'アクティブなBOTがありません');
            return false;
        }
        
        // 最初のBOTで複製実行
        const bot = this.scene.playerBots[0];
        return bot.startAction('replicate', this.scene);
    }
    
    // 偽装コマンド実行
    executeDecoy() {
        if (this.scene.playerBots.length === 0) {
            this.scene.addChatMessage('ERROR', 'アクティブなBOTがありません');
            return false;
        }
        
        // 最初のBOTで偽装実行
        const bot = this.scene.playerBots[0];
        return bot.startAction('decoy', this.scene);
    }
    
    // 攻性防壁コマンド実行
    executeAggressiveFirewall() {
        if (this.scene.playerBots.length === 0) {
            this.scene.addChatMessage('ERROR', 'アクティブなBOTがありません');
            return false;
        }
        
        // 最初のBOTで攻性防壁実行
        const bot = this.scene.playerBots[0];
        return bot.startAction('awall', this.scene);
    }
    
    // ワームコマンド実行
    executeWorm() {
        if (this.scene.playerBots.length === 0) {
            this.scene.addChatMessage('ERROR', 'アクティブなBOTがありません');
            return false;
        }
        
        // 最初のBOTでワーム実行
        const bot = this.scene.playerBots[0];
        return bot.startAction('worm', this.scene);
    }
    
    // バックドアコマンド実行
    executeBackdoor() {
        if (this.scene.playerBots.length === 0) {
            this.scene.addChatMessage('ERROR', 'アクティブなBOTがありません');
            return false;
        }
        
        // 最初のBOTでバックドア実行
        const bot = this.scene.playerBots[0];
        return bot.startAction('backdoor', this.scene);
    }
    
    // ハニーネットコマンド実行
    executeHoneypot() {
        if (this.scene.playerBots.length === 0) {
            this.scene.addChatMessage('ERROR', 'アクティブなBOTがありません');
            return false;
        }
        
        // 最初のBOTでハニーネット実行
        const bot = this.scene.playerBots[0];
        return bot.startAction('honeypot', this.scene);
    }
    
    // トロイの木馬コマンド実行
    executeTrojan() {
        if (this.scene.playerBots.length === 0) {
            this.scene.addChatMessage('ERROR', 'アクティブなBOTがありません');
            return false;
        }
        
        // 最初のBOTでトロイの木馬実行
        const bot = this.scene.playerBots[0];
        return bot.startAction('trojan', this.scene);
    }
    
    // タイムボムコマンド実行
    executeTimebomb() {
        if (this.scene.playerBots.length === 0) {
            this.scene.addChatMessage('ERROR', 'アクティブなBOTがありません');
            return false;
        }
        
        // 最初のBOTでタイムボム実行
        const bot = this.scene.playerBots[0];
        return bot.startAction('timebomb', this.scene);
    }
    
    // デコイBOTコマンド実行
    executeDecoyBot() {
        if (this.scene.playerBots.length === 0) {
            this.scene.addChatMessage('ERROR', 'アクティブなBOTがありません');
            return false;
        }
        
        // 最初のBOTでデコイBOT実行
        const bot = this.scene.playerBots[0];
        return bot.startAction('decoybot', this.scene);
    }
    
    // ディープラーニングモジュールを実装
    executeDeepLearning(botId) {
        const bot = this.scene.playerBots.find(bot => bot.id === parseInt(botId));
        
        if (!bot) {
            this.scene.addChatMessage('ERROR', `Bot${botId}が見つかりません`);
            return false;
        }
        
        // 既に実装済みの場合
        if (bot.hasDeepLearning) {
            this.scene.addChatMessage('ERROR', `Bot${botId}は既にディープラーニングを実装済みです`);
            return false;
        }
        
        // マシンパワーチェック
        if (this.scene.machinePower < 100) {
            this.scene.addChatMessage('ERROR', `ディープラーニング実装に必要なマシンパワーが不足しています (必要: 100, 現在: ${this.scene.machinePower})`);
            return false;
        }
        
        // ディープラーニング実装
        bot.hasDeepLearning = true;
        bot.learningLevel = 1;
        
        // マシンパワー消費
        this.scene.addMachinePower(-100);
        
        this.scene.addChatMessage('SYSTEM', `Bot${botId}にディープラーニングを実装しました (Lv.1)`);
        return true;
    }
    
    // ボットネット作成
    executeBotnet(...args) {
        if (args.length < 2) {
            this.scene.addChatMessage('ERROR', `ボットネット作成には少なくとも2つの引数が必要です。例: botnet 1 2 hack`);
            return false;
        }
        
        // 最後の引数はアクション
        const action = args.pop().toLowerCase();
        
        // 残りの引数はBOT ID
        const botIds = args.map(id => parseInt(id));
        
        // アクションの検証
        const validActions = ['scan', 'hack', 'defend', 'replicate', 'decoy', 'awall', 'worm', 'backdoor', 'honeypot', 'trojan', 'timebomb', 'decoybot'];
        if (!validActions.includes(action)) {
            this.scene.addChatMessage('ERROR', `無効なアクションです: ${action}`);
            return false;
        }
        
        return this.scene.createBotnet(botIds, action);
    }
    
    // ブロックチェーン防御構築
    executeBlockchain() {
        return this.scene.createBlockchainDefense();
    }
    
    // DDoS攻撃コマンドを実行
    executeDDoSAttack(x, y) {
        if (x === null || y === null) {
            this.scene.addChatMessage('ERROR', `DDoS攻撃には対象座標が必要です。例: ddos 3 5`);
            return false;
        }
        
        return this.scene.performDDoSAttack(x, y);
    }
}
