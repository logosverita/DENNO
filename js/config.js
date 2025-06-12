// ゲームの設定パラメータ
const CONFIG = {
    // グリッド設定
    GRID_SIZE: 9,
    GRID_CELL_SIZE: 60,
    GRID_OFFSET_X: 50,
    GRID_OFFSET_Y: 50,
    
    // リソース設定
    INITIAL_POWER: 0,
    SERVER_POWER: 50,
    BOT_COST: 30,
    BOT_REFUND: 15,
    
    // BOT設定
    BOT_SPEED: 120, // px/秒
    
    // アクション時間（ミリ秒）
    SCAN_TIME: 2000,
    HACK_TIME: 5000,
    DEFEND_TIME: 3000,
    REPLICATE_TIME: 4000,
    DECOY_TIME: 2500,
    
    // クールダウン（ミリ秒）
    SCAN_COOLDOWN: 3000,
    HACK_COOLDOWN: 5000,
    DEFEND_COOLDOWN: 4000,
    REPLICATE_COOLDOWN: 6000,
    DECOY_COOLDOWN: 8000,
    
    // 成功率
    BASE_HACK_RATE: 0.8,
    DEFENSE_REDUCTION: 0.2,
    
    // カラー設定
    COLORS: {
        BACKGROUND: 0x0a0a0a,
        GRID: 0x00ff00,
        PLAYER: 0x00ffff,
        ENEMY: 0xff00ff,
        SYSTEM: 0xffff00,
        ERROR: 0xff0000,
        
        SERVER_NEUTRAL: 0x003300,
        SERVER_PLAYER: 0x004400,
        SERVER_ENEMY: 0x440044,
        
        BOT_PLAYER: 0x00ff00,
        BOT_ENEMY: 0xff0000,
        
        ACTION_SCAN: 0x00ff00,
        ACTION_HACK: 0xff0000,
        ACTION_DEFEND: 0x0000ff,
        ACTION_REPLICATE: 0xff00ff,
        ACTION_DECOY: 0xffff00
    },
    
    // AI設定
    ENEMY_AI_INTERVAL: 20000, // 敵AIの行動間隔（ミリ秒）- 4倍遅く
    
    // UI更新間隔
    UI_UPDATE_INTERVAL: 500 // ミリ秒
};
