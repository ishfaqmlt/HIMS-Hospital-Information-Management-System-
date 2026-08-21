# HIMS Project Rules

## Project Overview
Hospital Information Management System (HIMS) built with Next.js 16 (client) and Laravel 12 (server).

## Tech Stack
- **Client:** Next.js 16, TypeScript, shadcn/ui, Redux Toolkit, Axios, react-hook-form, Zod
- **Server:** Laravel 12, PHP 8.2, Spatie Permission v6, Sanctum v4 (token-based)
- **Database:** MySQL (db_hims)
- **Date Format:** d-m-y (e.g., 10-07-2026)

## Project Structure
```
client/src/
├── app/
│   ├── (auth)/login/page.jsx          # Auth pages
│   ├── Modules/
│   │   ├── Dashboard/page.jsx         # Main dashboard
│   │   ├── Administration/            # Users, Roles, Permissions
│   │   ├── Settings/                  # Hospital Profile + Doctor Share Master
│   │   ├── Billing/                   # Billing page + invoiceColumns
│   │   ├── Reports/                   # Print layouts (Thermal, A4, Invoice)
│   │   └── [Department]/              # 42+ modules
│   └── page.tsx                       # Root redirect to /login
├── components/
│   ├── ui/                            # shadcn components
│   ├── data-table/                    # DataTable wrapper
│   ├── patients/                      # PatientDetailsCard, AddPatientDialog
│   └── layout/Navbar.jsx             # Top navbar
├── lib/
│   ├── axios.js                       # Axios instance
│   ├── zodeSchema.js                  # All Zod schemas
│   └── utils.js                       # cn() helper
├── reduxToolKit/
│   ├── store.js                       # Redux store
│   └── slices/                        # Redux slices + async thunks
└── services/                          # API service files

server/
├── app/
│   ├── Http/Controllers/              # API controllers
│   └── Models/                        # Eloquent models
├── database/
│   ├── migrations/                    # Database migrations
│   └── seeders/                       # Seeders (RolesAndPermissionsSeeder, DoctorSeeder)
└── routes/api.php                     # API routes
```

## Code Conventions

### Forms (react-hook-form + Zod)
- Always use react-hook-form with zodResolver
- Define all schemas in `src/lib/zodeSchema.js`
- Use `{...register("fieldName")}` pattern
- Display inline error messages per field
- No manual `useState` for form fields
- No manual `handleChange` functions

```jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { someSchema } from "@/lib/zodeSchema";

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(someSchema),
});

<form onSubmit={handleSubmit(onSubmit)}>
  <Input {...register("fieldName")} />
  {errors.fieldName && <p className="text-sm text-destructive">{errors.fieldName.message}</p>}
</form>
```

### API Services
- Create service files in `src/services/[module].service.js`
- Export named functions or default object
- Use the shared axios instance from `@/lib/axios`

```js
import axios from "@/lib/axios";

const moduleService = {
  getAll: (params) => axios.get("/module", { params }),
  getById: (id) => axios.get(`/module/${id}`),
  create: (data) => axios.post("/module", data),
  update: (id, data) => axios.put(`/module/${id}`, data),
  delete: (id) => axios.delete(`/module/${id}`),
};

export default moduleService;
```

### Redux Slices
- Use async thunks for API calls
- Handle loading, error, success states
- Include `resetState` action for cleanup

### Backend Controllers
- Use Form Requests for validation
- Return consistent JSON responses
- Use Spatie Permission traits on User model
- Token-based auth (Bearer header), not cookie-based

### Laravel Routes
- All routes in `routes/api.php`
- Use `auth:sanctum` middleware for protected routes
- Apply `permission:` middleware for role-based access

```php
Route::middleware(['auth:sanctum', 'permission:module_name'])->group(function () {
    Route::get('/module', [ModuleController::class, 'index']);
    Route::post('/module', [ModuleController::class, 'store']);
});
```

### DataTable Pattern
- **STRICT RULE**: ALL data listing tables across ALL pages MUST strictly use the shadcn `DataTable` wrapper (`@/components/data-table/data-table`).
- Never use raw `<Table>` / `<TableBody>` custom table rendering for data lists when `DataTable` can be used.
- Create `columns.jsx` file next to the page.
- Export `getColumns` function returning the column definitions array.
- `filterColumn` prop must match column `id` or `accessorKey`.

```jsx
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";

const columns = getColumns({ onEdit, onDelete });
<DataTable columns={columns} data={items} filterColumn="columnName" />
```

