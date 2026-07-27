# 💬 Chat App — Real-time Messaging with Auth

A full-stack real-time chat application built with **Node.js**, **Express**, **Socket.io**, and **MariaDB**.  
Supports user authentication, persistent message history, and live broadcasting.

---

## 🚀 Features

- 🔐 User authentication (signup/login with JWT cookies)
- 💬 Real-time messaging via WebSockets
- 📜 Persistent message history (loads last messages on connect)
- 👤 Usernames displayed with messages
- 🛡️ XSS protection (HTML escaping)
- 📱 Responsive UI with auto-scroll and typing animations
- 🔒 Protected routes and Socket.io middleware

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express |
| Real-time | Socket.io |
| Database | MariaDB (MySQL) |
| Auth | JWT, bcryptjs |
| Frontend | HTML, CSS, Vanilla JS |
| Deployment | Render + Aiven |

---

## 📁 Project Structure

```
├── server.js          # Main server with HTTP + WebSocket
├── db.js              # Database connection pool
├── public/
│   ├── auth.html      # Signup/Login page
│   ├── dashboard.html # Chat interface
│   ├── script.js      # Frontend logic
│   ├── style.css      # Styling
│   └── auth.css       # Auth page styling
├── .env               # Environment variables
└── README.md
```

---

## 🗄️ Database Schema

### `chatappUsers`
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK, AI) | User ID |
| username | VARCHAR(50) UNIQUE | Username |
| password | VARCHAR(255) | Hashed password |
| email | VARCHAR(100) | Optional email |
| phnNumber | VARCHAR(20) | Optional phone |

### `chatapp`
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK, AI) | Message ID |
| username | VARCHAR(50) | Sender username |
| msg | TEXT | Message content |
| created_at | TIMESTAMP | Auto timestamp |

---

## 🚦 Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/chat-app.git
cd chat-app

# 2. Install dependencies
npm install

# 3. Set up .env
cp .env.example .env
# Add your JWT_SECRET and DB credentials

# 4. Start MariaDB and create tables
mysql -u root -p < schema.sql

# 5. Run the server
npm start
```

Visit `http://localhost:3000`

---

## 🔐 Environment Variables

```env
PORT=3000
JWT_PASS=your_jwt_secret
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=chat_app
```

---

## 📦 Deployment

Deployed on **Render** with **Aiven** for MariaDB hosting.

---

## 🙌 Credits

Built by **Rup Hasan**  
From a beginner's dream to a real-time chat app — this is the journey.

---

## 📄 License

MIT — feel free to use, modify, and share.