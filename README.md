# Student Finance Tracker

**Theme:** Student Finance Tracker
**Live site:** https://acquahhh.github.io/Student-Finance-Tracker/
**Demo video (unlisted):** ► paste your unlisted YouTube link here after recording
**Repository:** https://github.com/acquahhh/Student-Finance-Tracker

## About

Student Finance Tracker is a simple application designed to help university students manage their money, track daily expenses and understand their spending habits. Inspired by student life at the African Leadership University (ALU), it helps students budget wisely, manage their stipends and make informed financial decisions.

It is built with vanilla HTML, CSS and JavaScript (ES modules), with no frameworks, and it works entirely in the browser: all data is saved in `localStorage`.

**Contact:** Enock Acquah Adomanu · [e.adomanu@alustudent.com](mailto:e.adomanu@alustudent.com) · [github.com/acquahhh](https://github.com/acquahhh)

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
| `id` | string | Unique record id in the form `txn_0001`. The next id is the highest existing number plus one, so ids are never reused within a session. |
| `description` | string | What the money was spent on. No leading or trailing spaces and no double spaces. |
| `amount` | number | The amount in the **base currency**, with up to 2 decimals. |
| `category` | string | Letters, with single spaces or hyphens between words (for example `Food` or `Fast-food`). |
| `date` | string (`YYYY-MM-DD`) | The day of the transaction. Must be a real calendar date. |
| `createdAt` | ISO timestamp | Set once when the record is created and never changed. |
| `updatedAt` | ISO timestamp | Set on creation and refreshed on every edit. |

**Storage keys:** transactions are saved under `sft:data` and settings (monthly cap, base currency and the two other currencies with their rates) under `sft:settings`. Every add, edit, delete and import is saved automatically.

## Wireframes

**Mobile (360px):**

![Mobile wireframe](assets/wireframe-mobile.png)

**Desktop (1024px):**

![Desktop wireframe](assets/wireframe-desktop.png)

Both wireframes show the five sections: About, Dashboard, Records, Add / Edit and Settings.

## Features

- Add, edit (per row) and delete transactions, with a confirmation before delete
- Live regex validation with inline error messages on every field
- Sort by date, description (A-Z / Z-A) and amount (low-high / high-low)
- Live regex search across date, description, category and amount, with a case-insensitive toggle and `<mark>` highlighting
- Dashboard: total records, total spent, top category and a last-7-days bar chart
- Monthly spending cap with ARIA live announcements (polite when under the cap, assertive when over)
- Base currency plus two other currencies with manual rates (no API), shown on the dashboard total
- Automatic saving to `localStorage`
- JSON export, and JSON import that is fully validated before anything is replaced
- Responsive layout at three breakpoints (360px base, 768px and 1024px), with a fade-in and a bar-grow animation that respect `prefers-reduced-motion`

**Note on the cap:** the cap is a **monthly** cap. It compares the cap to spending in the current calendar month, while the other dashboard stats cover all records.

**Note on currencies:** amounts are stored in the base currency. The two other currencies only change how the dashboard total is displayed; saved records are never converted.

## Regex Catalog

| Rule | Pattern | Valid example | Invalid example |
|---|---|---|---|
| Description (no leading/trailing space, no double spaces) | `/^(?!.*\s\s)\S(?:.*\S)?$/` | `Lunch at cafeteria` | ` Lunch`, `Lunch  at` |
| Amount | `/^(0\|[1-9]\d*)(\.\d{1,2})?$/` | `12.50`, `0`, `0.01` | `012`, `1.234`, `-5` |
| Date | `/^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$/` | `2024-02-29` | `2025-13-01` |
| Category | `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/` | `Fast-food`, `Eating out` | `Food2`, `Fast  food` |
| Duplicate word (advanced: back-reference) | `/\b(\w+)\s+\1\b/i` | flags `the the coffee` | `the theater` |
| Currency code | `/^[A-Z]{3}$/` | `RWF` | `rwf`, `USDX` |
| Exchange rate (advanced: negative lookahead) | `/^(?!0+(\.0+)?$)\d+(\.\d{1,6})?$/` | `1450`, `0.92` | `0`, `0.0`, `-2` |
| ISO timestamp (import check) | `/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/` | `2026-10-10T08:00:00.000Z` | `10/10/2026` |

**Advanced patterns:** the description rule uses a negative lookahead `(?!.*\s\s)`, the duplicate-word rule uses a back-reference `\1`, and the rate rule uses a negative lookahead `(?!0+(\.0+)?$)` to reject `0` and `0.0` while allowing `0.5`.

**Checks beyond the regex:**

- The date regex only checks the shape, so `validateDate` also builds a real `Date` and confirms it did not roll over. `2024-02-29` passes and `2025-02-29` fails.
- The duplicate-word check is a **warning**, not an error: the form shows "Possible repeated word" but still lets the user save, so descriptions like "Pizza pizza night" are allowed.

### Search examples

Type these into the search box on the Records section:

| Pattern | What it finds |
|---|---|
| `\.\d{2}\b` | amounts with cents |
| `(coffee\|tea)` | beverage keywords |
| `\b(\w+)\s+\1\b` | repeated words such as "the the" and "Notebook notebook" |
| `^Food$` | rows whose category is exactly Food (each cell is tested separately) |

**Safe search:**

- The compiler wraps `new RegExp` in `try/catch`. An invalid pattern such as `[` shows a message, flags the field with `aria-invalid` and keeps showing all records instead of crashing.
- The highlighter skips empty matches, so patterns like `a*` cannot loop forever.
- All text is HTML-escaped before `<mark>` is added, so a description like `<b>test</b>` is displayed as plain text and never runs as HTML.
- The result count ("3 of 12 records match") is announced through a `role="status"` region.

## Seed Data

`seed.json` holds 12 records that cover edge cases, loaded on first run:

- smallest and largest amounts (`0`, `0.01` and `99999.99`)
- a leap day (`2024-02-29`)
- dates from several months, plus a run of dates in the last 7 days so the trend chart has data
- repeated words (`the the coffee run`, `Notebook notebook set`)
- regex special characters in a description (`Tea and snacks (large) + extra`)
- a very long description
- amounts with and without cents

**Note:** the 7-day chart is relative to today's date, and the seed records dated in the last week of the seed file will drift out of that window over time. Add a record dated today and its bar appears straight away.

## Import and Export

- **Export** downloads all records as a JSON file named `finance-tracker-YYYY-MM-DD.json`.
- **Import** reads a JSON file and validates it completely **before** changing anything. It checks that the file is valid JSON, that it is an array, that each record is an object with a unique `id`, a valid description, amount, category and date (reusing the same validators as the form), and ISO `createdAt` and `updatedAt` timestamps.
- If anything is wrong, the first five problems are listed on the page (not in an `alert()`), the status region says nothing was changed, and no data is touched.
- If the file is valid, the app asks for confirmation and then **replaces** all records.

## Keyboard Map

| Key | Action |
|---|---|
| Tab / Shift+Tab | Move forward / backward through links, fields and buttons |
| Enter on "Skip to main content" | Jump past the header and navigation |
| Enter on a nav link | Jump to that section |
| Enter or Space on a button | Activate it (Edit, Delete, Save, Cancel, Export) |
| Up / Down arrows on a dropdown | Change the sort order |
| Enter in a form field | Submit the form |
| Enter / Esc in a confirm dialog | Confirm / cancel a delete or an import |

**Focus management:** submitting an invalid form moves focus to the first invalid field, Edit moves focus to the Description field, and Delete moves focus to the Records heading (the clicked button no longer exists).

## Accessibility Notes

- Semantic landmarks (`header`, `nav`, `main`, `section`, `footer`) and one `h1` followed by `h2` and `h3` headings, with no skipped levels
- Skip-to-content link as the first focusable element, hidden until it receives focus
- Every input has a `<label>` bound with `for` and `id`; the currency inputs are grouped with `<fieldset>` and `<legend>`
- Errors are linked to their fields with `aria-describedby`, and invalid fields get `aria-invalid="true"`
- `role="status"` / `aria-live="polite"` regions for form, search and settings messages, and `role="alert"` / `aria-live="assertive"` for the over-cap warning. There are two separate regions for the cap, because changing `aria-live` on a single element is unreliable in screen readers.
- Edit and Delete buttons have `aria-label`s that include the record name, for example "Edit Bus pass"
- The table has a `<caption>` and `scope="col"` headers
- The chart bars are `aria-hidden`; the same information is available as text (day and amount) in an ordered list
- Visible `:focus-visible` outlines: dark amber on light backgrounds and light amber on the dark header
- The `prefers-reduced-motion` media query turns off all animations and transitions
- Mobile-first layout with a scrollable table container, so the page never scrolls sideways
- Contrast check: ► run Lighthouse (Accessibility) and write your real score here, for example "Lighthouse accessibility score: __/100"

## Responsive Design

| Breakpoint | Layout |
|---|---|
| Base (~360px) | Single column, stacked header and navigation, scrollable table |
| 768px | Header and navigation side by side, dashboard stats in three columns |
| 1024px | Wider page padding, form limited to a readable width |

## Running the App

ES modules do not work from `file://`, so serve the folder with any static server:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`. To reset to the seed data, run `localStorage.clear()` in the browser console and reload.

## Running the Tests

With the server running, open `http://localhost:8000/tests.html`. Each line shows PASS or FAIL for the validators: the four field rules and their edge cases (leap day, fake dates, leading zeros, double spaces), the duplicate-word check, the currency code and rate rules, and the import validator.

## Project Structure

```
index.html        main app
tests.html        validator assertions
seed.json         12 starter records with edge cases
styles/main.css   mobile-first styles
scripts/
  validators.js   regex rules and validation (no DOM)
  storage.js      localStorage, seed loading, JSON import/export
  state.js        records, add/update/delete, sorting, stats
  search.js       safe regex compiler, highlight, HTML escaping
  ui.js           all DOM rendering
  main.js         wires events together
assets/           wireframes
```

## Development Milestones

| Milestone | What was built |
|---|---|
| M1 | Spec, data model, wireframes and accessibility plan |
| M2 | Semantic HTML and mobile-first CSS |
| M3 | Regex validators, `tests.html` and inline form errors |
| M4 | State, table rendering, sorting, regex search with highlight, edit and delete |
| M5 | Dashboard, 7-day trend chart and monthly cap with ARIA live regions |
| M6 | Currency settings and validated JSON import and export |
| M7 | README, keyboard and accessibility pass, demo video and deployment |

## Credits

- The base regex patterns, the safe regex compiler and the persistence idea come from the starter snippets in the assignment brief. The highlighter was extended to escape HTML first and to skip empty matches.
-I used Claude (Anthropic's AI assistant) as a learning support tool while building this project. It guided me through specific concepts and helped me troubleshoot challenges when needed, while I regularly referred back to the lecture slides shared on Canvas to understand and apply what I had learned. Claude did not generate the code for me rather suggested some edits; I wrote, tested, and integrated the code myself, and I can explain my implementation in the demo video.
- Accessibility guidance followed WCAG 2.1 (focus visibility, contrast and live regions).