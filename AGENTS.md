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
│   │   ├── Settings/                  # Hospital Profile
│   │   └── [Department]/              # 42+ modules
│   └── page.tsx                       # Root redirect to /login
├── components/
│   ├── ui/                            # shadcn components
│   ├── data-table/                    # DataTable wrapper
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
│   └── seeders/                       # Seeders (RolesAndPermissionsSeeder)
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
  getAll: () => axios.get("/module"),
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
- Create `columns.jsx` file next to the page
- Export `getColumns` function
- Use shadcn DataTable component

```jsx
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";

<DataTable columns={columns} data={items} />
```

### UI Components (shadcn/ui Only)
- **ALL UI elements MUST come from shadcn/ui** (`@/components/ui/`)
- Never create custom UI components when shadcn equivalents exist
- Never use plain HTML elements (button, input, select, etc.) — always use shadcn versions
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

## Frontend Rules
- Root page (`page.tsx`) redirects to `/login`
- AuthGuard wraps all Module pages
- Dashboard shows all 42 modules
- Non-permitted modules are greyed out with lock icon
- No sidebar on main pages
- Navbar: Logo | Theme Toggle | User Avatar | Logout
- Settings accessible from dashboard cards

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