### UI Components (shadcn/ui Only)
- **ALL UI elements MUST strictly come from shadcn/ui** (`@/components/ui/`)
- Never create custom UI code, raw HTML boxes, or custom div wrappers when shadcn equivalents exist
- Never use plain HTML elements (button, input, select, etc.) or raw HTML alert/toast banners — always use shadcn versions (`Button`, `Input`, `Select`, `Alert`, `AlertDescription`, `Card`, `Badge`, `Separator`, etc.)
- Available shadcn components: Button, Input, Label, Textarea, Select, Dialog, AlertDialog, DropdownMenu, Table, Card, Badge, Alert, Tabs, Checkbox, RadioGroup, Switch, Slider, Popover, Tooltip, Sheet, Command, Calendar, Avatar, Separator, Skeleton, ScrollArea, Accordion, NavigationMenu, Menubar, ContextMenu, HoverCard, Resizable, Table (DataTable)
- Use Lucide icons from `lucide-react`
- Use `cn()` utility for conditional classes

### shadcn/ui Usage Examples
```jsx
// Button
import { Button } from "@/components/ui/button";
<Button variant="outline" size="sm">Click</Button>

// Input
import { Input } from "@/components/ui/input";
<Input placeholder="Enter value" />

// Select — always use className="w-full" on SelectTrigger
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
<Select>
  <SelectTrigger className="w-full"><SelectValue placeholder="Select..." /></SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>

// Dialog
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader><DialogTitle>Title</DialogTitle></DialogHeader>
    {/* content */}
  </DialogContent>
</Dialog>

// DataTable
import { DataTable } from "@/components/data-table/data-table";
<DataTable columns={columns} data={items} />

// Card
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
<Card><CardHeader><CardTitle>Title</CardTitle></CardHeader><CardContent>...</CardContent></Card>
```

### Authentication
- Login/Register with email + password
- Store token in localStorage (client handles via redux)
- Axios interceptor adds Bearer token automatically
- 401 response redirects to login

## Backend Rules
- **All tables must use UUID as primary key** (not auto-increment integers)
- Use `$uuid = true;` in Eloquent models or `$table->uuid('id')->primary()` in migrations
- Default admin: admin@hims.com / password
- Super_admin gets wildcard `*` permission from backend
- All permissions defined in database seeders
- Use `HasRoles` trait on User model
- Sanctum statefulApi REMOVED (token-based only)
- **`createdBy`/`updatedBy`/`postedBy`** use `foreignId` (bigint, references `users.id`)
- **All FK references must match actual column types** — if target is string (e.g., `pid-MMYY-###`), use raw `DB::table()` joins instead of Eloquent relationships
- **Use `DB::table()` for insert and update operations** — Eloquent's dirty attribute detection can silently skip updates when it thinks values haven't changed (especially with `decimal` casts). Use `DB::table('table')->insert($data)` and `DB::table('table')->where('id', $id)->update($data)` for store/update methods. Eloquent is fine for reads (selects, relationships).

## Frontend Rules
- Root page (`page.tsx`) redirects to `/login`
- AuthGuard wraps all Module pages
- Dashboard shows all 42 modules
- Non-permitted modules are greyed out with lock icon
- No sidebar on main pages
- Navbar: Logo | Theme Toggle | User Avatar | Logout
- Settings accessible from dashboard cards

---

## Billing Module Rules

### Page Layout
- **Three-column layout**: Left (service selection + action buttons) | Center (selected services table) | Right (bill details/amounts)
- **Bottom section**: Invoice list with search filters (MRN, Patient ID, From/To Date)
- **Date defaults**: From Date = today 00:00, To Date = today 23:59 (local time, not UTC)

### Patient Search (Billing Page)
- **MRN/Patient ID inputs**: Auto-add `-` after 4 digits via `formatCode()` (e.g., `0726-001`)
- **CNIC/Mobile search**: Triggers backend search, shows multiple-patient selection dialog
- **No patients found**: Opens AddPatientDialog automatically
- **AddPatientDialog**: `onPatientAdded` passes created patient data to parent callback


### PatientDetailsCard (Reusable Component)
- 8-column grid layout:Visit No | MRN | CNIC | Mobile | Patient Name | Guardian | DOB | Gender 
- **Input masking**: `formatCode()` strips non-digits, adds `-` after 4th digit, max 8 digits (9 chars with dash)
- **Enter key**: All four search inputs (Visit No,MRN, CNIC, Mobile) trigger search on Enter via `onKeyDown`
- **Disabled state**: When `selectedPatient` exists, inputs show disabled value (patient data)
- **Placeholders**: All search inputs use empty placeholders (`placeholder=""`)

