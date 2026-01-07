let rpgSystem;
let calcEngine;
let socialShare;
let globalCalcData = []; 

const fallbackCalcData = {
  "calculators": [
    { "id": "gst", "name": "GST Impact Calculator", "desc": "Calculate the 2% GST hike.", "xp": 50, "inputs": [ { "id": "spending", "label": "Monthly Spending ($)", "type": "number", "default": 2500 } ] },
    { "id": "inflation", "name": "Personal Inflation Rate", "desc": "Your real inflation vs official.", "xp": 75, "inputs": [ { "id": "housing", "label": "Housing (%)", "type": "range", "min":0, "max":100, "default":35 }, { "id": "transport", "label": "Transport (%)", "type": "range", "min":0, "max":100, "default":15 }, { "id": "food", "label": "Food (%)", "type": "range", "min":0, "max":100, "default":25 } ] },
    { "id": "car_cost", "name": "Car Cost Reality", "desc": "True cost of car ownership.", "xp": 100, "inputs": [ { "id": "has_car", "label": "Do you own a car?", "type": "select", "options": ["Yes", "No"] } ] },
    { "id": "kopi_index", "name": "Kopi-Index Tracker", "desc": "Savings by choosing hawker.", "xp": 150, "inputs": [ { "id": "frequency", "label": "Drinks per week", "type": "number", "default": 5 }, { "id": "type", "label": "Current Habit", "type": "select", "options": ["CBD Latte ($7.50)", "Hawker Kopi ($1.50)"] } ] },
    { "id": "big3_tradeoff", "name": "Big 3 Trade-off", "desc": "Balance Housing, Transport, Food.", "xp": 125, "inputs": [ { "id": "income", "label": "Monthly Income ($)", "type": "number", "default": 3500 }, { "id": "housing_pct", "label": "Housing (%)", "type": "range", "min":0, "max":100, "default":30 }, { "id": "transport_pct", "label": "Transport (%)", "type": "range", "min":0, "max":100, "default":10 }, { "id": "food_pct", "label": "Food (%)", "type": "range", "min":0, "max":100, "default":20 } ] },
    { "id": "rsbr_ratio", "name": "RSBR Ratio", "desc": "Realistic Singapore Budget Ratio.", "xp": 80, "inputs": [ { "id": "essentials", "label": "Essentials ($)", "type": "number", "default": 2000 }, { "id": "wants", "label": "Wants ($)", "type": "number", "default": 500 }, { "id": "savings", "label": "Savings ($)", "type": "number", "default": 500 } ] },
    { "id": "emergency_fund", "name": "Emergency Fund", "desc": "How long can you survive?", "xp": 100, "inputs": [ { "id": "expenses", "label": "Monthly Expenses ($)", "type": "number", "default": 2500 }, { "id": "savings", "label": "Cash Savings ($)", "type": "number", "default": 5000 } ] },
    { "id": "action_plan", "name": "Action Plan", "desc": "Your roadmap.", "xp": 200, "inputs": [], "checklist": [{ "id": "cp_calc_gst", "text": "Complete GST Calculator", "req_calc": "gst" }, { "id": "cp_calc_inf", "text": "Check Personal Inflation", "req_calc": "inflation" }, { "id": "cp_audit_sub", "text": "Cancel 1 unused subscription" }, { "id": "cp_kopi_sw", "text": "Switch to Hawker Kopi for 1 week" }, { "id": "cp_rsbr", "text": "Check RSBR Ratio", "req_calc": "rsbr_ratio" }, { "id": "cp_emerg", "text": "Set Emergency Fund Goal", "req_calc": "emergency_fund" }, { "id": "cp_share", "text": "Share your results" }] }
  ]
};
const fallbackRPGData = { "xp_system": { "base_xp_per_level": 150, "calculators": { "gst": 50, "inflation": 75, "car_cost": 100, "kopi_index": 150, "big3_tradeoff": 125, "rsbr_ratio": 80, "emergency_fund": 100 }, "bonuses": { "action_plan_started": 200 } }, "levels": [ { "level": 1, "xp_required": 0, "title": "Inflation Newbie" }, { "level": 2, "xp_required": 150, "title": "Budget Beginner" }, { "level": 3, "xp_required": 300, "title": "Calculator Novice", "badge": "calculator_novice", "unlocks": "gst" }, { "level": 4, "xp_required": 450, "title": "Awareness Builder" }, { "level": 5, "xp_required": 600, "title": "Cost Conscious" }, { "level": 6, "xp_required": 750, "title": "Kopi Regular", "badge": "kopi_regular", "unlocks": "kopi_index" }, { "level": 7, "xp_required": 900, "title": "Budget Planner" }, { "level": 8, "xp_required": 1050, "title": "Inflation Fighter" }, { "level": 9, "xp_required": 1200, "title": "Budget Analyst", "badge": "budget_analyst", "unlocks": "inflation" }, { "level": 10, "xp_required": 1350, "title": "Savings Strategist" }, { "level": 11, "xp_required": 1500, "title": "Lifestyle Auditor" }, { "level": 12, "xp_required": 1650, "title": "Housing Strategist", "badge": "housing_strategist", "unlocks": "big3_tradeoff" }, { "level": 13, "xp_required": 1800, "title": "Transport Analyst" }, { "level": 14, "xp_required": 1950, "title": "Food Cost Engineer" }, { "level": 15, "xp_required": 2100, "title": "Transport Guru", "badge": "transport_guru", "unlocks": "car_cost" }, { "level": 16, "xp_required": 2250, "title": "Budget Master" }, { "level": 17, "xp_required": 2400, "title": "Inflation Analyst" }, { "level": 18, "xp_required": 2550, "title": "Hawker Hero", "badge": "hawker_hero", "unlocks": "rsbr_ratio" }, { "level": 19, "xp_required": 2700, "title": "Savings Expert" }, { "level": 20, "xp_required": 2850, "title": "Financial Planner" }, { "level": 21, "xp_required": 3000, "title": "RSBR Master", "badge": "rsbr_master", "unlocks": "emergency_fund" }, { "level": 22, "xp_required": 3150, "title": "Wealth Defender" }, { "level": 23, "xp_required": 3300, "title": "Retirement Planner" }, { "level": 24, "xp_required": 3450, "title": "Inflation Defender", "badge": "inflation_defender", "unlocks": "action_plan" }, { "level": 25, "xp_required": 3600, "title": "Financial Survivor" }, { "level": 26, "xp_required": 3750, "title": "Wealth Builder" }, { "level": 27, "xp_required": 3900, "title": "Singapore Survivor", "badge": "singapore_survivor" } ] };
const fallbackSGData = { "prices": { "gst": { "current": 9, "increase": 2 }, "transport": { "car_true_monthly": 1800, "public_alternative": 278 } } };

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    // ENHANCEMENT 5: Onboarding Modal
    if (!localStorage.getItem('onboarding_done')) {
        showOnboarding();
    }

    setupShareModal();
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').then(() => console.log('✅ SW Registered')).catch(err => console.log('❌ SW Failed', err));

    let calcData = fallbackCalcData, rpgData = fallbackRPGData, sgData = fallbackSGData;
    try {
        const [calcRes, rpgRes, sgRes] = await Promise.all([fetch('./data/calculators.json'), fetch('./data/rpg-system.json'), fetch('./data/singapore-2024.json')]);
        calcData = await calcRes.json(); rpgData = await rpgRes.json(); sgData = await sgRes.json();
    } catch (e) { console.warn("⚠️ Using fallback data."); }

    rpgSystem = new RPGSystem(rpgData);
    socialShare = new SocialShare(socialMediaConfig);
    rpgSystem.updateUI();

    calcEngine = new CalculatorEngine(rpgSystem, sgData);
    globalCalcData = calcData;
    initCarousel(calcData.calculators);

    const kopiBtn = document.querySelector('.fab[title="Log today\'s coffee"]');
    const saveBtn = document.querySelector('.fab[title="Log a saving"]');
    checkDailyLimit(kopiBtn, "kopi", "☕ Kopi", 10);
    checkDailyLimit(saveBtn, "savings", "💰 Savings", 5);
});

