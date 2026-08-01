# 批阅记录

- **源文件**：02_authentication_and_onboarding.md
- **源文件路径**：/home/lenovo/Desktop/PRO/myTenetapp/docs/design/02_authentication_and_onboarding.md
- **源文件版本**：未知
- **批阅时间**：20260801_1539
- **批阅版本**：v1
- **批注数量**：0
  - 评论：0
  - 删除：0
  - 后插：0
  - 前插：0

---

## 操作指令

> 指令已按**从后往前**排列（倒序），请严格按照顺序从上到下逐条执行。
> 每条指令提供了「文本锚点」用于精确定位，请优先通过锚点文本匹配来确认目标位置，blockIndex 仅作辅助参考。

---

## 原始数据（JSON）

> 如需精确操作，可使用以下 JSON 数据。其中 `blockIndex` 是基于空行分割的块索引（从0开始），`startOffset` 是目标文本在块内的字符偏移量（从0开始），可用于区分同一块内的重复文本。

```json
{
  "fileName": "02_authentication_and_onboarding.md",
  "docVersion": "未知",
  "reviewVersion": 1,
  "annotationCount": 0,
  "rawMarkdown": "# Authentication and Onboarding Design Document (`02_authentication_and_onboarding.md`)\n\n## 1. Module Overview\nThe Authentication module manages user onboarding, splash initializing logic, authentication persistence via local storage, email/password credential sign-in and sign-up, and native Google OAuth authentication.\n\n---\n\n## 2. Screen Specifications\n\n### 2.1 Splash Screen (`Src/Components/SplashScreen.js`)\n- **Purpose**: Displays brand logo and loading animation while inspecting local storage for an active session token.\n- **Workflow & Lifecycle (`App.js:87-99`)**:\n  1. On initial mount, `App.js` calls `registerTranslation('en', en)` and checks `LocalStorage.getToken()`.\n  2. If `LocalToken` exists:\n     - Dispatches `setAuthToken(LocalToken)` to Redux.\n     - Invokes `getUser(LocalToken)` and `getUserRooms()` to prefill store data.\n  3. Displays `SplashScreen` component for 3000ms timer before revealing app stack.\n\n```mermaid\nsequenceDiagram\n    autonumber\n    App->>LocalStorage: getToken()\n    alt Token Exists\n        LocalStorage-->>App: LocalToken (UID)\n        App->>Redux: setAuthToken(LocalToken)\n        App->>Firestore: getUser(LocalToken) & getUserRooms()\n        App->>UI: Render AppRoute (Home Dashboard)\n    else Token Null\n        LocalStorage-->>App: null\n        App->>UI: Render AuthRoute (Login Screen)\n    end\n```\n\n---\n\n### 2.2 Login Screen (`Src/Screens/Auth/Login.js`)\n\n#### A. UI Layout & Visual Design\n- **Illustration**: Vector graphics banner (`undraw_Calculator_re_alsc.png`).\n- **Form Controls**: Outlined `TextInput` fields for Email and Password with Yup validation helpers.\n- **Actions**:\n  - Primary \"Login\" Button (Elevated React Native Paper button).\n  - \"Forgot your password?\" touch link.\n  - \"Continue with Google\" custom button with SVG Google Icon.\n\n#### B. Validation Schema (Yup)\n- `email`: Required, valid email format.\n- `password`: Required, minimum 2 characters.\n\n#### C. Authentication Execution Flows\n\n##### Email/Password Login (`_onLoginPressed`):\n1. Sets `loading = true`.\n2. Calls `auth().signInWithEmailAndPassword(email, password)`.\n3. Fetches user document from Firestore: `getUser(user.uid)`.\n4. Saves UID to native storage: `LocalStorage.storeToken(user.uid)`.\n5. Dispatches token to Redux: `dispatch(setAuthToken(user.uid))`.\n6. Handles Firebase error codes:\n   - `auth/email-already-in-use`: Display toast error.\n   - `auth/invalid-email`: Display toast error.\n   - `auth/invalid-credential`: Display toast error.\n\n##### Google Sign-In (`_onGoogleLoginPress`):\n1. Configured Web Client ID: `515928874687-irhbrofvs1bpgmrcd3hpuu510c3epr6f.apps.googleusercontent.com`.\n2. Checks Google Play Services availability: `GoogleSignin.hasPlayServices()`.\n3. Obtains ID token from Google SDK: `GoogleSignin.signIn()`.\n4. Generates credential: `auth.GoogleAuthProvider.credential(idToken)`.\n5. Authenticates with Firebase: `auth().signInWithCredential(googleCredential)`.\n6. Creates or merges user record in Firestore (`addUser(user)`).\n7. Fetches updated user state (`getUser(user.uid)`).\n8. Persists UID to local storage and updates Redux state.\n\n---\n\n### 2.3 Sign Up Screen (`Src/Screens/Auth/Signup.js`)\n\n#### A. UI Layout & Form Inputs\n- Outlined Input fields for Email and Password.\n- \"Sign Up\" primary button.\n- \"Login\" navigation fallback button.\n\n#### B. Registration Logic (`_onSignupPressed`):\n1. Calls `auth().createUserWithEmailAndPassword(email, password)`.\n2. Creates user entry in Firestore `users/{uid}` via `addUser(response.user)`.\n3. Displays success message: `\"Account created successfully\"`.\n4. Navigates to `RoutesName.LOGIN`.\n\n---\n\n## 3. Security & Error Handling Matrix\n\n| Edge Case / Error Code | Handling Strategy | User UI Feedback |\n| :--- | :--- | :--- |\n| Invalid Email Format | Caught by Yup Validation | Inline red text helper: `\"Well that's not an email\"` |\n| `auth/invalid-credential` | Caught in `catch` block | Top floating flash message banner: `\"Invalid user credential\"` |\n| Google Play Services Missing | Google Sign-In SDK prompt | Triggers native Google dialog prompt |\n| Network Timeout | Firebase Exception catch | Top floating flash message with error details |\n",
  "annotations": []
}
```