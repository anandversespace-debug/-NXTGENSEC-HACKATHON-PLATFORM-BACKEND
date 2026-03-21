# NxtGenSec | Stateful Backend Node

[![Backend: Node.js/Express](https://img.shields.io/badge/Backend-Node.js%20%2F%20Express-green.svg)](https://expressjs.com)
[![Protocol: Socket.io](https://img.shields.io/badge/Protocol-Socket.io-black.svg)](https://socket.io)
[![DB: MongoDB Atlas](https://img.shields.io/badge/DB-MongoDB%20Atlas-blue.svg)](https://mongodb.com/atlas)

The **NxtGenSec Backend** is the persistent core of the ecosystem, handling real-time socket clusters, high-concurrency innovation registries, and complex data aggregation for the Telemetry Hub.

---

## 🏗️ Core Architecture

- **Persistent Node**: Handles long-lived WebSocket connections for achievement signals.
- **Enterprise Registry**: High-performance MongoDB implementation for project audits and user lifecycle management.
- **Telemetry Engine**: Automated data aggregation using MongoDB pipelines for real-time analytics.

---

## 📂 Internal Directory Map

- **`controllers/`**: Business logic orchestration (search, stats, system, users).
- **`models/`**: Mongoose schemas with high-load indexing (email, role, status).
- **`routes/`**: Express route definitions with Role-Based Access Control (RBAC).
- **`middleware/`**: JWT-based stateless identity verification and CORS defense.
- **`config/`**: Database, Cloudinary, and Socket.io cluster configurations.
- **`utils/`**: Helper methods for certificate generation and email broadcasting.

---

## 📜 Enterprise Audit Logs

We implement a mandatory **Audit Trail** for every administrative action.
- **`Log` Model**: Stores `admin_id`, `action`, `target_id`, and `details`.
- **Indexing**: Optimized for `{ admin_id: 1, action: 1 }` to enable rapid security auditing.

---

## ⚡ Data Strategy & Indexing

To ensure millisecond response times at scale, we utilize:
- **`User` Index**: Unique, sparse indexes on `email` and `username`.
- **`Project` Index**: Searchable title and technology stack indexing.
- **`Log` Index**: Compound indexing for security auditing.

---

## 📡 Signal Sync Protocol

The backend emits signals to private socket rooms (`user_${userId}`) when:
1.  **Project Verified**: Achievement signal and reputation update.
2.  **Submission Registered**: Confirmation pulse.
3.  **System Action**: Security alerts or role updates.

---

## ⚙️ Development Ignition

### 1. Configure Local Terminal
Ensure `backend/.env` contains the correct connection strings:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### 2. Launch Sequence
```bash
npm install
npm run dev
```

---

© 2026 NxtGenSec Backend Engineering. Built for the future of global innovation.
