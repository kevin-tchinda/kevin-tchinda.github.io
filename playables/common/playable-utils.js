// Shared utilities for playables

// Save high score to localStorage
function saveHighScore(gameId, score) {
    const key = `${gameId}_highscore`;
    const current = localStorage.getItem(key);
    if (!current || score > parseInt(current)) {
        localStorage.setItem(key, score);
        return true;
    }
    return false;
}

// Get high score
function getHighScore(gameId) {
    const key = `${gameId}_highscore`;
    const score = localStorage.getItem(key);
    return score ? parseInt(score) : 0;
}

// Save game preferences
function savePreference(gameId, key, value) {
    localStorage.setItem(`${gameId}_${key}`, value);
}

// Get game preference
function getPreference(gameId, key, defaultValue = null) {
    const value = localStorage.getItem(`${gameId}_${key}`);
    return value !== null ? value : defaultValue;
}