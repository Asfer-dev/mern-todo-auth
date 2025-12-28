# E2E Tests with Selenium

This directory contains end-to-end tests for the MERN Todo application using Selenium WebDriver and Mocha.

## Test Coverage

The test suite verifies:

1. ✅ Health endpoint returns `{ok: true}`
2. ✅ Login page loads correctly
3. ✅ Empty login form shows validation errors
4. ✅ Invalid credentials show error messages
5. ✅ Valid login (test@gmail.com/test123) redirects to dashboard
6. ✅ Dashboard has search input and priority filter
7. ✅ "New note" button opens modal
8. ✅ Logout returns user to login page
9. ✅ Dashboard is protected after logout
10. ✅ Unauthorized API access returns 401/403

## Prerequisites

- Docker and Docker Compose installed
- Test user must exist: `test@gmail.com` with password `test123`

## Running Tests

### Option 1: Using Docker Compose (Recommended)

Run the entire E2E test stack:

```bash
docker compose --profile e2e up --abort-on-container-exit
```

This will:

- Start MongoDB (mongo_e2e)
- Start backend API (backend_e2e) on port 5200
- Start frontend (frontend_e2e) on port 8080
- Start Selenium Chrome standalone on port 4444
- Run the E2E tests (e2e-tests container)

To clean up:

```bash
docker compose --profile e2e down
```

### Option 2: Local Development

If you want to run tests locally against running services:

1. Install dependencies:

```bash
npm install
```

2. Set environment variables:

```bash
export APP_URL=http://localhost:8080
export SELENIUM_REMOTE_URL=http://localhost:4444/wd/hub
```

3. Run tests:

```bash
npm run test:e2e
```

## Environment Variables

- `APP_URL` - URL of the frontend application (default: `http://frontend_e2e`)
- `SELENIUM_REMOTE_URL` - URL of Selenium Grid hub (default: `http://selenium:4444/wd/hub`)

## Test User

The tests expect a user account to exist with:

- **Email**: `test@gmail.com`
- **Password**: `test123`

You must create this user before running tests (can be done via the registration page).

## Debugging

To watch tests running in real-time:

1. Access the Selenium VNC viewer at `http://localhost:7900` (password: `secret`)
2. The tests run in headless mode but you can see the browser through VNC

## Test Structure

```
tests/e2e/
├── Dockerfile          # Container definition for test runner
├── package.json        # Test dependencies (mocha, chai, selenium-webdriver)
├── package-lock.json   # Locked dependency versions
└── test/
    └── app.e2e.spec.js # Main test suite
```

## Dependencies

- `mocha` - Test framework
- `chai` - Assertion library
- `selenium-webdriver` - Browser automation
- `wait-on` - Wait for services to be ready before running tests
