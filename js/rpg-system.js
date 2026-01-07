class RPGSystem {
    constructor(rpgData) {
        this.rpgData = rpgData;
        this.storageKey = this.getOrGenerateSessionKey();
        this.state = this.getInitialState();
        this.loadState();
    }

    getOrGenerateSessionKey() {
        let key = sessionStorage.getItem('sg_inflation_session_key');
        if (!key) {
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substr(2, 9);
            key = `survivingsg_tab_${timestamp}_${randomStr}`;
            sessionStorage.setItem('sg_inflation_session_key', key);
            console.log("New Session Created:", key);
        } else {
            console.log("Existing Session Loaded:", key);
        }
        return key;
    }

    getInitialState() {
        return {
            xp: 0,
            level: 1,
            savedAmount: 0,
            badges: [],
            sharedBadges: [], 
            unlockedCalculators: ['gst'], 
            actionPlanItems: [], 
            activityLog: [ { text: "Welcome to SG Inflation Survivor!", timestamp: new Date().toISOString() } ]
        };
    }

    loadState() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (!Array.isArray(parsed.badges)) parsed.badges = [];
                if (!Array.isArray(parsed.completedCalculators)) parsed.completedCalculators = [];
                if (!Array.isArray(parsed.sharedBadges)) parsed.sharedBadges = [];
                if (!Array.isArray(parsed.unlockedCalculators)) parsed.unlockedCalculators = ['gst'];
                if (!Array.isArray(parsed.actionPlanItems)) parsed.actionPlanItems = [];
                if (!Array.isArray(parsed.activityLog)) parsed.activityLog = [];
                this.state = { ...this.state, ...parsed };
                this.recalculateLevel();
            } catch (e) { console.error("Error loading save data, resetting.", e); }
        }
    }

    saveState() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        this.updateUI();
    }

    recalculateLevel() {
        let newLevel = 1;
        const sortedLevels = this.rpgData.levels.sort((a, b) => a.level - b.level);
        for (let lvl of sortedLevels) {
            if (this.state.xp >= lvl.xp_required) {
                newLevel = lvl.level;
            }
        }
        this.state.level = newLevel;
    }

    addXP(amount, source) {
        const oldLevel = this.state.level;
        this.state.xp += amount;
        this.logActivity(`+${amount} XP: ${source}`);
        this.recalculateLevel();
        
        const newLevel = this.state.level;
        let leveledUp = false;
        if (newLevel > oldLevel) {
            leveledUp = true;
            this.logActivity(`🎉 LEVEL UP! You are now Level ${newLevel}`);
            
            if (typeof triggerConfetti === 'function') triggerConfetti();
            
            // ENHANCEMENT 4: Haptic Feedback
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]); // Vibrate pattern
            }
            
            this.checkBadgeUnlock(newLevel);
        }
        this.saveState();
        return leveledUp;
    }

    checkBadgeUnlock(level) {
        const levelConfig = this.rpgData.levels.find(l => l.level === level);
        if (levelConfig && levelConfig.badge) {
            if (!this.state.badges.includes(levelConfig.badge)) {
                this.state.badges.push(levelConfig.badge);
                this.logActivity(`🏆 Badge Earned: ${levelConfig.badge}`);
                if (typeof showShareModal === 'function') showShareModal(levelConfig.title, levelConfig.badge);
            }
        }
    }

    markBadgeShared(badgeId) {
        if (!this.state.sharedBadges.includes(badgeId)) {
            this.state.sharedBadges.push(badgeId);
            this.logActivity(`📤 Shared Badge: ${badgeId}`);
            
            const levelConfig = this.rpgData.levels.find(l => l.badge === badgeId);
            if (levelConfig && levelConfig.unlocks) {
                if (!this.state.unlockedCalculators.includes(levelConfig.unlocks)) {
                    this.state.unlockedCalculators.push(levelConfig.unlocks);
                    this.logActivity(`🔓 Calculator Unlocked: ${levelConfig.unlocks}`);
                    showToast("🔓 New Calculator Unlocked!");
                    if (typeof refreshCarousel === 'function') refreshCarousel();
                }
            }
            this.saveState();
        }
    }

    isCalculatorUnlocked(calcId) {
        return this.state.unlockedCalculators.includes(calcId);
    }

    completeCalculator(calcId) {
        if (!this.state.completedCalculators.includes(calcId)) {
            this.state.completedCalculators.push(calcId);
            const xpGain = this.rpgData.xp_system.calculators[calcId] || 0;
            if (xpGain > 0) this.addXP(xpGain, `Completed ${calcId}`);
            this.syncActionPlanWithCalculators();
        }
        this.saveState();
    }

    syncActionPlanWithCalculators() {}
    toggleActionPlanItem(itemId) {
        if (!this.state.actionPlanItems.includes(itemId)) {
            this.state.actionPlanItems.push(itemId);
            this.logActivity(`✅ Action Item Completed`);
            if (this.state.actionPlanItems.length >= 7) this.handleActionPlanCompletion();
        }
        this.saveState();
    }
    isActionPlanComplete() { return this.state.actionPlanItems.length >= 7; }
    handleActionPlanCompletion() {
        this.addXP(200, "Action Plan Completed");
        if (typeof showShareModal === 'function') showShareModal("Action Plan Master", "action_plan");
    }
    logSavings(amount) {
        this.state.savedAmount += amount;
        this.logActivity(`💰 Saved $${amount}`);
        this.saveState();
    }
    logActivity(text) {
        this.state.activityLog.unshift({ text: text, timestamp: new Date().toISOString() });
        if (this.state.activityLog.length > 20) this.state.activityLog.pop();
    }

    getCurrentLevelData() { return this.rpgData.levels.find(l => l.level === this.state.level) || this.rpgData.levels[0]; }
    getNextLevelData() { return this.rpgData.levels.find(l => l.level === this.state.level + 1); }

    updateUI() {
        const currentLvlData = this.getCurrentLevelData();
        const nextLvlData = this.getNextLevelData();
        const currentXP = this.state.xp - currentLvlData.xp_required;
        
        let neededXP = 0;
        let percent = 100;

        if (nextLvlData) {
            neededXP = nextLvlData.xp_required - currentLvlData.xp_required;
            percent = (currentXP / neededXP) * 100;
        } else {
            percent = 100;
        }

        document.querySelector('.level-display span:first-child').textContent = `Level ${this.state.level}: ${currentLvlData.title}`;
        document.querySelector('.level-display span:last-child').textContent = `${this.state.xp} XP`;
        document.getElementById('xp-bar-fill').style.width = `${percent}%`;

        document.getElementById('total-xp').textContent = this.state.xp;
        document.getElementById('tools-count').textContent = `${this.state.completedCalculators.length}/${this.rpgData.xp_system.calculators ? Object.keys(this.rpgData.xp_system.calculators).length + 1 : 8}`;
        document.getElementById('total-saved').textContent = `$${this.state.savedAmount}`;

        // --- BADGE JOURNEY UI ---
        const badgeContainer = document.getElementById('badge-container');
        badgeContainer.innerHTML = '';
        
        const milestones = [3, 6, 9, 12, 15, 18, 21, 24, 27];
        
        milestones.forEach(lvl => {
            const lvlConfig = this.rpgData.levels.find(l => l.level === lvl);
            if (!lvlConfig) return;

            const isUnlocked = this.state.badges.includes(lvlConfig.badge);
            const badgeEl = document.createElement('div');
            badgeEl.className = 'badge'; 
            
            if (isUnlocked) {
                badgeEl.classList.add('unlocked');
                let icon = '🏆'; 
                if(lvlConfig.badge === 'kopi_regular') icon = '☕';
                if(lvlConfig.badge === 'calculator_novice') icon = '🎯';
                if(lvlConfig.badge === 'hawker_hero') icon = '🍜';
                if(lvlConfig.badge === 'rsbr_master') icon = '⚖️';
                if(lvlConfig.badge === 'inflation_defender') icon = '🛡️';
                if(lvlConfig.badge === 'housing_strategist') icon = '🏠';
                if(lvlConfig.badge === 'transport_guru') icon = '🚗';
                
                badgeEl.textContent = icon;
                badgeEl.title = `${lvlConfig.title} (Tap to Share)`;
                badgeEl.onclick = () => { if (typeof showShareModal === 'function') showShareModal(lvlConfig.title, lvlConfig.badge); };
                badgeEl.style.cursor = 'pointer';
            } else {
                badgeEl.textContent = '🔒';
                badgeEl.style.opacity = '0.4';
                badgeEl.title = `Unlocks at Level ${lvl}`;
                badgeEl.style.filter = 'grayscale(100%)';
            }
            badgeContainer.appendChild(badgeEl);
        });

        const nextBadgeEl = document.querySelector('.next-badge');
        const xpNeededEl = document.querySelector('.xp-needed');
        
        if (nextLvlData) {
            const remaining = nextLvlData.xp_required - this.state.xp;
            nextBadgeEl.textContent = nextLvlData.title;
            xpNeededEl.textContent = `${remaining} XP needed`;
        } else {
            nextBadgeEl.textContent = "Max Level";
            xpNeededEl.textContent = "Survivor!";
        }

        const logContainer = document.querySelector('.activity-log');
        if (this.state.activityLog.length > 0) {
            const recent = this.state.activityLog[0];
            const time = new Date(recent.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            logContainer.textContent = `[${time}] ${recent.text}`;
        }
    }
}