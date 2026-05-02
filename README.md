# TaskManager — Full Stack Project Management App

A full-stack task management application built with **Spring Boot** (backend) and **React + Vite** (frontend), deployed on **Railway** and **Vercel**.

---

## 🔗 Live Demo

| Service  | URL |
|----------|-----|
| Frontend | https://task-manager-ten-tau-65.vercel.app |
| Backend API | https://successful-imagination-production-8894.up.railway.app |

**Admin Credentials (Demo)**
- Email: `admin@taskmanager.com`
- Password: `admin123`

---

## 🧱 Tech Stack

### Backend
- Java 17 + Spring Boot 3.2.5
- Spring Security + JWT (jjwt 0.12.6)
- Spring Data JPA + Hibernate
- MySQL (Railway hosted)
- Maven

### Frontend
- React 18 + Vite 5
- React Router DOM v6
- Axios
- Tailwind CSS

### Deployment
- Backend → Railway (Docker/JAR)
- Frontend → Vercel

---

## 📁 Project Structure

```
.
├── taskmanager/                  # Spring Boot backend
│   ├── src/main/java/com/taskmanager/
│   │   ├── config/               # Security, JWT, CORS
│   │   ├── module/
│   │   │   ├── auth/             # User auth (register/login)
│   │   │   ├── project/          # Project CRUD + members
│   │   │   ├── task/             # Task CRUD + status
│   │   │   └── collaboration/    # Comments + history
│   │   └── common/               # ApiResponse, exception handler
│   └── src/main/resources/
│       ├── application.properties          # Local config
│       └── application-prod.properties     # Production config
│
└── taskmanager-frontend/         # React frontend
    ├── src/
    │   ├── api/axios.js          # Axios instance + interceptors
    │   ├── pages/                # Login, Register, Dashboard, etc.
    │   ├── services/             # API service functions
    │   └── components/           # Layout, NavBar
    ├── .env                      # Local: VITE_API_URL=http://localhost:8082
    └── .env.production           # Prod: VITE_API_URL=https://...railway.app
```

---

## ⚙️ Local Development Setup

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL running locally

### 1. Backend Setup

```bash
cd taskmanager
```

Create a MySQL database:
```sql
CREATE DATABASE task_manager_db;
```

Edit `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/task_manager_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update

jwt.secret=mysupersecretkeymysupersecretkey123
jwt.expiration=86400000

server.port=8082
```

Run the backend:
```bash
./mvnw spring-boot:run
```

The server starts on `http://localhost:8082`. Admin user is auto-seeded on first run.

### 2. Frontend Setup

```bash
cd taskmanager-frontend
npm install
npm run dev
```

The app opens at `http://localhost:5173`.

---

## 🚀 Production Deployment

### Backend → Railway

1. Push code to GitHub
2. Connect Railway to your GitHub repo
3. Set environment variable in Railway: `SPRING_PROFILES_ACTIVE=prod`
4. Ensure `application-prod.properties` contains:

```properties
spring.datasource.url=jdbc:mysql://<host>:<port>/railway?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=<your_password>

spring.jpa.hibernate.ddl-auto=update

# REQUIRED — without these, JWT auth will break in production
jwt.secret=mysupersecretkeymysupersecretkey123
jwt.expiration=86400000

server.port=${PORT:8080}
```

### Frontend → Vercel

1. Push frontend to GitHub
2. Import project in Vercel
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Ensure `.env.production` has:

```
VITE_API_URL=https://your-railway-app.up.railway.app
```

---

## 🔐 Authentication

- JWT-based stateless authentication
- Token stored in `localStorage`
- Axios interceptor attaches `Authorization: Bearer <token>` on every request
- On 401, user is redirected to `/login`
- Two roles: `ADMIN` and `MEMBER`
- Admin user is seeded automatically on backend startup

---

## 🌐 CORS Configuration

The backend explicitly allows the Vercel frontend origin. This is configured in `CorsConfig.java`:

```java
config.setAllowedOrigins(List.of(
    "https://task-manager-ten-tau-65.vercel.app"
));
```

**Important:** If you redeploy to a new Vercel URL, update this list and redeploy the backend.

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/profile` | Get current user |
| GET | `/api/auth/users/{id}` | Get user by ID |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/{id}` | Get project |
| PUT | `/api/projects/{id}` | Update project |
| DELETE | `/api/projects/{id}` | Delete project |
| POST | `/api/projects/{id}/members/{userId}` | Add member |
| DELETE | `/api/projects/{id}/members/{userId}` | Remove member |
| GET | `/api/projects/{id}/members` | List members |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/project/{projectId}` | Tasks by project |
| GET | `/api/tasks/my/{userId}` | Tasks assigned to user |
| GET | `/api/tasks/overdue` | Overdue tasks |
| PATCH | `/api/tasks/{id}/status?status=X` | Update status |
| PUT | `/api/tasks/{id}` | Full task update |
| DELETE | `/api/tasks/{id}` | Delete task |

### Collaboration
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/collaboration/comments` | Add comment |
| GET | `/api/collaboration/comments/{taskId}` | Get comments |
| GET | `/api/collaboration/history/{taskId}` | Get change history |

---

## 🐛 Common Issues & Fixes

### CORS Error in production
**Symptom:** `No 'Access-Control-Allow-Origin' header` in browser console

**Fix:**
1. Verify `CorsConfig.java` has the exact Vercel URL (no trailing slash)
2. Ensure `application-prod.properties` has `jwt.secret` and `jwt.expiration` set
3. Confirm `SPRING_PROFILES_ACTIVE=prod` is set in Railway environment variables
4. After changes, redeploy the backend

### "Invalid email or password" despite correct credentials
**Symptom:** Login form shows error, CORS error visible in console

**Fix:** This is actually a CORS error masking as a login error. Fix the CORS issue above — the request never reaches the backend.

### JWT errors in production
**Symptom:** All requests return 401 even with a valid token

**Fix:** Add `jwt.secret` and `jwt.expiration` to `application-prod.properties`. These properties are NOT inherited from `application.properties` when running with `prod` profile.

---

## 📦 Build for Production

### Backend
```bash
cd taskmanager
./mvnw clean package -DskipTests
# Output: target/taskmanager-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
cd taskmanager-frontend
npm run build
# Output: dist/
```

---

## 👤 Author

Built by **Yash Uppal**