### Service Selection
- **Department select**: Disabled when services exist, re-enabled on New
- **Service select + Add Service button**: Inline (flex row) — button to the right of select
- **Service Code search + Add by Code button**: Inline (flex row) — button to the right of input
- **Service code format**: Dot-separated (e.g., `401.402.403`), loops and adds all matching services
- **Duplicate validation**: Prevents adding same service twice (checks both add and code search)

### Selected Services Table
- **Columns**: Flag (`I`=new, `U`=existing) | Code | Service Name | Charges (editable) | Qty (editable) | Amount | Delete
- **Delete**: Only allowed for flag `I` (new) services; `U` services cannot be deleted
- **Charges input**: Edits fee, recalculates totalAmount = fee × qty

### Pricing Logic (ServingBy)
- Department `ServingBy=Doctor`: Check `service_charges` table for matching doctor+dept+service fee; fallback to `DefaultCharges`
- Department `ServingBy=Department`: Use `DefaultCharges` directly from services table

### Bill Details (Right Side)
- **No Invoice No input** — auto-generated on backend
- **Fields**: Date (datetime-local) | SubTotal (disabled) | Discount % | Discount (disabled) | TotalAmount (disabled) | Paid | Patient Balance (disabled)
- **Paid default**: `paid = netAmount` whenever services change or discount changes
- **Discount onChange**: Recalculates `netAmount` and sets `paid = netAmount`
- **`updateTotals()`**: Called on every service add/remove, sets `paid = netAmount`

### Edit Mode
- **Edit button** in invoice list: Loads invoice into form, services flagged `U`
- **Edit mode banner**: Shows "Editing Invoice: INV-..." with Cancel Edit button
- **Save button**: Changes text to "Update" during edit
- **Add new services**: New services get flag `I` (can delete), existing remain `U` (cannot delete)
- **Backend save**: Updates existing billing details, creates new ones (not full replace)

### Return Invoice
- Navigate: `router.push(/Modules/Reports/Reception/return-invoice?invoiceNo=...&mrn=...)`
- **Select All / Return All**: Bulk selection for return items
- **Per-service qty control**: Can return partial quantities
- **Confirmation dialog** before submission
- **Creates new invoice**: `BillType=Return`, `ReturnBillingId` linked to original invoice

### Invoice List
- **Search filters**: MRN, Patient ID, From Date, To Date
- **DataTable columns**: InvoiceNo | MRN | Patient Name | Patient ID | Mobile | Date | Doctor | Department | SubTotal | Discount | Total | Status (color badge) | Actions
- **Status badge colors**: Paid=green, Partial=yellow, Cancelled=red, Pending=gray
- **`filterColumn`**: Must match column `id` (e.g., `filterColumn="patientName"` not `filterColumn="pName"`)
- **Backend query**: Raw `DB::table()` LEFT JOINs (not Eloquent) to avoid `foreignUuid` type mismatch with string PKs

### Backend Controller (BillingController)
- **index**: Raw `DB::table('billings')` LEFT JOINs to `patient_visits`, `patients`, `doctors`, `departments` — avoids Eloquent eager loading failure due to `foreignUuid` FK mismatch
- **Date filtering**: `WHERE DATE(InvoiceDate) BETWEEN fromDate AND toDate`
- **Patient filtering**: `WHERE patient_visits.patientId = ?` or `WHERE patients.patientId = ?`

---

## Patient Registration Rules

### ID Generation
- **MRN**: `MRN-{YY}-{SEQ}` (e.g., `MRN-26-1`, `MRN-26-2`, `MRN-26-100`) — resets yearly via prefix match (`system_sequences` table)
- **CaseNo**: `LAB-{YY}-{SEQ}` (e.g., `LAB-26-1`, `LAB-26-2`, `LAB-26-100`) — resets yearly via prefix match (`lab_cases` table)
- **VisitNo**: `V-{MMYY}-{SEQ}` (e.g., `V-0726-1`, `V-0726-2`) — resets monthly via prefix match (`system_sequences` table)
- **InvoiceNo**: `INV-{MMYY}-{SEQ}` (e.g., `INV-0726-1`, `INV-0726-2`) — resets monthly via prefix match (`system_sequences` table)
- All sequences are unpadded numbers without leading zeros (`1`, `2`, `3` ... `100`, `5000`)

### Database Notes
- Eloquent eager loading breaks on this FK — use raw `DB::table()` joins instead
- `billings.patientId` FK references `patients.id`

---

## Print / Reports Rules

### Print Libraries
- **react-to-print**: Installed and used for thermal (80mm) and A4 print layouts
- Use `useReactToPrint` hook with `contentRef` and component refs

