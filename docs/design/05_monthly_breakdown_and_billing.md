# Monthly Breakdown and Billing Design Document (`05_monthly_breakdown_and_billing.md`)

## 1. Module Overview
The Monthly Breakdown and Billing module is the core utility calculation and payment tracking engine of **myTenant**. It handles monthly meter reading entries, meter proof image uploads to Cloudinary, automated electricity bill generation, partial and full payment management, WhatsApp/SMS statement generation, and bill receipt export.

---

## 2. Calculation Engine Specification

### 2.1 Formula Definitions

#### A. Units Consumption
$$\text{totalUnitBurned} = \text{currentReading} - \text{previousReading}$$

#### B. Electricity Bill
$$\text{totalAmount}_{\text{elec}} = \text{totalUnitBurned} \times \text{perUnitRate}$$

#### C. Total Payable for Current Month
$$\text{totalAmount}_{\text{month}} = \text{totalAmount}_{\text{elec}} + \text{room.rent}$$

#### D. Total Outstanding Account Payable (`totalPendingAmount`)
Aggregates all unpaid and partial pending records for the active tenant:
$$\text{totalPendingAmount} = \sum_{\text{record} \in \text{tenantRecords}} \begin{cases} 
\text{record.pendingAmount}, & \text{if } \text{record.pendingAmount} > 0 \\
\text{totalAmount}_{\text{month}}, & \text{if } \text{paidStatus} = \text{false} \text{ and } \text{pendingAmount is null} \\
0, & \text{if } \text{paidStatus} = \text{true}
\end{cases}$$

---

## 3. Screen & Modal Specifications

### 3.1 Monthly Breakdown Screen (`Src/Screens/App/MonthlyBreakdown.js`)

#### A. UI Components
- **Total Payable Summary Banner**: Rendered at top when `totalPendingAmount > 0` with bold error-colored text.
- **Bill Record Card Components (`renderItem`)**:
  - Border highlight: Green/white for `Paid`, Red border (`colors.error`) for `Unpaid`.
  - Proof Meter Image: Rendered using Cloudinary image URL.
  - Action Buttons: `Checkmark` (Mark as Paid), `Cash` (Partial Pay).
  - Communication Tool Bar: `WhatsApp Reminder`, `SMS Reminder`, `Dial Phone`, `Share Bill`.

```
+-------------------------------------------------------------+
| TOTAL PAYABLE: ₹ 8,500                                      |
+-------------------------------------------------------------+
| [Meter Image]                       Status: UNPAID          |
| Month: July 2026                                            |
| New Reading: 1250 | Old Reading: 1100                       |
| Units Burned: 150 | Per Unit: ₹ 10                          |
| Electricity Bill: ₹ 1,500                                   |
| This Month Total (Elec + Rent): ₹ 6,500                     |
|                                                             |
| [Mark Paid]  [Partial Pay]                                  |
| [WhatsApp] [SMS] [Call] [Share Bill]                        |
+-------------------------------------------------------------+
```

---

### 3.2 Add Meter Reading Modal (`Src/Components/Modals/AddTenetRecordModal.js`)

#### A. Workflow & Cloudinary Integration
1. User selects/captures physical meter photo (`react-native-image-crop-picker`).
2. App uploads image payload to Cloudinary via `uploadToCloudinary()` helper.
3. User inputs `newReading` and optional `note`.
4. Executes `addUserRoomsTenantsRecord(payload)`:
   - Stores record doc in `users/{uid}/rooms/{roomId}/Tenants/{tenantId}/record`.
   - Automatically updates room baseline reading (`startReading`) to `newReading`.

---

### 3.3 Payment Lifecycle Modals

#### A. Full Payment (`markAsPaidRecord`)
- Sets `paidAmount = totalAmount_{\text{month}}`, `pendingAmount = 0`, `paidStatus = true`.
- Updates tenant's `lastPaidDate` and `lastPaidAmount`.

#### B. Partial Payment Modal (`Src/Components/Modals/PartialPaymentModal.js`)
- Landlord inputs amount paid by tenant.
- Calculates `pendingAmount = totalAmount - paidAmount`.
- Calls `updatePartialPayment()` in Firestore setting `partialPaid: true`.

---

### 3.4 Automated Reminders & Sharing

#### A. WhatsApp Statement Generator (`getWhatsAppMessage`)
Generates structured text payload formatted with Markdown borders and payment details:

```text
Hi John Doe

*Bill for the month of June-July 2026*
------------------------------------------------
| _Old reading_          | *1100* |
| _New reading_          | *1250* |
| _Units used_            | *150*  |
| _Electricity Bill_       | *1500* |
------------------------------------------------
| _Rent_                    | *5000* |
| _This Month Total_     | *6500* |
| _Total Payable_          | *8500* |
------------------------------------------------

Please pay your bill on time to mobile number *9876543210* or UPI *landlord@upi*.
```

#### B. Share Bill Modal (`Src/Components/Modals/ShareBillModal.js`)
- Displays stylized digital receipt receipt card.
- Incorporates `react-native-view-shot` to capture receipt component as image.
- Uses `react-native-share` to export bill graphic to WhatsApp, Email, or File System.
