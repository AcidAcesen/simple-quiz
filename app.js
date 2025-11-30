// Quiz Application Logic
let quizData = null;
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let score = 0;

// Utility function to shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Randomize options for a question
function randomizeOptions(question) {
    try {
        const options = Object.entries(question.options); // [['A', 'text'], ['B', 'text'], ...]
        const shuffledOptions = shuffleArray(options);

        // Check if this is a multi-answer question (e.g., "B and C")
        const originalAnswer = question.answer;
        const isMultiAnswer = originalAnswer.includes(' and ');

        // Parse answer(s) into array
        let originalAnswerKeys = isMultiAnswer
            ? originalAnswer.split(' and ').map(key => key.trim())
            : [originalAnswer];

        // Get the correct text(s) for each answer
        const correctTexts = originalAnswerKeys.map(key => {
            const text = question.options[key];
            if (!text) {
                throw new Error(`Question ${question.id}: Answer key "${key}" not found in options`);
            }
            return text;
        });

        // Create new options object with shuffled order
        const newOptions = {};
        shuffledOptions.forEach(([key, text], index) => {
            const newKey = String.fromCharCode(65 + index); // A, B, C, D
            newOptions[newKey] = text;
        });

        // Find the new correct answer key(s)
        const newAnswerKeys = correctTexts.map(correctText => {
            const answerEntry = Object.entries(newOptions).find(([key, text]) => text === correctText);
            if (!answerEntry) {
                throw new Error(`Question ${question.id}: Cannot find answer "${correctText}" in shuffled options`);
            }
            return answerEntry[0];
        });

        // Format final answer
        const finalAnswer = isMultiAnswer
            ? newAnswerKeys.sort().join(' and ')  // Sort to ensure consistent order (A and B, not B and A)
            : newAnswerKeys[0];

        return {
            ...question,
            options: newOptions,
            answer: finalAnswer,
            originalAnswer: originalAnswer,
            isMultiAnswer: isMultiAnswer,
            answerArray: newAnswerKeys.sort()  // Store as array for easier comparison
        };
    } catch (error) {
        console.error('Error randomizing options for question:', question, error);
        throw error;
    }
}

// Load quiz data
function loadQuiz() {
    const examDataFile = sessionStorage.getItem('examDataFile');
    const examName = sessionStorage.getItem('examName');

    console.log('Loading quiz:', { examDataFile, examName });

    if (!examDataFile) {
        console.error('Missing exam data in sessionStorage');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('exam-title').textContent = examName;

    // Fetch the JSON data file
    fetch(examDataFile)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load exam data: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Quiz data loaded:', data ? 'Success' : 'Failed');

            quizData = data;

            if (!quizData) {
                throw new Error('Exam data is empty');
            }

            // Flatten all questions from all domains
            const allQuestions = [];

            quizData.domains.forEach(domain => {
                domain.questions.forEach(q => {
                    allQuestions.push({
                        ...q,
                        domainName: domain.name,
                        domainWeight: domain.weight
                    });
                });
            });

            console.log('Total questions loaded:', allQuestions.length);

            // Randomize question order
            questions = shuffleArray(allQuestions);

            // Check if there's a question limit (for quick quiz mode)
            const questionLimit = sessionStorage.getItem('questionLimit');
            if (questionLimit && questionLimit !== 'null') {
                const limit = parseInt(questionLimit);
                questions = questions.slice(0, limit);
                console.log(`Limited to ${limit} questions`);
            }

            // Randomize options for each question
            questions = questions.map(q => randomizeOptions(q));

            // Initialize user answers array
            userAnswers = new Array(questions.length).fill(null);

            // Display first question
            displayQuestion();
        })
        .catch(error => {
            console.error('Error loading quiz:', error);
            document.getElementById('quiz-container').innerHTML = `
                <div class="error">
                    <p>Error loading quiz data: ${error.message}</p>
                    <button onclick="window.location.href='index.html'">Back to Exams</button>
                </div>
            `;
        });
}

