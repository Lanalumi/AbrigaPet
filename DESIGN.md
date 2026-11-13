# CadasPatas — design

Colors and type as they are used in the app today. Values are hardcoded (Tailwind arbitrary values and `Table.style.css`). There is no shared token file.

## Font

**Poppins** only, loaded in `src/app/layout.tsx` with `next/font/google`.

| | |
| --- | --- |
| Subset | latin |
| Weights loaded | 400, 500, 600, 700 |
| CSS variable | `--font-family-poppins` on `<html>` |
| Tailwind | `--font-poppins` in `src/app/globals.css` `@theme`, used as `font-poppins` |
| Fallback | sans-serif |

`body` line-height is 1.5. `h1` has `margin-bottom: 0.5rem`.

### How weight and size are used

| Role | Classes |
| --- | --- |
| Page title | `font-poppins font-bold text-2xl` |
| Card / section title | `font-poppins font-bold text-xl` or `font-semibold` |
| Labels, form section titles | `font-poppins font-semibold text-base` |
| Buttons | `font-poppins font-semibold text-[14px]` (white on filled buttons) |
| Filters and table chrome | `font-poppins font-semibold text-[12px]` or `text-[14px]` |
| Login title | `text-2xl font-bold` (login page does not set `font-poppins`; it inherits Poppins from the layout variable only if a class uses it) |
| Login helper | `text-sm`, `text-xs` |

Prefer `font-semibold` (600) for UI text and `font-bold` (700) for page and card titles. Regular 400 is the unloaded-default for anything that does not set a weight.

## Colors

### Core

| Name | Hex | Use |
| --- | --- | --- |
| Cream | `#FFF9F7` | Page background (`body`), input and filter background, active nav item |
| Brown text | `#755835` | Headings, labels, input text, default button text |
| Brown ink | `#3A250B` | Login title and submit button, borders, table text |
| Sage | `#D0DAC4` | Sidebar, table header |
| Leaf | `#8AA36C` | Primary / save button (`Button` `green` and `disabled`) |
| Coral | `#FFA686` | Delete button (`Button` `red`) |
| White | `#FFFFFF` | Cards, button label on filled buttons |

### Brown ink, with alpha

`#3A250B` is rarely used solid outside login.

| Value | Use |
| --- | --- |
| `#3A250B` / 30% (`border-[#3A250B]/30`) | Card, field, textarea, dropdown, and filter borders |
| `#3A250B` / 20% | Login field borders |
| `#3A250B` / 70% | Login secondary text |
| `#755835` / 70% | Filter placeholders and pager text |
| `#3a250bb4` | Table outer border (~71%) |
| `#3a250b77` | Table cell and header borders (~47%) |
| `#3a250ba2` | Table header and cell text (~64%) |

### Sage, with alpha

| Value | Use |
| --- | --- |
| `#D0DAC4` | Sidebar and table header, solid |
| `#d0dac489` | Sortable header hover (~54%) |
| `#d0dac446` | Table row hover (~27%) |

### Surfaces

| Value | Use |
| --- | --- |
| `bg-white` | Form and dashboard cards |
| `bg-white/90` | Login card |
| `bg-white/60` | `SummaryTag` (Comunidade collapse) |
| Shadow `2px 4px 14px rgba(58, 37, 11, 0.1)` | Cards (`shadow-[2px_4px_14px_rgba(58,37,11,0.1)]`) |

### Feedback

| Name | Hex | Use |
| --- | --- | --- |
| Error wash | `#FFF0ED` | Form error box background |
| Error line | `#B85454` at 40% | Error box border |
| Error text | `#8A3B3B` | Error box copy |
| Error action | `#B85454` | “Remove” on `AvatarUpload` |

### Leftovers (do not extend)

`src/global/ui/Table/Table.style.css` pagination still falls back to colors that are not part of the palette:

| Token fallback | Hex | Where |
| --- | --- | --- |
| `--light-gray` | `#E0E0E0` border, `#F5F5F5` hover | Pagination buttons |
| `--primary-color` | `#007BFF` | Active pagination button |

Those CSS variables are not defined in `globals.css`, so the fallbacks always win.

## Shape

| Element | Radius |
| --- | --- |
| Cards | `rounded-xl` (0.75rem) |
| Login card | `rounded-2xl` |
| Inputs, error box, avatar | `rounded-md` |
| Dropdown | `rounded-sm` |
| Buttons | `rounded-[10px]` |
| Active nav item, pagination | `4px` |

Buttons cap at `md:max-w-70 md:max-h-10`, padding `py-2 px-4`, label 14px semibold white.

## Where to look

- Font setup: `src/app/layout.tsx`, `src/app/globals.css`
- Buttons: `src/global/ui/Button/Button.tsx`
- Fields: `src/global/ui/Field/Field.tsx`, `TextArea`, `DropDown`, `CheckBox`
- Nav: `src/global/ui/MenuNav/MenuNav.tsx`
- Tables: `src/global/ui/Table/Table.style.css`
- Cards: `src/app/home/page.tsx` and the animal / person forms
