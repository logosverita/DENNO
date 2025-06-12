    // 攻性防壁設置
    performAggressiveFirewall(scene, server) {
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
    }
    
    // ワーム設置
    performWorm(scene, server) {
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
    }
    
    // バックドア設置
    performBackdoor(scene, server) {
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
    }
    
    // ハニーネット設置
    performHoneypot(scene, server) {
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
    }
    
    // トロイの木馬設置
    performTrojan(scene, server) {
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
    }
    
    // タイムボム設置
    performTimebomb(scene, server) {
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
    }
    
    // デコイBOT作成
    performDecoyBot(scene) {
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
    }
    // 侵入実行
    performHack(scene, server) {
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
    }
