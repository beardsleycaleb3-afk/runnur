/**
 * CareerStack: Persistence layer for high scores and milestones
 * Uses localStorage to save game progress and achievements
 */

class CareerStack {
  constructor(gameId = 'sovereign-engine') {
    this.gameId = gameId;
    this.STORAGE_KEYS = {
      HIGH_SCORE: `${gameId}-highscore`,
      TOTAL_YARDS: `${gameId}-total-yards`,
      GAMES_PLAYED: `${gameId}-games-played`,
      MILESTONES: `${gameId}-milestones`,
      BEST_STREAK: `${gameId}-best-streak`,
      ACHIEVEMENTS: `${gameId}-achievements`,
      SETTINGS: `${gameId}-settings`
    };
    this.milestoneInterval = 31; // Hex milestone interval
    this.milestones = [];
    this.loadData();
  }

  /**
   * Load all saved data from localStorage
   */
  loadData() {
    try {
      const highScore = this.getLocalStorage(this.STORAGE_KEYS.HIGH_SCORE, 0);
      const totalYards = this.getLocalStorage(this.STORAGE_KEYS.TOTAL_YARDS, 0);
      const gamesPlayed = this.getLocalStorage(this.STORAGE_KEYS.GAMES_PLAYED, 0);
      const milestones = this.getLocalStorage(this.STORAGE_KEYS.MILESTONES, []);
      const bestStreak = this.getLocalStorage(this.STORAGE_KEYS.BEST_STREAK, 0);
      const achievements = this.getLocalStorage(this.STORAGE_KEYS.ACHIEVEMENTS, {});
      
      this.data = {
        highScore,
        totalYards,
        gamesPlayed,
        milestones,
        bestStreak,
        achievements
      };
      
      console.log('[CareerStack] Data loaded:', this.data);
    } catch (error) {
      console.warn('[CareerStack] Failed to load data:', error);
      this.data = {
        highScore: 0,
        totalYards: 0,
        gamesPlayed: 0,
        milestones: [],
        bestStreak: 0,
        achievements: {}
      };
    }
  }

  /**
   * Save current game session
   */
  saveSession(score, yards, completed = false) {
    try {
      // Update high score
      if (score > this.data.highScore) {
        this.data.highScore = score;
        this.setLocalStorage(this.STORAGE_KEYS.HIGH_SCORE, score);
      }
      
      // Update total yards
      this.data.totalYards += yards;
      this.setLocalStorage(this.STORAGE_KEYS.TOTAL_YARDS, this.data.totalYards);
      
      // Increment games played
      this.data.gamesPlayed++;
      this.setLocalStorage(this.STORAGE_KEYS.GAMES_PLAYED, this.data.gamesPlayed);
      
      // Check for milestone unlocks
      this.checkMilestones();
      
      console.log('[CareerStack] Session saved');
      return true;
    } catch (error) {
      console.warn('[CareerStack] Failed to save session:', error);
      return false;
    }
  }

  /**
   * Check and unlock milestones at hex intervals
   */
  checkMilestones() {
    const hexMilestones = [31, 62, 93, 124, 155, 186, 217, 248, 279, 310];
    
    hexMilestones.forEach((milestone, index) => {
      if (this.data.gamesPlayed === milestone && !this.data.milestones.includes(milestone)) {
        this.unlockMilestone(milestone, index);
      }
    });
  }

  /**
   * Unlock a milestone achievement
   */
  unlockMilestone(milestoneFactor, colorIndex) {
    const colors = ['#00ff41', '#ff0055', '#ffff00', '#00ffff', '#ff00ff'];
    const milestone = {
      factor: milestoneFactor,
      timestamp: Date.now(),
      color: colors[colorIndex % colors.length],
      label: `MILESTONE_${milestoneFactor}`
    };
    
    this.data.milestones.push(milestone);
    this.setLocalStorage(this.STORAGE_KEYS.MILESTONES, this.data.milestones);
    
    console.log('[CareerStack] Milestone unlocked:', milestone);
    return milestone;
  }

  /**
   * Record achievement
   */
  achievementUnlock(achievementId, metadata = {}) {
    const achievement = {
      id: achievementId,
      timestamp: Date.now(),
      ...metadata
    };
    
    this.data.achievements[achievementId] = achievement;
    this.setLocalStorage(this.STORAGE_KEYS.ACHIEVEMENTS, this.data.achievements);
    
    console.log('[CareerStack] Achievement unlocked:', achievementId);
    return true;
  }

  /**
   * Get all stats
   */
  getStats() {
    return {
      highScore: this.data.highScore,
      totalYards: this.data.totalYards,
      gamesPlayed: this.data.gamesPlayed,
      bestStreak: this.data.bestStreak,
      milestonesUnlocked: this.data.milestones.length,
      achievementsUnlocked: Object.keys(this.data.achievements).length
    };
  }

  /**
   * Reset all data
   */
  resetAll() {
    try {
      Object.values(this.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      this.loadData();
      console.log('[CareerStack] All data reset');
      return true;
    } catch (error) {
      console.warn('[CareerStack] Failed to reset data:', error);
      return false;
    }
  }

  /**
   * Wrapper for localStorage with JSON serialization
   */
  setLocalStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('[CareerStack] localStorage quota exceeded:', error);
    }
  }

  /**
   * Wrapper for localStorage with JSON deserialization
   */
  getLocalStorage(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.warn('[CareerStack] Failed to retrieve from localStorage:', error);
      return defaultValue;
    }
  }
}

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CareerStack;
}