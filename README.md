# Student Finance Tracker

**Theme:** Student Finance Tracker
**Live site:** <GitHub Pages URL, add this at deployment>
**Demo video:** <unlisted link, add later>

## About
<2-3 sentences: what the app does and who it's for>

**Contact:** <e.adomanu@alustudent.com> · <https://github.com/acquahhh/>

## Data Model
Each transaction is stored as:

```json
{
  "id": "txn_0001",
  "description": "Lunch at cafeteria",
  "amount": 12.5,
  "category": "Food",
  "date": "2025-09-29",
  "createdAt": "2025-09-29T12:00:00.000Z",
  "updatedAt": "2025-09-29T12:00:00.000Z"
}
```

| Field | Type | Meaning |
|---|---|---|
| id | string | <your explanation> |
| description | string | <...> |
| amount | number | <...> |
| category | string | <...> |
| date | string (YYYY-MM-DD) | <...> |
| createdAt / updatedAt | ISO string | <...> |

## Wireframes
**Mobile (360px):** ![mobile wireframe](assets/wireframe-mobile.png)
**Desktop (1024px):** ![desktop wireframe](assets/wireframe-desktop.png)

## Accessibility Plan
- Skip-to-content link as the first focusable element
- Landmarks: header, nav, main, section, footer
- Every input has a bound `<label>`
- Visible focus styles on all interactive elements
- `aria-live` regions for the spending cap and form errors
- Full keyboard-only flow
- <add your own points>
