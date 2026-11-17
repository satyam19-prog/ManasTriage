/**
 * Primary Health Care (PHC) Mental Health Triage Kiosk
 * Pure Vanilla JavaScript Client Logic - Strictly Stateless Architecture
 * Clinical Instrument: Patient Health Questionnaire-9 (PHQ-9)
 */

// 1. PHQ-9 Clinically Validated Questions
const PHQ9_QUESTIONS = [
    {
        id: 1,
        text: "Little interest or pleasure in doing things"
    },
    {
        id: 2,
        text: "Feeling down, depressed, or hopeless"
    },
    {
        id: 3,
        text: "Trouble falling or staying asleep, or sleeping too much"
    },
    {
        id: 4,
        text: "Feeling tired or having little energy"
    },
    {
        id: 5,
        text: "Poor appetite or overeating"
    },
    {
        id: 6,
        text: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down"
    },
    {
        id: 7,
        text: "Trouble concentrating on things, such as reading the newspaper or watching television"
    },
    {
        id: 8,
        text: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual"
    },
    {
        id: 9,
        text: "Thoughts that you would be better off dead, or of hurting yourself in some way",
        isSafetyCritical: true
    }
];

// 2. Standard PHQ-9 4-point Likert Scale Options
const PHQ9_OPTIONS = [
    { label: "Not at all", value: 0 },
    { label: "Several days", value: 1 },
    { label: "More than half the days", value: 2 },
    { label: "Nearly every day", value: 3 }
];

// DOM Element References
const screenWelcome = document.getElementById('screen-welcome');
const screenAssessment = document.getElementById('screen-assessment');
const screenResults = document.getElementById('screen-results');
const quizContainer = document.getElementById('quiz-container');
const phq9Form = document.getElementById('phq9-form');
const answeredCountText = document.getElementById('answered-count-text');
const progressBarFill = document.getElementById('progress-bar-fill');
const validationAlert = document.getElementById('validation-alert');
const validationMessage = document.getElementById('validation-message');

// Results DOM References
const finalScoreEl = document.getElementById('final-score');
const severityLabelEl = document.getElementById('severity-label');
const scoreTierCodeEl = document.getElementById('score-tier-code');
const actionTextEl = document.getElementById('action-text');
const criticalSafetyFlagEl = document.getElementById('critical-safety-flag');

/**
 * Initializes and dynamically injects the PHQ-9 question cards into the DOM
 */
function initAssessment() {
    quizContainer.innerHTML = '';

    PHQ9_QUESTIONS.forEach((q) => {
        const questionBlock = document.createElement('div');
        questionBlock.className = 'question-block';
        questionBlock.id = `question-block-${q.id}`;

        const questionHeader = document.createElement('div');
        questionHeader.className = 'question-header';
        questionHeader.innerHTML = `
            <span class="question-number">Q${q.id}</span>
            <span class="question-text">${q.text}</span>
        `;
        questionBlock.appendChild(questionHeader);

        const optionsGrid = document.createElement('div');
        optionsGrid.className = 'options-grid';

        PHQ9_OPTIONS.forEach((opt) => {
            const label = document.createElement('label');
            label.className = 'option-label';
            label.setAttribute('for', `q${q.id}_opt${opt.value}`);

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = `phq9_q${q.id}`;
            radio.id = `q${q.id}_opt${opt.value}`;
            radio.value = opt.value;

            // Update state and progress when patient selects an option
            radio.addEventListener('change', () => {
                handleOptionSelect(q.id, questionBlock);
            });

            label.appendChild(radio);
            label.appendChild(document.createTextNode(opt.label));
            optionsGrid.appendChild(label);
        });

        questionBlock.appendChild(optionsGrid);
        quizContainer.appendChild(questionBlock);
    });
}

/**
 * Handles styling and progress calculation when an option is selected
 */
function handleOptionSelect(questionId, questionBlock) {
    // Remove highlight if it was flagged as unanswered
    questionBlock.classList.remove('unanswered-highlight');

    // Update active label visual states for this question
    const labels = questionBlock.querySelectorAll('.option-label');
    labels.forEach(lbl => {
        const input = lbl.querySelector('input');
        if (input && input.checked) {
            lbl.classList.add('selected');
        } else {
            lbl.classList.remove('selected');
        }
    });

    updateProgress();
}

/**
 * Calculates current completion progress and updates progress indicators
 */
function updateProgress() {
    let answered = 0;
    for (let i = 1; i <= 9; i++) {
        if (document.querySelector(`input[name="phq9_q${i}"]:checked`)) {
            answered++;
        }
    }

    answeredCountText.textContent = answered;
    const percentage = Math.round((answered / 9) * 100);
    progressBarFill.style.width = `${percentage}%`;

    // Hide error banner if all are answered
    if (answered === 9) {
        validationAlert.classList.add('hidden');
    }
}

/**
 * Switches the active screen with clean DOM transitions
 */
function switchScreen(targetScreen) {
    [screenWelcome, screenAssessment, screenResults].forEach(screen => {
        screen.classList.remove('active');
    });
    targetScreen.classList.add('active');
}

/**
 * Navigation: Welcome -> Assessment
 */
function startAssessment() {
    switchScreen(screenAssessment);
    if (phq9Form) {
        phq9Form.scrollTop = 0;
    }
}

