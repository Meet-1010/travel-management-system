# 📚 Travel Management System — Project Audit Document

> **Living document** updated as each component is built.  
> This explains *what was created*, *why it exists*, and *what role it plays*.

---

## ✅ BUILD STATUS: COMPLETE (Phase 1–4)

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1: Database | ✅ Done | MySQL schema + seed data |
| Phase 2: Backend APIs | ✅ Done | Spring Boot REST API |
| Phase 3: Workflow Engine | ✅ Done | Multi-level approval logic |
| Phase 4: Frontend UI | ✅ Done | Angular 18 app (builds successfully) |
| Phase 5: Integration | ⏳ Pending | Connect frontend to live backend |
| Phase 6: Advanced Features | ⏳ Future | AI validation, notifications |
| Phase 7: Testing & Deployment | ⏳ Future | Unit tests, production build |

---

## 🗃️ DATABASE (`database/schema.sql`)

| Table | Purpose |
|-------|---------|
| `users` | All system users: Admin, Employee, Manager, Finance |
| `travel_requests` | Core entity — a request from submission to approval |
| `approvals` | Approval/rejection records (Level 1 = Manager, Level 2 = Finance) |
| `expenses` | Expense items linked to approved requests |
| `itinerary_segments` | Individual travel segments (flights, hotels) |
| `policies` | Travel policy rules (max budget, allowed class) |
| `reimbursements` | Tracks reimbursement status |
| `audit_logs` | **Immutable** record of every action in the system |

**Seed Users** (All password: `admin123`):

| Email | Role |
|-------|------|
| admin@tms.com | ADMIN |
| john@tms.com | EMPLOYEE |
| manager@tms.com | MANAGER |
| finance@tms.com | FINANCE |

---

## ⚙️ BACKEND (`backend/`)

### Technology Stack
- **Java 21** + **Spring Boot 3.2.5**
- **Spring Security** + **JWT** for auth
- **Spring Data JPA** + **Hibernate** for database
- **MySQL** driver
- **Lombok** for less boilerplate
- **Bean Validation** for input validation

### Package Structure

```
com.tms/
├── TravelManagementSystemApplication.java   ← Entry point
├── model/           ← JPA Entities (map to DB tables)
├── repository/      ← Spring Data JPA (auto-generates SQL)
├── service/         ← Business logic layer
├── controller/      ← REST API endpoints
├── dto/
│   ├── request/     ← What the client SENDS to us
│   └── response/    ← What we SEND back to the client
├── security/        ← JWT token handling
├── config/          ← Spring Security config, CORS, UserDetailsService
└── exception/       ← Global error handling
```

---

### Model Layer (Entities)

| File | Maps to Table | Key Notes |
|------|--------------|-----------|
| `User.java` | `users` | Has `Role` enum (ADMIN/EMPLOYEE/MANAGER/FINANCE) |
| `TravelRequest.java` | `travel_requests` | Has `Status` enum for workflow state machine |
| `Approval.java` | `approvals` | Level 1=Manager, Level 2=Finance |
| `Expense.java` | `expenses` | Category: food/travel/stay/misc |
| `Policy.java` | `policies` | Budget limits and allowed class |
| `AuditLog.java` | `audit_logs` | Immutable, auto-created by services |

**Concept for beginners:** `@Entity` tells Hibernate "this class is a database table". `@Id @GeneratedValue` makes the ID auto-increment. `@ManyToOne` creates a foreign key relationship.

---

### Repository Layer

| File | Key Methods | Why |
|------|-------------|-----|
| `UserRepository` | `findByEmail()`, `findByRole()` | Login lookup, admin listing |
| `TravelRequestRepository` | `findByUserId()`, `findByStatus()`, custom JPQL | Workflow filtering |
| `ApprovalRepository` | `findByTravelRequestIdAndLevel()` | Prevent duplicate approvals |
| `ExpenseRepository` | `sumAmountByRequestId()` | Real-time expense total |
| `AuditLogRepository` | `findAllByOrderByTimestampDesc()` | Admin audit panel |

**Concept:** Spring Data JPA auto-generates SQL from method names. `findByEmail(String email)` becomes `SELECT * FROM users WHERE email = ?`. No SQL needed!

---

### Security Layer

| File | Role |
|------|------|
| `JwtUtil.java` | Generates JWTs on login, validates tokens on requests |
| `JwtAuthFilter.java` | Runs on EVERY request; extracts JWT from `Authorization` header |
| `SecurityConfig.java` | Defines which endpoints are public vs protected by role |
| `CustomUserDetailsService.java` | Bridges our `UserRepository` with Spring Security |