// Display current question
function displayQuestion() {
    const question = questions[currentQuestionIndex];
    const quizContainer = document.getElementById('quiz-container');

    // Update progress
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    document.getElementById('progress').style.width = `${progress}%`;
    document.getElementById('question-counter').textContent =
        `Question ${currentQuestionIndex + 1} of ${questions.length}`;

    // Get current user answer(s)
    const currentAnswer = userAnswers[currentQuestionIndex];
    const selectedKeys = question.isMultiAnswer && Array.isArray(currentAnswer)
        ? currentAnswer
        : (currentAnswer ? [currentAnswer] : []);

    // Build question HTML
    quizContainer.innerHTML = `
        <div class="question-card">
            <div class="domain-badge">${question.domainName} (${question.domainWeight})</div>
            ${question.isMultiAnswer ? '<div class="multi-answer-badge">Select all that apply</div>' : ''}
            <h3 class="question-text">${question.question}</h3>
            <div class="options">
                ${Object.entries(question.options).map(([key, text]) => `
                    <div class="option ${selectedKeys.includes(key) ? 'selected' : ''}" data-option-key="${key}">
                        <span class="option-key">${key}</span>
                        <span class="option-text">${text}</span>
                        ${question.isMultiAnswer ? `<span class="checkbox">${selectedKeys.includes(key) ? '✓' : ''}</span>` : ''}
                    </div>
                `).join('')}
            </div>
            <div class="navigation">
                <button onclick="previousQuestion()"
                        ${currentQuestionIndex === 0 ? 'disabled' : ''}
                        class="btn-secondary">Previous</button>
                <button onclick="nextQuestion()"
                        class="btn-primary">
                    ${currentQuestionIndex === questions.length - 1 ? 'Submit Quiz' : 'Next'}
                </button>
            </div>
        </div>
    `;

    // Add event listeners to options after rendering
    const optionElements = quizContainer.querySelectorAll('.option');
    optionElements.forEach(option => {
        option.addEventListener('click', function() {
            const key = this.getAttribute('data-option-key');
            selectAnswer(key, question.isMultiAnswer);
        });
    });
}

// Select an answer
function selectAnswer(key, isMultiAnswer) {
    const optionElement = document.querySelector(`.option[data-option-key="${key}"]`);

    if (isMultiAnswer) {
        // Multi-answer: toggle selection
        let currentAnswers = userAnswers[currentQuestionIndex];

        // Initialize as array if not already
        if (!Array.isArray(currentAnswers)) {
            currentAnswers = currentAnswers ? [currentAnswers] : [];
        }

        // Toggle the key
        const index = currentAnswers.indexOf(key);
        if (index > -1) {
            // Remove if already selected
            currentAnswers = currentAnswers.filter(k => k !== key);
            optionElement.classList.remove('selected');
            const checkbox = optionElement.querySelector('.checkbox');
            if (checkbox) checkbox.textContent = '';
        } else {
            // Add if not selected
            currentAnswers = [...currentAnswers, key].sort();
            optionElement.classList.add('selected');
            const checkbox = optionElement.querySelector('.checkbox');
            if (checkbox) checkbox.textContent = '✓';
        }

        userAnswers[currentQuestionIndex] = currentAnswers.length > 0 ? currentAnswers : null;
    } else {
        // Single answer: deselect all others, select this one
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });
        optionElement.classList.add('selected');
        userAnswers[currentQuestionIndex] = key;
    }
}

// Navigate to previous question
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

// Navigate to next question
function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        // Submit quiz
        submitQuiz();
    }
}

