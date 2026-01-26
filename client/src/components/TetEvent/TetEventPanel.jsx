import React, { useState } from 'react';
import { useTetEvent } from '../../hooks/useTetEvent';
import './TetEventPanel.css';

/**
 * TetEventPanel - Lunar New Year Event Component
 * 
 * Features:
 * - Display Event Token (ET) balance
 * - Buy Lucky Boxes with ET
 * - Open Lucky Boxes with animation
 * - Display won assets (Stickers, Animations, Videos)
 */
export const TetEventPanel = () => {
    const {
        boxes,
        assets,
        tokenBalance,
        isLoading,
        buyBox,
        openBox
    } = useTetEvent();

    const [openingBoxId, setOpeningBoxId] = useState(null);
    const [showResult, setShowResult] = useState(null);

    const handleBuyBox = async () => {
        try {
            await buyBox.mutateAsync();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleOpenBox = async (boxId) => {
        setOpeningBoxId(boxId);
        try {
            const result = await openBox.mutateAsync(boxId);
            // Parse result from transaction events
            setShowResult({ success: true, boxId });
            setTimeout(() => setShowResult(null), 3000);
        } catch (error) {
            alert('Failed to open box: ' + error.message);
        } finally {
            setOpeningBoxId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="tet-event-panel loading">
                <div className="loading-spinner"></div>
                <p>Loading Tet Event...</p>
            </div>
        );
    }

    return (
        <div className="tet-event-panel">
            {/* Header with Event Token Balance */}
            <div className="tet-header">
                <div className="tet-logo">
                    <span className="dragon-icon">🐉</span>
                    <h2>Tết Lucky Box</h2>
                </div>
                <div className="token-balance">
                    <span className="token-icon">🎟️</span>
                    <span className="balance-value">{tokenBalance}</span>
                    <span className="balance-label">ET</span>
                </div>
            </div>

            {/* Buy Box Section */}
            <div className="buy-section">
                <div className="box-preview">
                    <div className="lucky-box-3d">
                        <div className="box-face front">🎁</div>
                    </div>
                </div>
                <div className="buy-info">
                    <h3>Lucky Box</h3>
                    <p className="price">1 ET per box</p>
                    <p className="hint">Earn ET by selling slides to unique buyers!</p>
                    <button
                        className="buy-btn"
                        onClick={handleBuyBox}
                        disabled={buyBox.isPending || parseInt(tokenBalance) < 1}
                    >
                        {buyBox.isPending ? 'Buying...' : 'Buy Lucky Box'}
                    </button>
                </div>
            </div>

            {/* Owned Boxes */}
            {boxes.length > 0 && (
                <div className="owned-boxes">
                    <h3>🎁 Your Lucky Boxes ({boxes.length})</h3>
                    <div className="boxes-grid">
                        {boxes.map((box) => (
                            <div
                                key={box.id}
                                className={`box-card ${openingBoxId === box.id ? 'opening' : ''}`}
                            >
                                <div className="box-icon">🎁</div>
                                <button
                                    className="open-btn"
                                    onClick={() => handleOpenBox(box.id)}
                                    disabled={openingBoxId === box.id}
                                >
                                    {openingBoxId === box.id ? '✨ Opening...' : 'Open'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Won Assets */}
            {assets.length > 0 && (
                <div className="won-assets">
                    <h3>🏆 Your Tet Collection ({assets.length})</h3>
                    <div className="assets-grid">
                        {assets.map((asset) => (
                            <div key={asset.id} className={`asset-card ${asset.rarity?.toLowerCase()}`}>
                                <div className="asset-image">
                                    {asset.asset_type === 'Sticker' && '🐲'}
                                    {asset.asset_type === 'Animation' && '🎆'}
                                    {asset.asset_type === 'Video' && '🎬'}
                                </div>
                                <div className="asset-info">
                                    <span className="asset-name">{asset.name}</span>
                                    <span className={`rarity-badge ${asset.rarity?.toLowerCase()}`}>
                                        {asset.rarity}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Probabilities Info */}
            <div className="probabilities">
                <h4>🎲 Prize Chances</h4>
                <div className="prob-list">
                    <div className="prob-item miss">
                        <span>Good Luck Next Time</span>
                        <span>50%</span>
                    </div>
                    <div className="prob-item common">
                        <span>Discount Voucher</span>
                        <span>20%</span>
                    </div>
                    <div className="prob-item rare">
                        <span>Golden Dragon Sticker</span>
                        <span>10%</span>
                    </div>
                    <div className="prob-item epic">
                        <span>Fireworks Animation</span>
                        <span>10%</span>
                    </div>
                    <div className="prob-item legendary">
                        <span>Happy New Year Video</span>
                        <span>10%</span>
                    </div>
                </div>
            </div>

            {/* Result Modal */}
            {showResult && (
                <div className="result-modal">
                    <div className="result-content">
                        <div className="fireworks">🎆</div>
                        <h3>Box Opened!</h3>
                        <p>Check your assets for your prize!</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TetEventPanel;