window.shareModalBadgeId = null;

function setupShareModal() {
    document.body.insertAdjacentHTML('beforeend', `
    <div id="share-modal-overlay" class="share-modal-overlay">
        <div class="share-modal">
            <h3>🎉 Achievement Unlocked!</h3>
            <p id="share-modal-text">You earned a new badge.</p>
            <div class="share-buttons">
                <button class="share-btn share-wa" onclick="handleShare('whatsapp')">WhatsApp</button>
                <button class="share-btn share-fb" onclick="handleShare('facebook')">Facebook</button>
                <button class="share-btn share-tw" onclick="handleShare('twitter')">Twitter</button>
                <button class="share-btn share-cp" onclick="handleShare('copyLink')">Copy Link</button>
            </div>
            <button class="close-modal" onclick="closeShareModal()">Maybe Later</button>
        </div>
    </div>`);
}

window.showShareModal = function(title, id) {
    window.shareModalBadgeId = id; 
    document.getElementById('share-modal-text').textContent = `You achieved "${title}"! Share your progress?`;
    document.getElementById('share-modal-overlay').classList.add('active');
}

window.closeShareModal = function() { document.getElementById('share-modal-overlay').classList.remove('active'); }

window.handleShare = function(platform) {
    const text = document.getElementById('share-modal-text').textContent;
    const title = text.replace('You achieved "', '').replace('"! Share your progress?', '');
    
    if(socialShare) socialShare.shareToPlatform(title, platform);
    
    if (window.shareModalBadgeId && rpgSystem) {
        rpgSystem.markBadgeShared(window.shareModalBadgeId);
    }
    
    closeShareModal();
}

