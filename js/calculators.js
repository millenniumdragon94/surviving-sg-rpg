class CalculatorEngine {
    constructor(rpgSystem, singaporeData) {
        this.rpg = rpgSystem;
        this.sgData = singaporeData;
        
        // ENHANCEMENT 1: Educational Facts
        this.sgFacts = [
            "Did you know? Singapore's GST was 3% in 2003. It has tripled in 20 years.",
            "Tip: 50% of Singaporeans spend more than they earn monthly.",
            "Did you know? COE prices can drop by 50% in a single quarter during economic downturns.",
            "Fact: Electricity tariffs in Singapore are revised quarterly, not monthly.",
            "Tip: The 'latte factor' isn't about coffee, it's about mindless spending.",
            "Did you know? 1 in 3 Singaporeans don't have enough CPF savings for retirement.",
            "Fact: HDB resale prices have risen ~40% since 2020 due to low interest rates.",
            "Tip: The RSBR Ratio suggests spending 60-70% on essentials, not 50%."
        ];
    }

    render(slideElement, config) {
        if (config.id === 'action_plan') {
            const isComplete = this.rpg.isActionPlanComplete();
            const items = config.checklist || [];
            const completedItems = this.rpg.state.actionPlanItems;

            let html = `<h2>12-Month Action Plan</h2><p style="color:#666;">Complete these steps to master your budget.</p>`;
            html += `<ul style="list-style:none; padding:0; width:100%;">`;
            
            items.forEach(item => {
                const isChecked = completedItems.includes(item.id) || (item.req_calc && this.rpg.state.completedCalculators.includes(item.req_calc));
                const style = isChecked ? 'text-decoration:line-through; opacity:0.6;' : 'font-weight:bold;';
                
                html += `
                    <li style="margin-bottom:15px; display:flex; align-items:center; padding:10px; background:white; border-radius:8px; border:1px solid #eee;">
                        <input type="checkbox" id="chk-${item.id}" ${isChecked ? 'checked disabled' : ''} style="width:24px; height:24px; margin-right:15px; cursor:pointer;">
                        <span style="${style}">${item.text}</span>
                    </li>
                `;
            });
            html += `</ul>`;

            if (isComplete) {
                 html += `<div style="background:#d4edda; color:#155724; padding:15px; border-radius:8px; text-align:center; margin-top:10px; border:1px solid #c3e6cb;"><h3>🎉 Plan Completed!</h3><p>You have unlocked the Action Plan Badge!</p></div>`;
            } else {
                 html += `<div id="ap-status" style="text-align:center; margin-top:20px; color:#666;">${completedItems.length} / ${items.length} Steps Completed</div>`;
            }

            slideElement.innerHTML = html;

            setTimeout(() => {
                items.forEach(item => {
                    const chk = document.getElementById(`chk-${item.id}`);
                    if (chk && !chk.disabled) {
                        chk.addEventListener('change', () => {
                            if (chk.checked) {
                                this.rpg.toggleActionPlanItem(item.id);
                                const newCount = this.rpg.state.actionPlanItems.length;
                                if (newCount === items.length) this.handleActionPlanCompletion();
                                else document.getElementById('ap-status').textContent = `${newCount} / ${items.length} Steps Completed`;
                            }
                        });
                    }
                });
            }, 0);
            return;
        }

        // --- INPUT MEMORY & RENDERER ---
        let html = `<h2>${config.name}</h2><p style="color:#666; margin-bottom:20px;">${config.desc}</p>`;
        html += `<div class="calc-form">`;
        
        if (config.inputs && config.inputs.length > 0) {
            config.inputs.forEach(input => {
                html += this.createInputHTML(config.id, input);
            });
        }

        html += `</div>`;
        html += `<button id="btn-calc-${config.id}" class="btn-primary" style="width:100%; padding:12px; margin-top:20px; background:var(--accent-blue); color:white; border:none; border-radius:8px; font-size:1rem;">Calculate</button>`;
        html += `<div id="result-${config.id}" class="calc-result" style="margin-top:20px; display:none; background:#f0f8ff; padding:15px; border-radius:8px;"></div>`;

        slideElement.innerHTML = html;

        setTimeout(() => {
            document.getElementById(`btn-calc-${config.id}`).addEventListener('click', () => {
                this.calculate(config.id, config);
            });
        }, 0);
    }

    createInputHTML(calcId, input) {
        const storageKey = `input_${calcId}_${input.id}`;
        const savedValue = localStorage.getItem(storageKey);
        const displayValue = savedValue ? savedValue : (input.default !== undefined ? input.default : '');

        let field = `<div style="margin-bottom:15px;">`;
        field += `<label style="display:block; margin-bottom:5px; font-weight:bold;">${input.label}</label>`;
        
        if (input.type === 'select') {
            field += `<select id="input-${input.id}" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ccc; font-size:1rem;">`;
            input.options.forEach(opt => {
                const selected = (opt === displayValue) ? 'selected' : '';
                field += `<option value="${opt}" ${selected}>${opt}</option>`;
            });
            field += `</select>`;
        } else if (input.type === 'range') {
            const val = displayValue || input.default;
            field += `<input type="range" id="input-${input.id}" min="${input.min}" max="${input.max}" value="${val}" style="width:100%;" oninput="this.nextElementSibling.value = this.value + '%'">`;
            field += `<output style="float:right; font-weight:bold; color:var(--accent-blue);">${val}%</output>`;
        } else {
            field += `<input type="number" id="input-${input.id}" placeholder="${input.placeholder || ''}" value="${displayValue}" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ccc; font-size:1rem;">`;
        }
        
        field += `</div>`;
        return field;
    }

    calculate(id, config) {
        const inputs = {};
        if (config.inputs) {
            config.inputs.forEach(inp => {
                const el = document.getElementById(`input-${inp.id}`);
                if(inp.type === 'range') inputs[inp.id] = parseInt(el.value);
                else inputs[inp.id] = el.value;
                localStorage.setItem(`input_${id}_${inp.id}`, el.value);
            });
        }

        let resultText = "";
        let success = false;

        switch(id) {
            case 'gst':
                const gstInc = inputs.spending * 0.02;
                resultText = `<h3 style="margin-top:0;">💸 The GST Pinch</h3><p>You are paying an extra <strong style="color:var(--sg-red); font-size:1.2rem;">$${gstInc.toFixed(2)} / month</strong>.</p><p>That's <strong>$${(gstInc * 12).toFixed(2)} per year</strong> disappearing forever.</p>`;
                success = true;
                break;
            case 'inflation':
                const hWeight = inputs.housing / 100;
                const tWeight = inputs.transport / 100;
                const fWeight = inputs.food / 100;
                const personalRate = (hWeight * 35) + (tWeight * 14) + (fWeight * 37.5);
                resultText = `<h3 style="margin-top:0;">📈 Your Real Inflation</h3><p>Official Rate: 3.4%</p><p>Your Rate: <strong style="color:var(--sg-red); font-size:1.2rem;">${personalRate.toFixed(1)}%</strong></p>`;
                success = true;
                break;
            case 'car_cost':
                const diff = 1800 - 278;
                if (inputs.has_car === "Yes") {
                    resultText = `<h3 style="margin-top:0;">🚗 Car Ownership</h3><p>True Cost: <strong>$1,800/mo</strong></p><p>Public Alt: <strong>$278/mo</strong></p><p style="color:var(--sg-red);">You burn $${diff} every month. That's $18,000/year!</p>`;
                } else {
                    resultText = `<h3 style="margin-top:0;">🚆 Smart Move</h3><p>By taking public transport, you save approx <strong style="color:var(--success-green);">$${diff * 12}/year</strong>.</p>`;
                }
                success = true;
                break;
            case 'kopi_index':
                const latte = 7.50; const kopi = 1.50; const weekly = inputs.frequency;
                let cost = 0; let saved = 0; let msg = "";
                if (inputs.type.includes("Latte")) {
                    cost = latte * weekly * 52; saved = cost - (kopi * weekly * 52);
                    msg = `You spend $${cost.toFixed(0)}/year on coffee. Switching to Kopi saves <strong style="color:var(--success-green);">$${saved.toFixed(0)}/year</strong>.`;
                } else {
                    cost = kopi * weekly * 52;
                    msg = `You are a budget pro! Spending only $${cost.toFixed(0)}/year on coffee.`;
                }
                resultText = `<h3 style="margin-top:0;">☕ Kopi Index</h3><p>${msg}</p>`;
                success = true;
                break;
            case 'big3_tradeoff':
                const inc = parseInt(inputs.income);
                const hCost = inc * (inputs.housing_pct/100);
                const tCost = inc * (inputs.transport_pct/100);
                const fCost = inc * (inputs.food_pct/100);
                const total = hCost + tCost + fCost;
                const remaining = inc - total;
                let status = remaining < 0 ? `<span style="color:var(--sg-red);">DEFICIT -$${Math.abs(remaining)}</span>` : `<span style="color:var(--success-green);">SURPLUS $${remaining}</span>`;
                resultText = `<h3 style="margin-top:0;">⚖️ Budget Check</h3><ul style="padding-left:20px;"><li>Housing: $${hCost.toFixed(0)}</li><li>Transport: $${tCost.toFixed(0)}</li><li>Food: $${fCost.toFixed(0)}</li></ul><p><strong>Status: ${status}</strong></p>`;
                success = true;
                break;
            case 'rsbr_ratio':
                const ess = parseInt(inputs.essentials); const want = parseInt(inputs.wants); const sav = parseInt(inputs.savings); const totalFlow = ess + want + sav;
                if (totalFlow === 0) { resultText = "Please enter values."; break; }
                const ePct = (ess/totalFlow)*100; const wPct = (want/totalFlow)*100; const sPct = (sav/totalFlow)*100;
                const isE = ePct >= 60 && ePct <= 70; const isW = wPct >= 15 && wPct <= 25; const isS = sPct >= 10 && sPct <= 20;
                let rec = ""; if (isE && isW && isS) rec = "🏆 Perfect RSBR Balance!";
                else { rec = "Adjust to hit RSBR targets:<br>"; if (!isE) rec += `• Essentials (Target 60-70%): Currently ${ePct.toFixed(0)}%<br>`; if (!isW) rec += `• Wants (Target 15-25%): Currently ${wPct.toFixed(0)}%<br>`; if (!isS) rec += `• Savings (Target 10-20%): Currently ${sPct.toFixed(0)}%`; }
                resultText = `<h3 style="margin-top:0;">📊 RSBR Analysis</h3><p>${rec}</p>`;
                success = true;
                break;
            case 'emergency_fund':
                const exp = parseInt(inputs.expenses); const cash = parseInt(inputs.savings); const months = Math.floor(cash / exp);
                resultText = `<h3 style="margin-top:0;">🛡️ Survival Runway</h3><p>If you lose your job today, your cash lasts:</p><h2 style="color:var(--accent-blue); margin: 10px 0;">${months} Months</h2><p>${months >= 6 ? "You are well prepared!" : "Warning: Aim for at least 6 months."}</p>`;
                success = true;
                break;
        }

        // ADD RANDOM FACT
        const randomFact = this.sgFacts[Math.floor(Math.random() * this.sgFacts.length)];
        resultText += `<hr style="border:0; border-top:1px dashed #ccc; margin:15px 0;"><p style="font-size:0.8rem; color:#555; margin:0;">💡 ${randomFact}</p>`;

        const resDiv = document.getElementById(`result-${id}`);
        resDiv.innerHTML = resultText;
        resDiv.style.display = 'block';

        if (success) {
            const btn = document.getElementById(`btn-calc-${id}`);
            if (btn) {
                btn.textContent = "Claim XP Reward";
                btn.style.background = "var(--success-green)";
                btn.onclick = () => {
                    this.rpg.completeCalculator(id);
                    btn.textContent = "Completed ✓";
                    btn.disabled = true;
                    btn.style.background = "#ccc";
                };
            }
        }
    }

    handleActionPlanCompletion() {
        const xpGain = 200;
        this.rpg.addXP(xpGain, "Action Plan Completed");
        showToast("🎉 +200 XP: Action Plan Complete!");
        const statusDiv = document.getElementById('ap-status');
        if(statusDiv) statusDiv.innerHTML = "🏆 All Steps Completed!";
    }
}