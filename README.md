# HustleHub+ Full Stack

Secure MERN marketplace for the HustleHub+ platform. The Part 2 release adds MongoDB persistence, role-based gig and booking workflows, security controls, and a React client.

## System Overview

The API is an Express application served over HTTPS in local development. Users register with an email, password, and role. Passwords are hashed before storage, and successful registration or login returns a short-lived JWT.

```mermaid
flowchart LR
  Client[React Frontend] -->|Axios HTTPS JSON| API[Express API]
  API --> Auth[Auth routes]
  API --> Marketplace[Gig / Booking routes]
  API --> Store[(MongoDB via Mongoose)]
  Auth --> Hash[bcrypt password hashing]
  Auth --> Token[JWT signing]
  Protected --> Verify[JWT verification middleware]
```

The frontend uses JWTs stored in browser local storage and sends them through an Axios interceptor. MongoDB persists users, gigs, bookings, and transactions.

## Project Structure

```text
src/
├── config/cert/       Local HTTPS key and certificate (ignored by Git)
├── controllers/       Registration, login, and dashboard behavior
├── middleware/        Validation, authentication, and error handling
├── models/            In-memory user model
├── routes/            Express route definitions
└── utils/             Password and JWT helpers
scripts/               Local certificate generation
server.js              Express app and HTTPS entry point
```

## Security Decisions

- **Password hashing:** `bcryptjs` hashes passwords with 10 salt rounds. Plaintext passwords are never stored or returned.
- **JWT:** tokens are signed with `JWT_SECRET` and expire after one hour. Protected routes verify the signature before using token claims.
- **Input validation:** `express-validator` enforces normalized email addresses, eight-character minimum passwords, uppercase/lowercase/number/special-character requirements, and approved roles.
- **HTTPS:** a self-signed localhost certificate encrypts local traffic. It is suitable for development only; production should use a certificate issued by a trusted authority.
- **Error handling:** production responses hide stack traces and use a generic message. Development responses include the stack to aid debugging.
- **Additional controls:** Helmet security headers, CORS support, and a 10 KB JSON body limit are enabled.

## Setup

Requirements: Node.js 18 or newer.

```powershell
npm.cmd install
Copy-Item .env.example .env
npm.cmd run cert:generate
npm.cmd start
```

The API starts at `https://localhost:8443`. Because the certificate is self-signed, disable SSL certificate verification in Postman or trust the certificate in your local client. Do not commit `.env` or PEM files.

## Postman

The Postman files are in the `postman/` folder:

1. Import `HustleHub-Local.postman_environment.json`.
2. Import `HustleHub-Part1.postman_collection.json`.
3. Select the `HustleHub Local` environment in Postman.
4. Confirm the `baseUrl` variable is `https://localhost:8443`.
5. In Postman Settings, turn off SSL certificate verification for the self-signed local certificate.
6. Run `Health`, then `Register Freelancer` or `Login`, and finally `Protected Dashboard`.

Each request includes a visible Postman test script under the request's **Scripts** tab. If the collection was imported before the latest update, delete the old imported collection and import `HustleHub-Part1.postman_collection.json` again; Postman does not automatically refresh imported files.

The login and registration requests automatically save the returned JWT in the environment's `token` variable. The base URL for this local server is:

```text
https://localhost:8443
```

For development with automatic restart:

```powershell
npm.cmd run dev
```

PowerShell may block `npm.ps1` under a restrictive execution policy; `npm.cmd` works without changing that policy.

## API Endpoints

### Register

`POST /api/auth/register`

```json
{
  "email": "freelancer@example.com",
  "password": "SecurePass123!",
  "role": "freelancer"
}
```

Returns `201` with a token and public user details. Duplicate emails return `400`; invalid input returns `400` with validation errors.

### Login

`POST /api/auth/login`

```json
{
  "email": "freelancer@example.com",
  "password": "SecurePass123!"
}
```

Returns `200` with a token and public user details. Invalid credentials return `401`.

### Dashboard

`GET /api/protected/dashboard`

```text
Authorization: Bearer <token>
```

Returns `200` with the authenticated JWT claims. Missing or invalid tokens return `401`.

### Health

`GET /health` returns `{ "status": "ok" }` and is useful for a basic availability check.

## Testing

Run the automated API checks with:

```powershell
npm.cmd test
```

The tests cover registration, login, JWT-protected access, validation rejection, and missing authentication.

## Part 2 Setup

1. Install and start MongoDB locally, or create a MongoDB Atlas database.
2. Copy `.env.example` to `.env` and set `MONGO_URI` to the local or Atlas connection string. Set a long random `JWT_SECRET`.
3. Generate the local certificate with `npm.cmd run cert:generate`.
4. Start the API with `npm.cmd start`.
5. In a second terminal, run `Set-Location frontend; npm.cmd install; npm.cmd run dev`.

The frontend runs on the Vite URL shown in the terminal. Set `frontend/.env` from `frontend/.env.example` if the API URL differs from `https://localhost:8443/api`.

## Marketplace and RBAC

- Clients can browse gigs, create bookings, and view their bookings.
- Freelancers can create, update, and delete their own gigs, view incoming bookings, and view transaction earnings.
- Admins can manage gigs and view marketplace records through the protected API.
- Gigs belong to their creating freelancer; ownership is checked on update and delete.
- Booking creation records both a confirmed booking and an earning transaction.

## Security Controls

JWT authentication, bcrypt password hashing, HTTPS, Helmet CSP headers, CORS, 10 KB JSON limits, express-validator input validation, MongoDB query sanitisation, and a 10-request-per-15-minute authentication rate limit are enabled.

## Part 2 Postman

Import `postman/HustleHub-Local.postman_environment.json` and `postman/HustleHub-Part2.postman_collection.json`. Select the environment, disable SSL certificate verification for the local self-signed certificate, and run requests in order: Health, Register Freelancer, Create Gig, Register Client, Browse Gigs, Book Gig, Freelancer Bookings, Freelancer Transactions. The collection saves tokens and the gig ID automatically.

## Testing

```powershell
npm.cmd test
npm.cmd run test:jest
Set-Location frontend; npm.cmd test; npm.cmd run build
```

The backend Node test uses `mongodb-memory-server`, so it does not require a running MongoDB instance. Newman can run the prepared collection after the API and MongoDB are running:

```powershell
newman run postman/HustleHub-Part2.postman_collection.json -e postman/HustleHub-Local.postman_environment.json
```

## Submission Checklist

- [x] Dependencies and scripts configured
- [x] Environment template and Git exclusions added
- [x] HTTPS certificate generation documented and automated
- [x] MongoDB persistence and Mongoose models implemented
- [x] bcrypt password hashing implemented
- [x] JWT generation and verification implemented
- [x] Registration and login routes implemented
- [x] Input validation implemented
- [x] Global error handling implemented
- [x] Protected route implemented
- [x] Automated API tests included
- [x] README documentation included
- [x] React frontend, marketplace workflow, and frontend test included
- [x] Part 2 Postman collection included
