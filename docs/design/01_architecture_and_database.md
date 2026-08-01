# Architecture and Database Design Document (`01_architecture_and_database.md`)

## 1. Overview
This design document details the overarching technical architecture, global state management, Firebase Cloud Firestore schema, and cross-cutting utility helpers for the **myTenant** mobile application.

---

## 2. System Architecture & Component Hierarchy

The application follows a layered React Native architecture:

```
+-----------------------------------------------------------------------+
|                            PRESENTATION LAYER                         |
|  [Navigation Container] -> [AppRoute / AuthRoute Stack]              |
|  Screens: Login, SignUp, Home, MyTenant, RoomDetails, Breakdown, etc. |
|  UI Framework: React Native Paper (MD3), React Native Vector Icons     |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                            STATE & LOGIC LAYER                        |
|  Redux Toolkit Store (`MainStore.js`)                                  |
|  - AuthSlice (`userProfile`, `userRooms`, `selectedRoom`, etc.)       |
|  - LoaderSlice (`isLoading`)                                           |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                            SERVICE & UTILITY LAYER                    |
|  - `Collections.js`: Firestore CRUD operations & Redux dispatches     |
|  - `cloudinaryHelper.js`: Image upload via REST multipart requests    |
|  - `localStorage.js`: AsyncNative storage for UID auth persistence    |
|  - `helperFunction.js`: Toast notifications, dialer, text formatters  |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                            CLOUD / EXTERNAL SERVICES                  |
|  - Firebase Auth (Email/Password & Google OAuth)                      |
|  - Google Cloud Firestore (NoSQL document database)                    |
|  - Cloudinary Cloud Storage (Proof image hosting)                     |
|  - WhatsApp / SMS / Android Intent API                                |
+-----------------------------------------------------------------------+
```

---

## 3. Database Schema (Firebase Cloud Firestore)

The application structures data hierarchically within Cloud Firestore using nested subcollections scoped under individual landlord user accounts.

```
users (Collection)
 └── {uid} (Document: Landlord Profile)
      ├── email: string
      ├── name: string
      ├── phone: string
      ├── upi: string
      ├── picture: string
      └── rooms (Subcollection)
           └── {roomId} (Document: Room Details)
                ├── roomName: string
                ├── roomNo: string
                ├── rent: string
                ├── advance: string
                ├── perUnit: string
                ├── startReading: string
                ├── currentTenantId: string
                ├── tenetName: string
                ├── startDate: string
                ├── createdAt: timestamp
                └── Tenants (Subcollection)
                     └── {tenantId} (Document: Tenant Information)
                          ├── name: string
                          ├── phone: string
                          ├── aadharNo: string
                          ├── startDate: string ("DD-MMMM-YYYY")
                          ├── lastPaidDate: timestamp
                          ├── lastPaidAmount: number
                          ├── createdAt: timestamp
                          ├── otherMembers: Array<Member>
                          │    ├── name: string
                          │    ├── phone: string
                          │    └── aadharNo: string
                          └── record (Subcollection)
                               └── {recordId} (Document: Monthly Bill Record)
                                    ├── currentReading: string
                                    ├── previousReading: number
                                    ├── totalUnitBurned: number
                                    ├── perUnit: number
                                    ├── totalAmount: number (Electricity Total)
                                    ├── image: string (Cloudinary URL)
                                    ├── note: string
                                    ├── paidStatus: boolean
                                    ├── paidAmount: number
                                    ├── pendingAmount: number
                                    ├── partialPaid: boolean
                                    ├── createdAt: timestamp
                                    └── updatedAt: serverTimestamp
```

---

## 4. Redux Store Design (`Src/Store/MainStore.js`)

State is managed globally using **Redux Toolkit** with typed selector wrappers (`useAppDispatch`, `useTypedSelector`).

### 4.1 Slices Overview

#### A. AuthSlice (`Src/Store/Slices/AuthSlice.js`)
State Structure:
```ts
interface AuthState {
  authToken: string | null;
  userProfile: LandlordUser | null;
  userRooms: Room[];
  selectedRoom: Room | null;
  roomTenants: Tenant[];
  selectedTenant: Tenant | null;
  roomTenantRecords: BillRecord[];
  homeData: AggregatedRoomData[];
}
```

Key Redux Actions:
- `setAuthToken(token)`: Updates session authentication token.
- `setUserProfile(user)`: Stores logged-in landlord profile.
- `setUserRooms(rooms)`: Stores landlord's rooms sorted by timestamp.
- `setSelectedRoom(room)`: Sets active room context for room details.
- `setRoomTenants(tenants)`: Sets tenant list for the selected room.
- `setSelectedTenant(tenant)`: Sets active tenant context for billing details.
- `setRoomTenantRecords(records)`: Stores monthly bill records for selected tenant.
- `setHomeData(data)`: Updates consolidated home dashboard summary calculations.
- `resetAuthSlice()`: Clears state on logout.

#### B. LoaderSlice (`Src/Store/Slices/LoaderSlice.js`)
State Structure:
```ts
interface LoaderState {
  loading: boolean;
}
```

---

## 5. Third-Party Integrations & Utilities

### 5.1 Cloudinary Helper (`Src/Utils/cloudinaryHelper.js`)
Handles asynchronous photo upload for physical electricity meters:
- Target Cloudinary Cloud Name: `dph3i2y30`
- Preset: `unsigned` preset `mytenant`
- Function `uploadToCloudinary(file)` posts multipart image payloads and returns hosted secure URL.

### 5.2 Local Storage Helper (`Src/Utils/Resource/localStorage.js`)
Wraps `@react-native-async-storage/async-storage`:
- `storeToken(token)`: Persists user UID.
- `getToken()`: Retrieves stored UID on splash launch.
- `clearLocalStorage()`: Flushes storage keys on user sign-out.

### 5.3 Helper Functions (`Src/Utils/helperFunction.js`)
- `showError(message)`: Displays red floating alert banner (`react-native-flash-message`).
- `showSuccess(message)`: Displays green success floating alert banner.
- `onOpenDialer(phone)`: Launches `Linking.openURL('tel:${phone}')`.
- `sendWhatsAppMessage(msg, phone)`: Opens WhatsApp intent with encoded URI payload.
- `onSendSMSMessage(msg, phone)`: Launches `Linking.openURL('sms:${phone}?body=${msg}')`.
