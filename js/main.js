// ゲーム設定
const gameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: CONFIG.COLORS.BACKGROUND,
    parent: 'game-container',
    scene: [MatrixTitleScene, TitleScene, GameScene]
};

// ゲーム初期化
const game = new Phaser.Game(gameConfig);

// ウィンドウリサイズ対応
window.addEventListener('resize', () => {
    game.scale.refresh();
});
