# Toohak - Interactive Quiz Platform

Toohak is a full-stack interactive quiz platform inspired by Kahoot, designed to gamify learning experiences with real-time participation and competition.

## Features

### User Management
- Secure registration and login
- User profile management
- Session tracking

### Quiz System
- Create and manage quizzes
- Real-time quiz sessions
- Multiple question types
- Scoring and ranking system

### Gameplay
- Live player participation
- Question countdown timers
- Instant results and feedback
- Session state management

## Technologies

**Backend:**
- Node.js with Express
- TypeScript
- REST API architecture
- Session management
- File upload handling

**Testing:**
- Jest for unit and integration testing
- Test coverage reporting
- Linting with ESLint

## Installation

1. Clone the repository:
```bash
git clone https://github.com/JohnnySiuky/Toohak---Interactive-Quiz-Platform.git
cd toohak-backend
```
2. Install dependencies:
```bash
npm install
```
3. Configure environment:
```bash
cp config.example.json config.json
```
4. Start the server:
```bash
npm start
```
## Development
Run tests:
```bash
npm test
```
Check test coverage:
```bash
npm run coverage
```
Run linter:
```bash
npm run lint
```
## API Documentation
The API follows RESTful conventions with detailed specifications available in the Swagger documentation.

Key endpoints include:
- /admin/auth - User authentication
- /admin/quiz - Quiz management
- /admin/quiz/{quizid}/session - Session control
- /player - Player participation endpoints

## Project Structure

```bash
/src
  /auth       - Authentication handlers
  /quiz       - Quiz management
  /session    - Game session logic
  /types      - Type definitions
  /utils      - Helper functions
/tests        - Test suites
```

## Contributing

Contributions are welcome! Please follow these guidelines:

Fork the repository
Create a feature branch
Commit your changes
Push to the branch
Submit a pull request

## Acknowledgements

UNSW COMP1531 Teaching Team
Inspired by Kahoot's interactive quiz model
Built with Node.js and Express
For questions or support, please contact siukwokyu@gmail.com.

