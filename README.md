# Coding Editor with Terminal

This project is an end-to-end coding editor that allows users to write code, provide input, and execute it in a secure Docker container. The output is displayed in a terminal-like GUI. Hosted with a public URL.

## Structure
- `/frontend`: React frontend with code editor and terminal
- `/backend`: Backend API with Docker code execution

## Features
- Syntax-highlighted code editor (CodeMirror/Monaco)
- Input field for program input
- Terminal-style output
- Secure code execution in Docker

## Quick Start

### Local Development
1. **Backend**
    ```bash
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    python core/manage.py migrate
    python core/manage.py runserver
    ```
2. **Frontend**
    ```bash
    cd frontend
    npm install
    npm start
    ```

### Docker Compose
To run both frontend and backend with Docker Compose:
```bash
# From project root
sudo docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/execute/
