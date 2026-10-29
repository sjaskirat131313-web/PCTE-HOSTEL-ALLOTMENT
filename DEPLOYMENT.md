# PCTE Hostel Room Allotment Portal — Deployment & Architecture Guide

**BCA College Capstone Project**  
*Academic Year: 2025–2026*  
*Notice: This system is an academic college project demonstration and is not an official PCTE service unless formally authorized.*

---

## 1. Project Overview & Architecture
The **PCTE Hostel Room Allotment Portal** is a full-stack college residential management system designed to streamline room allocation, manage student accommodation applications, and provide transparent vacancy tracking.

### Key Functional Capabilities
- **Role-Based Access Control (RBAC):** Distinct roles for **BCA Students** and **Hostel Administrators (Wardens)** with server-enforced authentication and authorization.
- **Multi-Step Application Wizard:** 4-step verified workflow (Academic details, Hostel Wing & Sharing Preferences, Emergency Contacts & Medical Info, Anti-Ragging Undertaking).
- **Concurrency-Safe Room Allotment:** Mutex-backed transactional logic prevents overbooking; two students cannot be allotted the same final bed simultaneously.
- **Room Switching Engine:** Students can browse eligible alternative rooms and submit transfer requests; administrators approve/reject moves with atomic bed occupancy updates.
- **Administrator Console:** Live room inventory management, occupancy analytics, one-click **Smart Auto-Allotment**, maintenance mode toggling, student registry, CSV exports, and audit logs.

---

## 2. Default Test / Evaluator Accounts

| Role | Email | Password | Details |
|---|---|---|---|
| **Hostel Administrator** | `admin@pcte.edu.in` | `Admin@12345` | Chief Warden Dr. R. K. Sharma (Full administrative privileges) |
| **Student (Allotted)** | `arjun.sharma@pcte.edu.in` | `Student@12345` | BCA 3rd Year • Allotted Room A-204 (Bed 1) |
| **Student (Allotted)** | `simran.kaur@pcte.edu.in` | `Student@12345` | BCA 3rd Year • Allotted Room C-102 (Bed 2) • Pending switch request |
| **Student (Pending App)** | `priya.verma@pcte.edu.in` | `Student@12345` | BCA 2nd Year • Submitted App `PCTE-2026-APP-1021` |
| **New Student (Fresh)** | `rohan.mehta@pcte.edu.in` | `Student@12345` | BCA 1st Year • Not applied yet |

*Administrator Registration Key:* `PCTE@ADMIN2026` (used when creating a new admin account via Sign Up).

---

## 3. Online Deployment Instructions

### A. AI Studio & Google Cloud Run (Recommended)
1. **Live Development URL:** The applet runs on Google Cloud Run via AI Studio.
2. **Build and Serve:**
   - Development: `npm run dev` (Port 3000)
   - Production Build: `npm run build`
   - Production Start: `npm run start` (Starts `tsx server.ts` on `$PORT`)
3. **Environment Configuration:**
   - `PORT`: Automatically set by Cloud Run (default: 3000)
   - `ADMIN_REGISTRATION_KEY`: `PCTE@ADMIN2026`

### B. Suggested Custom Subdomain
- Suggested AI Studio Subdomain: `pcte-hostel-portal.ai.studio` or `pcte-hostel.ai.studio`
- Custom College Domain Mapping (e.g., `hostel.pcte.edu.in`):
  1. Add a **CNAME** DNS record pointing `hostel.pcte.edu.in` to your Cloud Run service URL or custom domain mapping in Google Cloud Console.
  2. Google Cloud automatically provisions a managed TLS/HTTPS certificate.

### C. Manual Steps & Permissions
- Database persistence is managed via concurrency-safe atomic disk storage under `./data/hostel_db.json`.
- No paid third-party subscriptions or external API keys are strictly required for baseline hostel management operations.