/**
 * Validates assessment and generates clinical report
 */
function generateReport() {
    const unansweredQuestions = [];
    let totalScore = 0;
    let question9Score = 0;

    for (let i = 1; i <= 9; i++) {
        const selected = document.querySelector(`input[name="phq9_q${i}"]:checked`);
        const block = document.getElementById(`question-block-${i}`);

        if (selected) {
            const scoreVal = parseInt(selected.value, 10);
            totalScore += scoreVal;
            if (i === 9) {
                question9Score = scoreVal;
            }
            if (block) block.classList.remove('unanswered-highlight');
        } else {
            unansweredQuestions.push(i);
            if (block) block.classList.add('unanswered-highlight');
        }
    }

    // Validation Check: All 9 questions must be answered
    if (unansweredQuestions.length > 0) {
        validationAlert.classList.remove('hidden');
        validationMessage.textContent = `Please complete all 9 questions. Unanswered: ${unansweredQuestions.map(n => `Q${n}`).join(', ')}`;
        
        // Scroll first unanswered question into view
        const firstUnansweredBlock = document.getElementById(`question-block-${unansweredQuestions[0]}`);
        if (firstUnansweredBlock) {
            firstUnansweredBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    // Validation Succeeded: Hide validation alert
    validationAlert.classList.add('hidden');

    // Display Screen 3 Results
    displayResults(totalScore, question9Score);
}

/**
 * Renders clinical scoring, tier classification, and health worker directives
 */
function displayResults(score, q9Score) {
    finalScoreEl.textContent = score;

    // Reset previous alert tier classes
    screenResults.classList.remove('tier-green', 'tier-yellow', 'tier-red');

    // Clinical Triage Algorithm per PHQ-9 Guidelines
    if (score >= 0 && score <= 4) {
        // GREEN TIER (0 - 4)
        screenResults.classList.add('tier-green');
        severityLabelEl.textContent = "Minimal / No Depression";
        scoreTierCodeEl.textContent = "STATUS: GREEN";
        actionTextEl.innerHTML = `
            <p><strong>Status: GREEN</strong></p>
            <p>No specific medical intervention required. Provide standard wellness literature.</p>
        `;
    } else if (score >= 5 && score <= 14) {
        // YELLOW TIER (5 - 14)
        screenResults.classList.add('tier-yellow');
        severityLabelEl.textContent = "Mild to Moderate Vulnerability";
        scoreTierCodeEl.textContent = "STATUS: YELLOW";
        actionTextEl.innerHTML = `
            <p><strong>Status: YELLOW</strong></p>
            <p>Schedule a follow-up consultation and recommend local campus/community counseling services.</p>
        `;
    } else {
        // RED TIER (15 - 27)
        screenResults.classList.add('tier-red');
        severityLabelEl.textContent = "Moderately Severe to Severe Risk";
        scoreTierCodeEl.textContent = "STATUS: RED";
        actionTextEl.innerHTML = `
            <p><strong>Status: RED</strong></p>
            <p>Immediate intervention required. Facilitate contact with local psychiatric support.</p>
            <p style="margin-top: 8px;"><strong>National Emergency Support:</strong> Kiran Mental Health Helpline (<strong>1800-599-0019</strong>).</p>
        `;
    }

    // Question 9 Suicide Risk Safety Protocol
    if (q9Score > 0) {
        criticalSafetyFlagEl.classList.remove('hidden');
    } else {
        criticalSafetyFlagEl.classList.add('hidden');
    }

    // Transition to results screen
    switchScreen(screenResults);
}

/**
 * Abort / Cancel during assessment confirmation
 */
function confirmReset() {
    if (confirm("Are you sure you want to cancel the current assessment? All entered answers will be cleared.")) {
        restartKiosk();
    }
}

/**
 * Strictly Stateless Reset: Purges all DOM values, states, and returns to Welcome Screen
 */
function restartKiosk() {
    // 1. Reset all radio buttons
    const allRadios = document.querySelectorAll('input[type="radio"]');
    allRadios.forEach(r => {
        r.checked = false;
    });

    // 2. Clear label selections and highlight classes
    document.querySelectorAll('.option-label').forEach(lbl => {
        lbl.classList.remove('selected');
    });
    document.querySelectorAll('.question-block').forEach(blk => {
        blk.classList.remove('unanswered-highlight');
    });

    // 3. Clear validation alert
    validationAlert.classList.add('hidden');
    validationMessage.textContent = 'Please answer all 9 questions before proceeding.';

    // 4. Reset progress indicators
    answeredCountText.textContent = '0';
    progressBarFill.style.width = '0%';

    // 5. Reset results display
    finalScoreEl.textContent = '0';
    severityLabelEl.textContent = 'Assessment Level';
    scoreTierCodeEl.textContent = 'TIER';
    actionTextEl.innerHTML = '';
    criticalSafetyFlagEl.classList.add('hidden');
    screenResults.classList.remove('tier-green', 'tier-yellow', 'tier-red');

    // 6. Reset scroll position of questions form
    if (phq9Form) {
        phq9Form.scrollTop = 0;
    }

    // 7. Transition back to Welcome Screen
    switchScreen(screenWelcome);
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initAssessment();
});


// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initAssessment();
});