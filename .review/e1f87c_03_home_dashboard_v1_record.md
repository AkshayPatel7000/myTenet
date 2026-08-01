# 批阅记录

- **源文件**：03_home_dashboard.md
- **源文件路径**：/home/lenovo/Desktop/PRO/myTenetapp/docs/design/03_home_dashboard.md
- **源文件版本**：未知
- **批阅时间**：20260801_1540
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
  "fileName": "03_home_dashboard.md",
  "docVersion": "未知",
  "reviewVersion": 1,
  "annotationCount": 0,
  "rawMarkdown": "# Home Dashboard Design Document (`03_home_dashboard.md`)\n\n## 1. Module Overview\nThe Home Dashboard module serves as the primary analytical view for property managers. It aggregates room counts, monthly room rent expectations, electricity bill collections for the current month, cumulative lifetime collections, and overall expected revenue.\n\n---\n\n## 2. Screen Specifications (`Src/Screens/App/Home.js`)\n\n### 2.1 UI Layout & Component Composition\n- **Header Component (`Header.js`)**: Non-back navigation title bar (`\"Home\"`).\n- **Loading State (`Loader.js`)**: Spinner overlay rendered while initial data calculation completes (`loading` state).\n- **ScrollView & Refresh Control**: `VirtualizedScrollView` with custom pull-to-refresh control styled with primary theme color.\n- **2x2 Grid Analytics Cards (`Surface` cards)**:\n\n```\n+------------------------------------+  +------------------------------------+\n|  [Icon: home-lightning-bolt]       |  |  [Icon: account-child-circle]      |\n|  Total Rooms                       |  |  Total Rent                        |\n|  {homeData?.length}                |  |  ₹ {totalRent}                     |\n+------------------------------------+  +------------------------------------+\n\n+------------------------------------+  +------------------------------------+\n|  [Icon: lightning-bolt]            |  |  [Icon: account-cash]              |\n|  {MMM} Electricity Bill            |  |  Total Amount                      |\n|  ₹ {totalElectcityRent}            |  |  ₹ {totalElectcityRent + totalRent}|\n+------------------------------------+  +------------------------------------+\n\n+----------------------------------------------------------------------------+\n|  [Icon: account-cash]                                                      |\n|  Total Electricity Bill                                                    |\n|  ₹ {totalElectcityRentTillToday}                                           |\n+----------------------------------------------------------------------------+\n```\n\n---\n\n## 3. Financial Metrics & Data Aggregation Algorithms\n\nData for the dashboard is derived from the `homeData` state array in Redux (`selectHomeData`), which is populated by `getData()` in `Src/Services/Collections.js`.\n\n### 3.1 Data Acquisition (`getData()`)\n1. Fetches all room documents from `users/{uid}/rooms`.\n2. For each room, fetches active tenant data and monthly bill records (`getRoomT(room)`).\n3. Constructs consolidated structure:\n   ```ts\n   RoomData = {\n     ...roomDoc,\n     roomId: roomDoc.id,\n     tenet: {\n       ...tenantDoc,\n       records: Array<BillRecord>\n     }\n   }\n   ```\n4. Stores compiled array in Redux via `setHomeData(pro)`.\n\n---\n\n### 3.2 Metrics Computation Logic (`Home.js:42-68`)\n\n#### A. Total Base Rent (`totalRent`)\nCalculated using React `useMemo` and helper function `sumArrayOfObjects`:\n$$\\text{Total Base Rent} = \\sum_{i=1}^{N} \\text{room}_i.\\text{rent}$$\n\n#### B. Current Month Electricity Collection (`totalElectcityRent`)\nFilters paid records where `lastPaidDate` matches current month formatted as `MMYY`:\n$$\\text{Current Month Electricity} = \\sum_{\\text{room} \\in \\text{homeData}} \\begin{cases} \\text{room.tenet.lastPaidAmount}, & \\text{if } \\text{format}(\\text{lastPaidDate}) = \\text{CurrentMMYY} \\\\ 0, & \\text{otherwise} \\end{cases}$$\n\n#### C. Lifetime Electricity Collection (`totalElectcityRentTillToday`)\nTraverses all records for all rooms and sums total amounts where `paidStatus == true`:\n$$\\text{Lifetime Collection} = \\sum_{\\text{room} \\in \\text{homeData}} \\sum_{\\text{record} \\in \\text{room.tenet.records}, \\, \\text{paidStatus}=\\text{true}} \\text{record.totalAmount}$$\n\n#### D. Total Combined Revenue (`Total Amount`)\nSum of monthly base rent and current month electricity collection:\n$$\\text{Total Revenue} = \\text{totalRent} + \\text{totalElectcityRent}$$\n\n---\n\n## 4. Lifecycle & Refresh Synchronization\n\n- **Focus Effect (`useFocusEffect`)**: Executes a 3-second delayed background refresh on screen focus to sync latest Firestore additions without blocking the initial UI transition.\n- **Pull-to-Refresh (`onRefresh`)**:\n  1. Sets `refreshing = true`.\n  2. Executes parallel network requests: `await getData()` and `await getUser()`.\n  3. Resets `refreshing = false`.\n",
  "annotations": []
}
```