**JWT Flow:**
```
1. POST /api/auth/login  →  Returns JWT token
2. Client stores token in localStorage
3. Every API call: Authorization: Bearer <token>
4. JwtAuthFilter validates → sets user in SecurityContext
5. @PreAuthorize checks role → allow or deny
```

---

### Service Layer (Business Logic)

| Service | Responsibilities |
|---------|-----------------|
| `AuthService` | Login, register, generate JWT, audit log login |
| `TravelRequestService` | Create/submit requests, policy enforcement, status workflow |
| `ApprovalService` | Multi-level approval workflow state machine |
| `ExpenseService` | Add/view expenses, validate against APPROVED status |
| `ReportingService` | Dashboard stats, department spend aggregation, audit log access |

**Workflow logic in `ApprovalService`:**
```
Manager role  → Level 1 → requires SUBMITTED  → sets MANAGER_APPROVED
Finance role  → Level 2 → requires MANAGER_APPROVED → sets APPROVED
Rejection at any level → sets REJECTED
```

---

### API Reference

```http
POST   /api/auth/login                  → Login, returns JWT
POST   /api/auth/register               → Create user (ADMIN only)
GET    /api/auth/users                  → List users (ADMIN only)

POST   /api/requests                    → Create request (EMPLOYEE)
GET    /api/requests/{id}               → Get request by ID
GET    /api/requests/my                 → My own requests (EMPLOYEE)
POST   /api/requests/{id}/submit        → Submit draft (EMPLOYEE)
GET    /api/requests/pending/manager    → Submitted requests (MANAGER)
GET    /api/requests/pending/finance    → Manager-approved (FINANCE)
GET    /api/requests/all                → All requests (ADMIN)

POST   /api/approve                     → Approve/Reject (MANAGER or FINANCE)

POST   /api/expenses                    → Add expense (EMPLOYEE)
GET    /api/expenses/{requestId}        → List expenses
GET    /api/expenses/{requestId}/total  → Total amount

GET    /api/reports/dashboard           → Stats counts
GET    /api/reports/department-spend    → Spend by department
GET    /api/reports/audit-logs          → Full audit trail (ADMIN)
GET    /api/reports/employee/{id}       → Employee travel history
```

---

## 🌐 FRONTEND (`frontend/tms-frontend/`)

### Architecture

```
src/app/
├── models/               ← TypeScript interfaces (match Java DTOs)
├── services/             ← API communication layer
├── interceptors/         ← Auto-adds Bearer token to requests
├── guards/               ← Route protection by auth + role
├── components/navbar/    ← Role-aware sidebar navigation
└── pages/                ← 7 route-level page components
    ├── login/
    ├── dashboard/
    ├── travel-requests/
    ├── travel-request-form/
    ├── approval-panel/
    ├── expenses/
    ├── reports/
    └── user-management/
```

### Key Concepts

| Concept | Used For |
|---------|---------|
| `BehaviorSubject` | Reactive current user state |
| `HttpInterceptor` | Auto-attach JWT to every request |
| `CanActivateFn` guard | Redirect unauthenticated/wrong-role users |
| Lazy loading | Only loads JS for the page being visited |
| CSS Custom Properties | Design tokens throughout all components |

---

## 🚀 HOW TO RUN

### Step 1: Database
```bash
mysql -u root -p < database/schema.sql
```

### Step 2: Configure Backend
Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

### Step 3: Start Backend
```bash
cd backend
mvn spring-boot:run
# API on http://localhost:8080
```

### Step 4: Start Frontend
```bash
cd frontend/tms-frontend
ng serve
# UI on http://localhost:4200
```

### Demo Credentials (password: `admin123` for all)
| Email | Role |
|-------|------|
| admin@tms.com | Admin |
| john@tms.com | Employee |
| manager@tms.com | Manager |
| finance@tms.com | Finance |

---

## 🔄 END-TO-END WORKFLOW

1. **Employee** logs in → Creates travel request → Submits
2. **Manager** logs in → Approval Panel → Approves with comment
3. **Finance** logs in → Approval Panel → Final Approve
4. **Employee** logs in → Request is APPROVED → Adds expenses
5. **Admin** → Reports → Stats, department spend, audit logs

---

## 🔐 SECURITY SUMMARY

| Layer | Mechanism |
|-------|-----------|
| Passwords | BCrypt hashed (10 rounds) |
| Authentication | JWT tokens (24h expiry, HS256) |
| Authorization | `@PreAuthorize` + Angular route guards |
| CORS | Restricted to `localhost:4200` |
| Input Validation | `@Valid` + Bean Validation on all DTOs |
| Audit Trail | Every action logged to `audit_logs` table |

---

*Last updated: Phase 4 complete — Angular build verified with zero errors.*