// ENHANCEMENT 2: Daily Streak Logic
function checkDailyLimit(btn, type, label, xp) {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem(`last_${type}_date`);
    const streak = parseInt(localStorage.getItem(`streak_${type}`) || '0');
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastDate === today) {
        btn.style.opacity = "0.5";
        btn.style.pointerEvents = "none";
        btn.title = `Logged today. Streak: ${streak} days 🔥`;
    } else {
        btn.addEventListener('click', () => {
            rpgSystem.addXP(xp, `Daily ${label}`);
            showToast(`${label} Logged! +${xp} XP`);
            
            // Update Streak
            let newStreak = 1;
            if (lastDate === yesterday.toDateString()) {
                newStreak = streak + 1;
                showToast(`🔥 Streak: ${newStreak} days!`);
            }
            
            localStorage.setItem(`streak_${type}`, newStreak);
            localStorage.setItem(`last_${type}_date`, today);
            
            btn.style.opacity = "0.5";
            btn.style.pointerEvents = "none";
            btn.title = `Logged today. Streak: ${newStreak} days 🔥`;
        });
    }
}

window.triggerConfetti = function() {
    const duration = 1500, end = Date.now() + duration, colors = ['#EE3434', '#FFC107', '#005DAA', '#FFFFFF'];
    (function frame() {
        const container = document.querySelector('.mobile-container');
        const particle = document.createElement('div');
        particle.style.position = 'absolute'; particle.style.left = '50%'; particle.style.top = '50%';
        particle.style.width = '10px'; particle.style.height = '10px';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.zIndex = '1000'; particle.style.pointerEvents = 'none';
        const angle = Math.random() * Math.PI * 2, velocity = 5 + Math.random() * 10;
        particle.style.transform = `translate(${Math.cos(angle)*velocity*20}px, ${Math.sin(angle)*velocity*20}px) scale(0)`;
        particle.style.transition = 'all 1s ease-out';
        container.appendChild(particle);
        requestAnimationFrame(() => { particle.style.transform = `translate(${Math.cos(angle)*velocity*40}px, ${Math.sin(angle)*velocity*40}px) scale(1)`; particle.style.opacity = '0'; });
        setTimeout(() => particle.remove(), 1000);
        if (Date.now() < end) requestAnimationFrame(frame);
    }());
}

