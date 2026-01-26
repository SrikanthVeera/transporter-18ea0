# Backend Architecture: OTP-Only Authentication (Ola Cabs Style)

**Role:** Senior Backend Engineer
**Context:** Ride-Hailing App (Node.js / MySQL)
**Core Principle:** No Passwords. No Signup Screens. Identity is Mobile Number.

---

## 1️⃣ OTP-ONLY AUTHENTICATION FLOW

In this model, "Sign Up" and "Log in" are the **same action**.

### **The Logic Flow**

1.  **Request:** User inputs Phone Number.
2.  **Send:** Backend connects to SMS Gateway / Firebase.
3.  **Verify:** User inputs code.
4.  **Decision Point (Critical):**
    *   **Case A (New User):** Mobile number does *not* exist in DB -> **INSERT** new user record -> Generate Token -> Return Success.
    *   **Case B (Existing User):** Mobile number *exists* in DB -> **FETCH** user details -> Generate Token -> Return Success.
5.  **Session:** Return a standard **JWT (JSON Web Token)**. This token is the "key" to the app.

### **Token Strategy**

*   **Access Token (JWT):** Short-lived (e.g., 1 hour). Contains `userId` and `role`. Sent in Headers (`Authorization: Bearer <token>`).
*   **Refresh Token:** Long-lived (e.g., 30 days). Stored securely (HttpOnly Cookie or Secure Storage). Used to silently get a new Access Token.

---

## 2️⃣ NO LOGIN / NO PASSWORD RULE

### **Why this works**
Authentication is simply "Proving who you are".
*   **Password Model:** proof is "I know a secret string".
*   **OTP Model:** proof is "I possess the SIM card linked to this number".

For a mobile-first app, possession of the device/SIM is a stronger and lower-friction proof than a password.

### **Session Persistence (The "Remember Me" aspect)**
*   **Ola/Uber Behavior:** Once verified, the app stores the **Refresh Token** in the device's Keychain/Keystore.
*   **App Restart:** The app sends the Refresh Token to the backend to check validity. If valid, the user goes straight to the Home Screen.
*   **Re-Auth Trigger:** OTP is asked **only** if:
    1.  User explicitly logs out.
    2.  Refresh token expires (e.g., after 30 days of inactivity).
    3.  Suspicious activity detected (IP change, new device).

---

## 3️⃣ BACKEND API ENDPOINTS specification

### **Endpoint A: Send OTP**
`POST /api/auth/send-otp`

*   **Responsibility:** Validate number format, check rate limits, trigger SMS.
*   **Request Body:**
    ```json
    {
      "countryCode": "+91",
      "mobile": "9999999999",
      "deviceId": "android-uuid-123" // For abuse tracking
    }
    ```
*   **Backend Logic:**
    1.  Validate inputs.
    2.  Check **Rate Limit** (e.g., Max 3 requests/10 min for this IP/Number).
    3.  Generate 6-digit Random Int (if using Twilio/SMS Gateway).
    4.  **Hash** the OTP (SHA256/Bcrypt) + Expiry (NOW + 5 mins).
    5.  **Upsert** into `otp_logs` table (don't store plain text OTP).
    6.  Call SMS Provider API.
    7.  Return `200 OK` (Message: "OTP Sent").

### **Endpoint B: Verify OTP & "Auto-Login"**
`POST /api/auth/verify-otp`

*   **Responsibility:** Validate code, Create/Retreive User, Issue Token.
*   **Request Body:**
    ```json
    {
      "mobile": "9999999999",
      "otp": "123456", // OR "firebaseIdToken" if using Firebase
      "fcmToken": "xyz..." // For Push Notifications
    }
    ```
*   **Backend Logic:**
    1.  **Retrieve:** Look up hashed OTP from DB for this mobile.
    2.  **Validate:** Check Expiry. Compare `hash(inputOTP)` vs `storedHash`.
    3.  **Atomic User Check:**
        *   `SELECT * FROM users WHERE mobile = ?`
        *   **If NULL:** `INSERT INTO users (mobile, created_at) VALUES (...)`. Get new `userId`.
        *   **If EXISTS:** Get existing `userId`.
    4.  **Clean Up:** Delete used OTP record (prevent replay attacks).
    5.  **Issue Token:** Sign JWT: `{ uid: userId, role: 'customer' }`.
    6.  **Response:**
        ```json
        {
          "token": "eyJhbGci...",
          "user": { "id": 101, "name": null, "isNewUser": true }
        }
        ```

### **Endpoint C: Get Current User**
`GET /api/user/me`

*   **Responsibility:** Load profile data based on Token.
*   **Header:** `Authorization: Bearer <jwt_token>`
*   **Backend Logic:**
    1.  Middleware verifies JWT signature.
    2.  Extracts `userId`.
    3.  Queries DB for full profile (Name, Email, saved addresses).
    4.  Returns user object.

---

## 4️⃣ SECURITY (MANDATORY PRODUCTION RULES)

### **A. OTP Lifecycle**
*   **Short Expiry:** OTPs must expire in **3-5 minutes**.
*   **One-Time Use:** Once verified, delete it immediately.
*   **Scope:** An OTP generated for "Login" cannot be used for "Withdraw Money". Bind OTPs to a `scope` or `action` in the DB.

### **B. Rate Limiting (Anti-SMS Bombing)**
You are paying for every SMS. Attackers will try to bankrupt you.
*   **Rule:** Limit to 3 OTPs per number per 15 minutes.
*   **Implementation:** Use Redis or a simple DB table `otp_attempts`.
    *   `key`: `rate_limit:${mobile}`
    *   `value`: count
    *   `ttl`: 900 seconds (15 mins)

### **C. Secure Storage**
*   **NEVER** store OTPs in plain text in the database.
*   If an attacker dumps your DB, they shouldn't be able to log in as anyone.
*   **Always Hash:** Store `bcrypt(otp)` or `sha256(otp + salt)`. (Not applicable if using Firebase, as Google handles this).

### **D. Device Binding (Advanced)**
*   Send `deviceId` with requests.
*   If a user switches devices frequently (e.g., 5 devices in 1 day), flag account for review.

---

## 5️⃣ DATABASE SCHEMA (Simplified)

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mobile VARCHAR(15) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE otp_logs (
    mobile VARCHAR(15) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    attempts INT DEFAULT 0,
    PRIMARY KEY (mobile) -- Ensures only 1 active OTP per user
);
```       .env file
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=srikanth12345
DB_NAME=transporter_app
PORT=5000


JWT_SECRET=someVeryStrongRandomSecret123