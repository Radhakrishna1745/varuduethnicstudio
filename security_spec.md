# Firestore Security Specification

This document details the security model, invariants, "Dirty Dozen" test payloads, and test boundaries designed to protect Varudu's customer leads and appointment schedules under a Zero-Trust architecture.

## 1. Data Invariants

1. **Lead Creation (Public Submission)**:
   - Anyone can create a customer lead under `/leads/{leadId}`.
   - A newly created lead must have a `status` equal to `'New'`.
   - The document ID (`leadId`) must be valid alphanumeric and match the `id` field inside the payload to prevent ID poisoning.
   - Strict field sizes (e.g., name <= 128 characters, phone number <= 32 characters) must be enforced to guard against Denial of Wallet attacks.

2. **Appointment Booking (Public Booking)**:
   - Anyone can submit an appointment under `/appointments/{appointmentId}`.
   - Form inputs must validate types (e.g., branch is string, time is string, date is string).
   - A newly created appointment must have a `status` equal to `'Pending'`.

3. **Restricted Administrative Access**:
   - Only authenticated administrative users can list (`list`), read individual (`get`), update, or delete records in `/leads` and `/appointments`.
   - Authenticated staff IDs are verified via existence in `/admins/{uid}` or general administrator status.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following 12 payloads represent malicious attempts to bypass identity, integrity, and state transition boundaries:

### #1: Unauthenticated Guest Attempting to List All Leads
- **Intent**: Data scraping.
- **Action**: `getDocs(collection('leads'))` by guest.
- **Expected Outcome**: `PERMISSION_DENIED`

### #2: Unauthorized User Trying to Read Another Lead's Details
- **Intent**: Privilege escalation.
- **Action**: `getDoc(doc('leads', 'lead-ID-123'))` by guest.
- **Expected Outcome**: `PERMISSION_DENIED`

### #3: Spambot Injecting 500KB Name into Lead Form
- **Intent**: Denial of Wallet & database pollution.
- **Action**: `createDoc` with `name` exceeding 200 characters.
- **Expected Outcome**: `PERMISSION_DENIED`

### #4: Attackers Specifying Status as 'Converted' Directly Upon Creation
- **Intent**: State-transition bypass.
- **Action**: `createDoc` with `status: 'Converted'`.
- **Expected Outcome**: `PERMISSION_DENIED`

### #5: Malicious user submitting an invalid ID containing path injection characters
- **Intent**: ID poisoning & route pollution.
- **Action**: `doc('leads', '../../attack')` creation.
- **Expected Outcome**: `PERMISSION_DENIED`

### #6: Anonymous User Modifying Existing Lead Status to Closed
- **Intent**: Service disruption.
- **Action**: `updateDoc` setting `status: 'Closed'`.
- **Expected Outcome**: `PERMISSION_DENIED`

### #7: Modifying Immutable 'createdAt' or 'timestamp' on Update
- **Intent**: Tampering audit logs.
- **Action**: `updateDoc` changing `timestamp`.
- **Expected Outcome**: `PERMISSION_DENIED`

### #8: Spambot Injecting Boolean value for Name Field
- **Intent**: Type corruption.
- **Action**: `createDoc` with `name: true`.
- **Expected Outcome**: `PERMISSION_DENIED`

### #9: Anonymous User Attempting to List All Appointments
- **Intent**: Booking list scraping.
- **Action**: `getDocs(collection('appointments'))`.
- **Expected Outcome**: `PERMISSION_DENIED`

### #10: Attempting to Book an Appointment with status 'Confirmed'
- **Intent**: Booking state falsification.
- **Action**: `createDoc` with `status: 'Confirmed'`.
- **Expected Outcome**: `PERMISSION_DENIED`

### #11: Injecting Non-String or Malformed Types into Phone field
- **Intent**: Schema corruption.
- **Action**: `createDoc` with `phone: 12345678` (Integer).
- **Expected Outcome**: `PERMISSION_DENIED`

### #12: Malicious Deletion of Lead by Guest User
- **Intent**: Database wipeout.
- **Action**: `deleteDoc` of arbitrary lead.
- **Expected Outcome**: `PERMISSION_DENIED`

---

## 3. Test Coverage

All security configurations and actions are written to be thoroughly validated. Real-time operations reject any payload violating the type checks or state rules.
