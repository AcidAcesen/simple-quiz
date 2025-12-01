# 📚 Simple Quiz - CompTIA Security+ SY0-701

An interactive quiz application for CompTIA Security+ SY0-701 certification exam preparation. Available as both a web application and Android mobile app.

## 🌐 Live Demo

**Web App:** [https://acidacesen.github.io/simple-quiz/](https://acidacesen.github.io/simple-quiz/)

## 📱 Android App

Download and install the Android app directly on your device:

**[Download APK](QuizAPP%201.0/android/app-release.apk)** (790KB)

### Installation Instructions:
1. Download the APK file
2. Enable "Install from Unknown Sources" in your Android settings
3. Open the downloaded APK file and follow the installation prompts

## ✨ Features

- ✅ **100 Questions** covering all CompTIA Security+ SY0-701 domains
- 🔀 **Randomized Questions** - Different order every time
- 🎲 **Shuffled Options** - Answer choices randomized to prevent memorization
- 📊 **Domain-Based Scoring** - Track performance by security domain
- ⚡ **Two Quiz Modes:**
  - Full Quiz (100 questions)
  - Quick Quiz (10 questions)
- 📱 **Multi-Platform:**
  - Web application (works on any browser)
  - Native Android app
- 🎯 **Detailed Feedback** - Review wrong answers with explanations

## 📖 Question Domains

The quiz covers all five CompTIA Security+ SY0-701 domains:

1. **General Security Concepts** (12%) - 10 questions
2. **Threats, Vulnerabilities, and Mitigations** (22%) - 22 questions
3. **Security Architecture** (18%) - 18 questions
4. **Security Operations** (28%) - 27 questions
5. **Security Program Management and Oversight** (20%) - 23 questions

## 🚀 Getting Started

### Web Version

Simply visit the live demo URL or host it yourself:

```bash
# Clone the repository
git clone https://github.com/AcidAcesen/simple-quiz.git
cd simple-quiz

# Serve locally (choose one method)

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx http-server

# Then open http://localhost:8000 in your browser
```

### Android Version

Download the APK from the [QuizAPP 1.0/android](QuizAPP%201.0/android/) folder and install on your Android device.

## 📁 Project Structure

```
simple-quiz/
├── index.html              # Main page - exam selection
├── quiz.html               # Quiz interface
├── app.js                  # Quiz logic and functionality
├── styles.css              # Styling
├── README.md               # Documentation
├── mats_json/
│   └── comptia_sec_plus.json  # Question bank (100 questions)
└── QuizAPP 1.0/
    └── android/
        └── app-release.apk # Android application
```

## 🔧 How It Works

1. **Data Loading**: Quiz loads questions from JSON file (`mats_json/comptia_sec_plus.json`)
2. **Randomization**: Questions and answer options are shuffled for each session
3. **Question Tracking**: Progress tracked across all domains
4. **Score Calculation**: Performance calculated overall and per domain
5. **Results Display**: Detailed breakdown showing:
   - Overall score percentage
   - Score by domain
   - Wrong answers with correct solutions
   - Explanations for each question

## 📝 Adding New Exams

The system is designed to be easily extensible. To add a new exam:

1. Create a new JSON file in `mats_json/` (follow the existing format)
2. Add the exam configuration to `index.html`:

```javascript
{
    id: 'exam_name',
    name: 'Exam Display Name',
    description: 'Number of questions description',
    dataFile: 'mats_json/your_exam.json'
}
```

That's it! No code changes required.

## 📋 JSON Format

Questions follow this structure:

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
            "A": "Option A text",
            "B": "Option B text",
            "C": "Option C text",
            "D": "Option D text"
          },
          "answer": "C",
          "explanation": "Explanation of correct answer."
        }
      ]
    }
  ]
}
```

## 🛠️ Technologies Used

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Data Format:** JSON
- **Hosting:** GitHub Pages
- **Mobile:** Android APK

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-exam`)
3. Add your changes (new questions, exams, features)
4. Commit your changes (`git commit -m 'Add new exam'`)
5. Push to the branch (`git push origin feature/new-exam`)
6. Open a Pull Request

## 📄 License

This project is open source and available for educational purposes.

## 🎓 Disclaimer

This quiz is for educational and practice purposes only. It is not affiliated with or endorsed by CompTIA. For official CompTIA Security+ certification information, visit [CompTIA's official website](https://www.comptia.org/certifications/security).

## 📞 Support

If you encounter any issues or have questions:

- Open an issue on GitHub
- Check existing issues for solutions
- Review the documentation

## 🌟 Acknowledgments

Built with assistance from [Claude Code](https://claude.com/claude-code)

---

**Good luck with your CompTIA Security+ certification! 🎯**
