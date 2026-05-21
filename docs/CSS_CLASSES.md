# CSS class naming reference

Legacy class names from the original Figma export (`list3`, `container1`, etc.) were renamed to semantic names in **app/index.css**, **app/globals.css**, and consuming components. CSS custom properties such as `--container-background` were **not** renamed.

## Rename map

| Old class | New class | Role |
|-----------|-----------|------|
| `list3` | `list` | Interactive list row (settings toggles, links, blog post rows) |
| `list4` | `media-card` | Full-width image link card (shop products, design projects) |
| `list4-label` | `media-card-label` | Overlay label on a media card |
| `container1` | `section-header` | Section title row above a panel or list group |
| `container` | `panel` | Rounded content card / panel |
| `containers` | `page-body` | Centered page column (nav + main content) |
| `index` | `page` | Page root wrapper |
| `blank-div` | `section` | Full-width section wrapper |
| `test-toggle-group` | `list-item-content` | Title + description inside a list row |
| `shape` | `list-item-icon` | Leading icon slot in a list row |
| `others2` | `list-item-chevron` | Trailing chevron / accessory slot |
| `containers-are-the` | `prose` | Body copy paragraph (minimal styling) |

## Unchanged related classes

These names were already clear and stay as-is:

- `list-group` — grouped list container
- `list-item-separator` — divider between rows in a group
- `body-text`, `information`, `information-wrapper` — typography
- `main-content`, `top-app-bar`, `nav-icon-container`, etc.

## Layout composition

Typical page structure:

```tsx
<div className="page">
  <div className="page-body">
    <Navigation />
    <div className="main-content">
      <div className="section">
        <div className="section-header">
          <div className="title">Section title</div>
        </div>
        <div className="list-group">
          <a className="list" href="…">
            <div className="list-item-icon">{/* icon */}</div>
            <div className="list-item-content">
              <div className="body-text">Title</div>
              <div className="information-wrapper">
                <div className="information">Subtitle</div>
              </div>
            </div>
            <div className="list-item-chevron">{/* chevron */}</div>
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
```

Modifiers still use the same pattern, e.g. `className="panel settings"` for a transparent blog/settings panel.

## Removed dead classes

The following Figma-export classes existed only in **app/index.css** and were deleted (no TSX usage):

- `list`, `list2` (superseded by the renamed `list` row style)
- `others`, `test-toggle-wrapper`, `test-toggle-frame`, `test-toggle-parent`
- `left-side-icon`, `right-side-icon`, `seperation-icon`, `button-container`
- `.div`

## Files touched

- **Styles:** `app/index.css`, `app/globals.css`, `app/blog/blog.css`
- **Pages / components:** settings, work, shop, contact, home, blog shells, playground, etc.

When searching the codebase, use the **new** names in `className` and CSS selectors. Grep for old names (`list3`, `container1`, …) should return no matches.

## What was not renamed

- CSS variables: `--container-background`, `--dark-container-background`, etc.
- Compound layout classes: `top-app-bar-container`, `icon-container`, `theme-container`, `header-container`, …
- The `index.css` filename (still imported from `globals.css`)
