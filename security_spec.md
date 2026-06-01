# Firestore Security Specification & Vulnerability Test Cases

This document describes the security strategy, data invariants, and adversarial "Dirty Dozen" payloads modeled to verify our zero-trust security posture for MB Digital's Firestore.

---

## 1. Core Data Invariants

### Contacts Collection
* **Public Create Allowed**: Prospective clients must be able to submit inquiries freely without manual pre-authentication.
* **Exact Schema Requirements**: Creation requires exactly 6 keys: `name`, `email`, `phone`, `services`, `message`, and `createdAt`. No ghost fields or shadow properties are permitted.
* **Server-bound Timestamping**: `createdAt` must strictly equal `request.time`. Client-side backdating or postdating is rejected.
* **Size Restrictions**: To prevent "Denial of Wallet" resource exhaustion:
  * `name`: string, `1-256` chars.
  * `email`: string, `1-256` chars, matching a regular email structural pattern.
  * `phone`: string, `0-30` chars.
  * `message`: string, `1-5000` chars.
  * `services`: list containing `1-10` items; each list element must be a string.
* **Zero Client Leak (Admin Restriction)**: Reading (`get`, `list`), updating, or deleting contact submissions is strictly forbidden to general users and anonymous connections. Only the authenticated admin user `mb@mbdigital.com.ng` with a verified email state can interact.

### Subscribers Collection
* **Public Create Allowed**: Public users are allowed to subscribe to newsletters.
* **Exact Schema Requirements**: Creation requires exactly 3 keys: `email`, `createdAt`, `status` (must be `'active'`).
* **Attributes**:
  * `email`: string, `1-255` chars.
  * `createdAt`: strictly equal to `request.time`.
  * `status`: string, strictly equal to `'active'`.
* **Zero Client Leak**: Only the verified admin can fetch the subscriber list or edit/delete subscribers.

---

## 2. The "Dirty Dozen" Threat Payloads

The following malicious write or read configurations are designed to bypass the rules. Each is rejected.

### DB Write Threats (Contacts / Subscribers)

#### Payload 1: Admin Privilege Spoof Attack (Admin Claim Injection)
* **Goal**: Write a contact with an injected `role: "admin"` or `isAdmin: true` attribute, or read from them.
* **Payload**:
  ```json
  { "name": "Hack", "email": "evil@evil.com", "services": ["branding"], "message": "Hi", "phone": "", "role": "admin", "createdAt": "SERVER_TIMESTAMP" }
  ```
* **Failure Gate**: Rejected by size and key count gates (`incoming().keys().size() == 6` and `hasAll(['name', 'email', 'phone', 'services', 'message', 'createdAt'])`).

#### Payload 2: Admin Email Spoofing with Unverified Email Auth
* **Goal**: Read/write as authenticated user using `mb@mbdigital.com.ng` but with `email_verified == false`.
* **Symptom**: Bypass rules that check only `request.auth.token.email`.
* **Failure Gate**: The check `request.auth.token.email_verified == true` restricts access.

#### Payload 3: Denial of Wallet - Message Size Poisoning
* **Goal**: Inject a massive 15MB string into the message text to deplete storage quotas.
* **Payload**:
  ```json
  { "name": "Spam", "email": "spam@spam.com", "services": ["web"], "message": "...[15MB of characters]...", "phone": "", "createdAt": "SERVER_TIMESTAMP" }
  ```
* **Failure Gate**: Bound limit `.size() <= 5000` on message field checks.

#### Payload 4: Arbitrary ID Path Poisoning
* **Goal**: Write a contact document with a massive 2KB junk key ID to bloat the Firestore index size.
* **Document ID**: `contacts/SOME_MASSIVE_HEX_JUNK_AND_UTF8_SYMBOLS_REPEATED`
* **Failure Gate**: Check `isValidId(contactId)` limits ID format and limits size to `<= 128`.

