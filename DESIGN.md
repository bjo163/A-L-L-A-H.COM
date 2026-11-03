# DESIGN: A-L-L-A-H.COM Visual & Server-Driven UI Specification

Dokumen ini mendefinisikan sistem desain visual, palet warna, tipografi, dan kontrak Server-Driven UI (SDUI) antara backend Rust dan frontend Next.js (`apps/web`).

---

## 1. Design Tokens & Palet Visual

- **Background Deep Space**: `#020617` (`slate-950`) / Surface `#0f172a` (`slate-900`)
- **Accent Emerald (Operational / Active)**: `#10b981` (`emerald-500`) / Badge bg `#10b98115`
- **Accent Sky (Storage & Data)**: `#0ea5e9` (`sky-500`)
- **Accent Amber (Odoo ERP Core)**: `#f59e0b` (`amber-500`)
- **Border Crisp**: `#1e293b` (`slate-800`)

---

## 2. Server-Driven UI (SDUI) Contracts

Frontend tidak meng-hardcode struktur form dan tabel. Seluruh rendering digerakkan oleh skema JSON dari backend:

### Tree (List View) Contract:
```json
{
  "model": "res.partner",
  "view_type": "tree",
  "title": "Developers & Partners",
  "fields": [
    { "name": "name", "label": "Full Name", "type": "char", "sortable": true },
    { "name": "email", "label": "Email Address", "type": "char", "sortable": true },
    { "name": "credit_balance", "label": "Credit (USD)", "type": "float", "sortable": true },
    { "name": "active", "label": "Status", "type": "boolean", "badge": true }
  ]
}
```

### Form (Edit View) Contract:
```json
{
  "model": "ai.provider",
  "view_type": "form",
  "title": "Configure AI Provider",
  "groups": [
    {
      "title": "Basic Credentials",
      "fields": ["name", "slug", "provider_type", "base_url"]
    },
    {
      "title": "Routing & Priority",
      "fields": ["priority", "is_healthy", "active"]
    }
  ]
}
```