// Submit quiz and show results
function submitQuiz() {
    // Calculate score
    score = 0;
    const domainScores = {};

    questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        let isCorrect = false;

        if (question.isMultiAnswer) {
            // For multi-answer questions, compare arrays
            const userAnswerArray = Array.isArray(userAnswer) ? userAnswer.sort() : [];
            const correctAnswerArray = question.answerArray || [];
            isCorrect = JSON.stringify(userAnswerArray) === JSON.stringify(correctAnswerArray);
        } else {
            // For single-answer questions, direct comparison
            isCorrect = userAnswer === question.answer;
        }

        if (isCorrect) {
            score++;
        }

        // Track domain scores
        if (!domainScores[question.domainName]) {
            domainScores[question.domainName] = { correct: 0, total: 0, wrongQuestions: [] };
        }
        domainScores[question.domainName].total++;
        if (isCorrect) {
            domainScores[question.domainName].correct++;
        } else {
            // Track wrong questions with details
            const userAnswerText = question.isMultiAnswer
                ? (Array.isArray(userAnswer) && userAnswer.length > 0
                    ? userAnswer.map(key => `${key}: ${question.options[key]}`).join(', ')
                    : 'No answer selected')
                : (userAnswer ? `${userAnswer}: ${question.options[userAnswer]}` : 'No answer selected');

            const correctAnswerText = question.isMultiAnswer
                ? question.answerArray.map(key => `${key}: ${question.options[key]}`).join(', ')
                : `${question.answer}: ${question.options[question.answer]}`;

            domainScores[question.domainName].wrongQuestions.push({
                question: question.question,
                userAnswer: userAnswerText,
                correctAnswer: correctAnswerText,
                explanation: question.explanation
            });
        }
    });

    const percentage = Math.round((score / questions.length) * 100);

    // Show results
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('results-container').style.display = 'block';
    document.getElementById('final-score').textContent = percentage;

    // Build score breakdown
    let breakdownHTML = `
        <div class="score-summary">
            <p><strong>Total Score:</strong> ${score} out of ${questions.length} (${percentage}%)</p>
        </div>
        <div class="domain-breakdown">
            <h3>Score by Domain:</h3>
    `;

    Object.entries(domainScores).forEach(([domain, scores]) => {
        const domainPercentage = Math.round((scores.correct / scores.total) * 100);
        const wrongCount = scores.wrongQuestions.length;
        const domainId = domain.replace(/\s+/g, '-').toLowerCase();

        breakdownHTML += `
            <div class="domain-score">
                <div class="domain-score-header ${wrongCount > 0 ? 'clickable' : ''}"
                     ${wrongCount > 0 ? `onclick="toggleDomainDropdown('${domainId}')"` : ''}>
                    <span>${domain}</span>
                    <span>${scores.correct}/${scores.total} (${domainPercentage}%)</span>
                </div>
                <div class="progress-bar small">
                    <div class="progress-fill" style="width: ${domainPercentage}%"></div>
                </div>
        `;

        // Add dropdown for wrong questions if any exist
        if (wrongCount > 0) {
            breakdownHTML += `
                <div id="${domainId}" class="wrong-questions-dropdown" style="display: none;">
                    <h4>Wrong Questions (${wrongCount}):</h4>
            `;

            scores.wrongQuestions.forEach((wrongQ, idx) => {
                breakdownHTML += `
                    <div class="wrong-question-item">
                        <div class="wrong-question-number">Question ${idx + 1}:</div>
                        <div class="wrong-question-text">${wrongQ.question}</div>
                        <div class="answer-comparison">
                            <div class="user-answer">
                                <strong>Your Answer:</strong> ${wrongQ.userAnswer}
                            </div>
                            <div class="correct-answer">
                                <strong>Correct Answer:</strong> ${wrongQ.correctAnswer}
                            </div>
                        </div>
                        <div class="explanation">
                            <strong>Explanation:</strong> ${wrongQ.explanation}
                        </div>
                    </div>
                `;
            });

            breakdownHTML += `
                </div>
            `;
        }

        breakdownHTML += `</div>`;
    });

    breakdownHTML += '</div>';
    document.getElementById('score-breakdown').innerHTML = breakdownHTML;
}

// Toggle dropdown for wrong questions
function toggleDomainDropdown(domainId) {
    const dropdown = document.getElementById(domainId);
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
}

// Restart quiz
function restartQuiz() {
    currentQuestionIndex = 0;
    userAnswers = new Array(questions.length).fill(null);
    score = 0;

    // Re-randomize questions
    questions = shuffleArray(questions);
    questions = questions.map(q => randomizeOptions(q));

    document.getElementById('quiz-container').style.display = 'block';
    document.getElementById('results-container').style.display = 'none';

    displayQuestion();
}

// Initialize quiz when page loads
if (document.getElementById('quiz-container')) {
    loadQuiz();
}
