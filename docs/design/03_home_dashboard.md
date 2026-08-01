# Home Dashboard Design Document (`03_home_dashboard.md`)

## 1. Module Overview
The Home Dashboard module serves as the primary analytical view for property managers. It aggregates room counts, monthly room rent expectations, electricity bill collections for the current month, cumulative lifetime collections, and overall expected revenue.

---

## 2. Screen Specifications (`Src/Screens/App/Home.js`)

### 2.1 UI Layout & Component Composition
- **Header Component (`Header.js`)**: Non-back navigation title bar (`"Home"`).
- **Loading State (`Loader.js`)**: Spinner overlay rendered while initial data calculation completes (`loading` state).
- **ScrollView & Refresh Control**: `VirtualizedScrollView` with custom pull-to-refresh control styled with primary theme color.
- **2x2 Grid Analytics Cards (`Surface` cards)**:

```
+------------------------------------+  +------------------------------------+
|  [Icon: home-lightning-bolt]       |  |  [Icon: account-child-circle]      |
|  Total Rooms                       |  |  Total Rent                        |
|  {homeData?.length}                |  |  ₹ {totalRent}                     |
+------------------------------------+  +------------------------------------+

+------------------------------------+  +------------------------------------+
|  [Icon: lightning-bolt]            |  |  [Icon: account-cash]              |
|  {MMM} Electricity Bill            |  |  Total Amount                      |
|  ₹ {totalElectcityRent}            |  |  ₹ {totalElectcityRent + totalRent}|
+------------------------------------+  +------------------------------------+

+----------------------------------------------------------------------------+
|  [Icon: account-cash]                                                      |
|  Total Electricity Bill                                                    |
|  ₹ {totalElectcityRentTillToday}                                           |
+----------------------------------------------------------------------------+
```

---

## 3. Financial Metrics & Data Aggregation Algorithms

Data for the dashboard is derived from the `homeData` state array in Redux (`selectHomeData`), which is populated by `getData()` in `Src/Services/Collections.js`.

### 3.1 Data Acquisition (`getData()`)
1. Fetches all room documents from `users/{uid}/rooms`.
2. For each room, fetches active tenant data and monthly bill records (`getRoomT(room)`).
3. Constructs consolidated structure:
   ```ts
   RoomData = {
     ...roomDoc,
     roomId: roomDoc.id,
     tenet: {
       ...tenantDoc,
       records: Array<BillRecord>
     }
   }
   ```
4. Stores compiled array in Redux via `setHomeData(pro)`.

---

### 3.2 Metrics Computation Logic (`Home.js:42-68`)

#### A. Total Base Rent (`totalRent`)
Calculated using React `useMemo` and helper function `sumArrayOfObjects`:
$$\text{Total Base Rent} = \sum_{i=1}^{N} \text{room}_i.\text{rent}$$

#### B. Current Month Electricity Collection (`totalElectcityRent`)
Filters paid records where `lastPaidDate` matches current month formatted as `MMYY`:
$$\text{Current Month Electricity} = \sum_{\text{room} \in \text{homeData}} \begin{cases} \text{room.tenet.lastPaidAmount}, & \text{if } \text{format}(\text{lastPaidDate}) = \text{CurrentMMYY} \\ 0, & \text{otherwise} \end{cases}$$

#### C. Lifetime Electricity Collection (`totalElectcityRentTillToday`)
Traverses all records for all rooms and sums total amounts where `paidStatus == true`:
$$\text{Lifetime Collection} = \sum_{\text{room} \in \text{homeData}} \sum_{\text{record} \in \text{room.tenet.records}, \, \text{paidStatus}=\text{true}} \text{record.totalAmount}$$

#### D. Total Combined Revenue (`Total Amount`)
Sum of monthly base rent and current month electricity collection:
$$\text{Total Revenue} = \text{totalRent} + \text{totalElectcityRent}$$

---

## 4. Lifecycle & Refresh Synchronization

- **Focus Effect (`useFocusEffect`)**: Executes a 3-second delayed background refresh on screen focus to sync latest Firestore additions without blocking the initial UI transition.
- **Pull-to-Refresh (`onRefresh`)**:
  1. Sets `refreshing = true`.
  2. Executes parallel network requests: `await getData()` and `await getUser()`.
  3. Resets `refreshing = false`.