### Print Components
- `ThermalPrintLayout.jsx`: 80mm thermal receipt, exports `ThermalReceipt` component
- `A4PrintLayout.jsx`: A4 invoice, exports `A4Receipt` component
- `PrintHeader.jsx`: Reusable header (hospital logo, name, address)
- `PrintFooter.jsx`: Reusable footer (signatures)
- `index.js`: Barrel exports for all print components

### Print Flow
- `printInvoiceSlip(invoice, format, setMessage)` in `Reports/Reception/invoice/page.jsx`
- Fetches full invoice data, renders `InvoicePrintComponent` with react-to-print
- Supports both `"thermal"` and `"a4"` formats

### Input Masking
- `formatCode(value)`: Strips non-digits, takes max 8 digits, adds `-` after 4th digit
- Used on visitNo and MRN input in PatientDetailsCard

---

## Common Patterns

### Create/Edit Dialog Pattern
```jsx
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [editingItem, setEditingItem] = useState(null);

const openCreate = () => { setEditingItem(null); setIsDialogOpen(true); };
const openEdit = (item) => { setEditingItem(item); setIsDialogOpen(true); };
```

### Fetch Data Pattern
```jsx
const [loading, setLoading] = useState(true);
const [items, setItems] = useState([]);

useEffect(() => { fetchData(); }, []);

const fetchData = async () => {
  try {
    setLoading(true);
    const res = await service.getAll();
    setItems(res.data);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};
```

### Message/Toast Pattern
```jsx
const [message, setMessage] = useState(null);

useEffect(() => {
  if (!message) return;
  const t = setTimeout(() => setMessage(null), 4000);
  return () => clearTimeout(t);
}, [message]);
```

### Create/Edit Dialog Pattern
```jsx
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [editingItem, setEditingItem] = useState(null);

const openCreate = () => { setEditingItem(null); setIsDialogOpen(true); };
const openEdit = (item) => { setEditingItem(item); setIsDialogOpen(true); };
```

### Bulk Operations Pattern (DoctorShareMaster)
```php
// Backend: bulkStore skips duplicates, bulkDestroy for batch delete
public function bulkStore(Request $request) {
    $items = $request->input('items', []);
    foreach ($items as $item) {
        DoctorShareMaster::updateOrCreate(
            ['DepartmentId' => $item['DepartmentId'], 'ServiceId' => $item['ServiceId']],
            ['DoctorId' => $item['DoctorId'], 'DoctorShare' => $item['DoctorShare'], 'hospitalShare' => $item['hospitalShare']]
        );
    }
    return response()->json(['message' => 'Saved successfully']);
}
```

### Local Time ISO String Helper (for datetime-local inputs)
```jsx
const toLocalISOString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}`;
};
```

### Enter Key Search Pattern
```jsx
<Input
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onSearch(); } }}
/>
```

### Inline Button + Input Pattern (flex row)
```jsx
<div className="flex gap-2">
  <Input value={value} onChange={...} className="h-8 text-xs" />
  <Button size="sm" onClick={handler} disabled={!value.trim()}>
    <Plus className="h-3 w-3 mr-1" /> Add
  </Button>
</div>
```

---

## Development Rules

### Model, Migration & Seeder Approval Rule
- **ALWAYS ASK USER PERMISSION FIRST**: Whenever planning to create, edit, or delete any Eloquent Model (`server/app/Models/*`), Migration (`server/database/migrations/*`), or Seeder (`server/database/seeders/*`) file, you MUST explicitly ask for permission from the user before executing the changes.

### Migration Safety
- **NEVER run `migrate:fresh` unless explicitly told** — only `php artisan migrate` or targeted rollback
- When changing FK types, create a new migration (don't modify existing ones)
- **When altering a table via migration**: Also update the original `create_*_table` migration to reflect the same change. 

### File Naming
- Frontend pages: `page.jsx` (not `.tsx` unless TypeScript required)
- Backend controllers: `PascalCaseController.php`
- Migrations: `YYYY_MM_DD_HHMMSS_create_tablename_table.php`
- Services: `camelCase.service.js` (frontend), `PascalCaseController.php` (backend)

### Pushing to GitHub
- **STRICT DIRECTIVE**: DO NOT push code, commits, or data to GitHub automatically or after every prompt.
- Only run `git push` when the user explicitly and specifically instructs you to push or upload to GitHub.
- Never offer or execute `git push` on your own initiative.
- When explicitly requested by the user: verify all changes compile (`npm run build` if needed), check for unused imports/variables, and test key flows before pushing.
