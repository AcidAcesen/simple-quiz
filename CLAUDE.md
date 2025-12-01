# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A multi-platform quiz application for CompTIA Security+ SY0-701 certification exam preparation. The project consists of a vanilla JavaScript web application and an Android mobile app.

**Live Demo:** https://acidacesen.github.io/simple-quiz/

## Running the Application

The application is a static web app with no build process. Serve it locally using any HTTP server:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx http-server

# Then open http://localhost:8000
```

## Architecture

### Application Flow
1. **Entry Point** (`index.html`): Displays available exams and quiz mode selection (Full Quiz or Quick Quiz)
2. **Quiz Interface** (`quiz.html`): Renders questions, progress tracking, and results
3. **Quiz Logic** (`app.js`): Handles all quiz functionality

### Key Components

**Data Flow:**
- Exam metadata is stored in `index.html` in the `exams` array
- Exam selection parameters are passed via `sessionStorage`:
  - `examDataFile`: path to JSON file
  - `examName`: display name
  - `questionLimit`: null for full quiz, or number (e.g., 10) for quick quiz
- `quiz.html` loads on navigation and `app.js` reads from `sessionStorage` to fetch the appropriate JSON

**Question Randomization (`app.js`):**
- Questions are shuffled using Fisher-Yates algorithm (`shuffleArray()`)
- Answer options are randomized for each question (`randomizeOptions()`)
- The function preserves correct answer integrity by:
  - Mapping original answer keys to their text values
  - Reassigning new keys (A, B, C, D) after shuffling
  - Updating the answer key to match the new positions
  - Supports multi-answer questions (e.g., "B and C")

**Scoring System:**
- Tracks overall score and per-domain performance
- Single-answer questions: direct key comparison
- Multi-answer questions: array comparison after sorting
- Results display includes expandable dropdowns showing wrong answers with explanations

## JSON Data Format

Questions are stored in `mats_json/` directory. Structure:

```json
{
  "title": "Exam Title",
  "description": "Exam Description",
  "domains": [
    {
      "id": 1,
      "name": "Domain Name",
      "weight": "XX%",
      "questions": [
        {
          "id": "Q1",
          "question": "Question text?",
          "options": {
            "A": "Option text",
            "B": "Option text",
            "C": "Option text",
            "D": "Option text"
          },
          "answer": "C",
          "explanation": "Explanation text"
        }
      ]
    }
  ]
}
```

**Multi-Answer Support:** For questions with multiple correct answers, use format: `"answer": "B and C"`

## Adding New Exams

1. Create a new JSON file in `mats_json/` following the format above
2. Add exam configuration to the `exams` array in `index.html`:

```javascript
{
    id: 'exam_name',
    name: 'Exam Display Name',
    description: 'Number of questions description',
    dataFile: 'mats_json/your_exam.json'
}
```

No code changes in `app.js` or `quiz.html` are required.

## Project Structure

```
flashcard/
├── index.html                      # Exam selection page
├── quiz.html                       # Quiz interface
├── app.js                          # All quiz logic and state management
├── styles.css                      # Styling
├── mats_json/
│   └── comptia_sec_plus.json      # Question bank (100 questions)
└── QuizAPP 1.0/
    └── android/                    # Android APK and signing files
```

## Important Implementation Notes

**State Management:**
- All quiz state is managed in `app.js` global variables (no framework)
- `questions`: flattened and shuffled array of all questions
- `currentQuestionIndex`: tracks position in quiz
- `userAnswers`: array storing user selections (null for unanswered)
- `score`: calculated on submission

**Multi-Answer Questions:**
- Questions with `isMultiAnswer: true` render checkboxes instead of radio buttons
- User selections stored as sorted arrays in `userAnswers`
- Comparison uses `JSON.stringify()` for array equality

**Navigation:**
- Users can navigate back/forward through questions
- Selections are preserved when navigating
- "Submit Quiz" button appears on final question

**Results Display:**
- Each domain shows percentage and progress bar
- Domains with wrong answers are clickable to expand details
- Wrong question details include: question text, user's answer, correct answer, and explanation
