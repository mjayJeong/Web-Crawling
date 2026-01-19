# News Dashboard – Web Crawling & Trend Visualization

A full-stack web application that crawls news articles from Naver News, stores them by keyword, and visualizes article trends over time.

This project was built to practice **Python-based web crawling**, **RESTful API design**, and **React + TypeScript frontend development** with data visualization.

---

## ✨ Features

- Keyword-based news crawling
- Store crawled articles in a database
- View articles per keyword
- Visualize daily article trends with charts
- Simple dashboard-style UI
- Real-time interaction between frontend and backend

---

## 🛠 Tech Stack

### Backend
- **FastAPI**
- **SQLAlchemy**
- **SQLite**
- **BeautifulSoup / Requests** (Web Crawling)
- **Uvicorn**

### Frontend
- **React**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Recharts** (Data Visualization)

---

## How to Run Locally

### Backend

```bash
cd Backend
python -m venv .venv
source .venv/bin/activate 
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Fronted
```bash
cd Frontend
npm install
npm run dev
```