// ENHANCEMENT 5: Onboarding
function showOnboarding() {
    const modal = document.createElement('div');
    modal.style.cssText = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:3000; display:flex; flex-direction:column; align-items:center; justify-content:center; color:white; padding:20px; text-align:center;`;
    modal.innerHTML = `
        <h1>🇸🇬 SG Inflation Survivor</h1>
        <p>Welcome! Here is how to survive:</p>
        <ul style="text-align:left; max-width:300px; line-height:1.6;">
            <li>1️⃣ <strong>Calculate:</strong> Use tools to earn XP.</li>
            <li>2️⃣ <strong>Level Up:</strong> Unlock badges (Lvl 3, 6, 9...).</li>
            <li>3️⃣ <strong>Share:</strong> Share your badge to UNLOCK the next tool!</li>
        </ul>
        <button id="start-btn" class="btn-primary" style="margin-top:20px; padding:15px 30px;">I'm Ready</button>
    `;
    document.body.appendChild(modal);
    
    document.getElementById('start-btn').onclick = () => {
        modal.remove();
        localStorage.setItem('onboarding_done', 'true');
    };
}

// ENHANCEMENT 3: Locked Teasers & Carousel
window.refreshCarousel = function() {
    initCarousel(globalCalcData.calculators);
}

function initCarousel(calculators) {
    const track = document.getElementById('carousel-track');
    const dotsContainer = document.getElementById('carousel-dots');
    if (!track || !dotsContainer) return;
    track.innerHTML = ''; dotsContainer.innerHTML = '';
    if (!calculators || calculators.length === 0) return;

    calculators.forEach((calc, index) => {
        const slide = document.createElement('div');
        slide.className = 'slide';
        track.appendChild(slide);
        
        if (rpgSystem.isCalculatorUnlocked(calc.id)) {
            if (calcEngine) calcEngine.render(slide, calc);
        } else {
            // LOCKED TEASER
            slide.innerHTML = `
                <div style="text-align:center; padding:40px 20px; color: var(--text-muted);">
                    <div style="font-size:4rem; margin-bottom:20px;">🔒</div>
                    <h2 style="color:var(--sg-red);">${calc.name}</h2>
                    <p>Unlock at Level 3</p>
                    
                    <div style="background:#f0f0f0; padding:15px; border-radius:8px; margin:20px 0; border:1px solid #ddd;">
                        <p style="font-size:0.8rem; color:#888; margin-bottom:5px;">HIDDEN TRUTH:</p>
                        <p style="filter: blur(4px); margin:0; font-weight:bold;">The true cost of a car in SG is $18,000/year</p>
                    </div>
                    
                    <p style="font-size:0.8rem; margin:10px 0;">
                        Share the previous badge to reveal this secret.
                    </p>
                    <button class="btn-primary" style="background:#999;" disabled>Locked</button>
                </div>
            `;
        }

        const dot = document.createElement('div');
        dot.className = `nav-dot ${index === 0 ? 'active' : ''}`;
        dotsContainer.appendChild(dot);
    });
    track.addEventListener('scroll', () => {
        const scrollPos = track.scrollLeft;
        const width = track.offsetWidth;
        const activeIndex = Math.round(scrollPos / width);
        document.querySelectorAll('.nav-dot').forEach((d, i) => d.classList.toggle('active', i === activeIndex));
    });
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `position: fixed; bottom: 150px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; padding: 10px 20px; border-radius: 20px; font-size: 0.9rem; z-index: 2000; animation: fadein 0.3s, fadeout 0.3s 2.5s forwards;`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}