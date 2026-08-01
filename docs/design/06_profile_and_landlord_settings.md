# Profile and Landlord Settings Design Document (`06_profile_and_landlord_settings.md`)

## 1. Module Overview
The Profile and Landlord Settings module enables property owners to maintain key contact and payment identification details (Phone Number and UPI ID) required for automated payment requests and manages user sign-out and session teardown.

---

## 2. Screen Specifications (`Src/Screens/App/Profile.js`)

### 2.1 UI Layout & Input Controls
- **Header (`Header.js`)**: Title `"Profile"`, non-back navigation, right header button with logout icon (`logout-variant`).
- **Update Profile Form**:
  - `Name`: Outlined `TextInput` for landlord's full name.
  - `Phone no.`: Outlined numeric `TextInput` with Indian mobile number regex validation.
  - `UPI address`: Outlined `TextInput` for payment handle (e.g., `landlord@upi` or `9876543210@paytm`).
  - `Save` Button: Submits form values and triggers `updateUser(values)` API call.

```
+-------------------------------------------------------------+
| Header: Profile                             (Logout Icon)   |
+-------------------------------------------------------------+
| Update Profile                                              |
|                                                             |
| Name: [ John Smith                                ]         |
|                                                             |
| Phone no.: [ 9876543210                           ]         |
|                                                             |
| UPI address: [ johnsmith@upi                      ]         |
|                                                             |
|                     [ Save Button ]                         |
+-------------------------------------------------------------+
```

---

## 3. Form Validation & Data Updating Flow

### 3.1 Validation Rules (Yup)
- **`name`**: Required string (`"Name is required!"`).
- **`phone`**: Required string, validated with regex `/^(?:(?:\+|0{0,2})|[0]?)?[6789]\d{9}$/` (`"Enter a valid phone no."`).
- **`upi`**: Required string (`"UPI address is required!"`).

### 3.2 Update Execution (`_onPressSave`)
1. Sets form loading state `loading = true`.
2. Calls `updateUser(values)` in `Src/Services/Collections.js`:
   - Updates `users/{uid}` document in Firestore with modified `name`, `phone`, and `upi`.
3. Calls `getUser(userId)` to refresh Redux `userProfile` state.
4. Triggers top success notification banner: `"User details has been updated"`.

---

## 4. Logout & Session Teardown (`Logout`)

When the landlord clicks the logout icon in the header, a confirmation modal dialog (`MyDialog`) prompts:
`"Are you sure, you want to log out?"`.

Upon user confirmation (`Logout`):
1. **Firebase Authentication Sign-Out**: `await auth().signOut()`.
2. **Google OAuth Access Revocation**: `await GoogleSignin.revokeAccess()`.
3. **Redux State Reset**:
   - `dispatch(setAuthToken(null))`
   - `dispatch(resetAuthSlice({}))`
4. **Local Storage Cleanup**: `LocalStorage.clearLocalStorage()` removes saved UID token.
5. **Navigation State Shift**: App navigation automatically toggles from `AppStack` to `AuthStack` (`Login` screen) based on `selectAuthToken` selector.
