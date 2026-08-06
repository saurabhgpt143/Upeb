# Security Specification

## 1. Data Invariants
1. A Project document must contain a valid `userId` matching the authenticated user (`request.auth.uid`).
2. Users can only read, update, or delete projects where `resource.data.userId == request.auth.uid`.
3. User profile document path `{userId}` must match `request.auth.uid`.
4. Immutable fields (`userId`, `createdAt`) cannot be altered during updates.

## 2. Security Test Payloads
- Unauthenticated reads/writes to `/projects` -> DENIED
- Cross-user reads/writes to another user's project -> DENIED
- Spoofed `userId` on creation -> DENIED
- User profile modification for another UID -> DENIED