#### Payload 5: Missing Required Fields / Integrity Violation
* **Goal**: Submit a lead with missing services array or missing contact email.
* **Payload**:
  ```json
  { "name": "Incomplete", "phone": "", "message": "hello", "createdAt": "SERVER_TIMESTAMP" }
  ```
* **Failure Gate**: Blocked by `hasAll` and key size constraints.

#### Payload 6: Temporal Integrity Violation (Backdating Leads)
* **Goal**: Backdate submission for false urgency using client stamp.
* **Payload**:
  ```json
  { "name": "Backdater", "email": "b@b.com", "services": ["dev"], "message": "urg", "phone": "", "createdAt": "2019-01-01T00:00:00Z" }
  ```
* **Failure Gate**: Check `createdAt == request.time`.

#### Payload 7: Subscriber Ghost Fields Update
* **Goal**: Override a subscription with custom tags or metadata like `{ "vipLevel": 50 }`.
* **Payload**:
  ```json
  { "email": "a@a.com", "createdAt": "SERVER_TIMESTAMP", "status": "active", "vipLevel": 50 }
  ```
* **Failure Gate**: Enforced key count of exactly 3 for subscriber creation.

#### Payload 8: Services Injection
* **Goal**: Inject integers into the `services` selector array.
* **Payload**:
  ```json
  { "name": "Service Injector", "email": "s@s.com", "services": [999, "branding"], "message": "Hi", "phone": "", "createdAt": "SERVER_TIMESTAMP" }
  ```
* **Failure Gate**: Checked list element types via `data.services[0] is string`.

### DB Read & Query Scraped Threats

#### Payload 9: Blanket Contacts Harvesting by Authenticated Non-Admins
* **Goal**: Sign in as an ordinary user and retrieve all leads from `/contacts`.
* **Query**: `db.collection('contacts').get()`
* **Failure Gate**: Rejected because read access is locked behind `isAdmin()`.

#### Payload 10: Anonymous Read Exfiltration
* **Goal**: Read contacts anonymously without any credential token.
* **Query**: `db.collection('contacts').get()`
* **Failure Gate**: Rejected because `request.auth` is null, failing `isSignedIn()`.

#### Payload 11: General Subscriber Harvesting
* **Goal**: Access `/subscribers` list without verification.
* **Failure Gate**: Checked `isAdmin()`.

#### Payload 12: Injected Document ID Write-Over
* **Goal**: Write to a specific existing contact document ID bypassing security state limits.
* **Failure Gate**: Writes are write-once or locked to Admin update permissions.

---

## 3. Test Runner Design

The rules are validated through Unit Tests using the Firebase Local Emulator with rules verification structure:

### Test Outline (`firestore.rules.test.ts`)
```typescript
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "gen-lang-client-0989148062",
    firestore: {
      rules: require("fs").readFileSync("firestore.rules", "utf8"),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

test("Anonymous user cannot read contacts", async () => {
  const unauthDb = testEnv.unauthenticatedContext().firestore();
  await assertFails(unauthDb.collection("contacts").get());
});

test("Public user can submit valid contact inquiry", async () => {
  const unauthDb = testEnv.unauthenticatedContext().firestore();
  await assertSucceeds(
    unauthDb.collection("contacts").doc("valid_id").set({
      name: "Prospective Client",
      email: "client@agency.com",
      phone: "+234800000000",
      services: ["branding"],
      message: "We need a new corporate rebranding strategy.",
      createdAt: unauthDb.FieldValue.serverTimestamp(),
    })
  );
});

test("Unverified Admin email cannot read contacts", async () => {
  const fakeAdminDb = testEnv
    .authenticatedContext("fake_admin", {
      email: "mb@mbdigital.com.ng",
      email_verified: false,
    })
    .firestore();
  await assertFails(fakeAdminDb.collection("contacts").get());
});

test("Verified Admin email can read contacts", async () => {
  const realAdminDb = testEnv
    .authenticatedContext("real_admin", {
      email: "mb@mbdigital.com.ng",
      email_verified: true,
    })
    .firestore();
  await assertSucceeds(realAdminDb.collection("contacts").get());
});
```
