# Asset Manager

## Hard Constraints

- No import/export; all files share global scope. Load order is defined in `index.html` scripts array.
- Adding a JS file requires registration in **both** `index.html` scripts array and `构建.command` file list.
- **Never use** `fetch()` or XHR — fails under `file://` protocol.
- Design tokens: `V`. Icon library: `I`. Both defined in `theme.js`.

## Session End Checklist

1. Update CHANGELOG.md (new entry for features, append for minor changes)
2. Update CLAUDE.md if directory / pages / data structures / components changed
3. Commit with `git add -A && git commit -m "<type>: <summary>"`

## Repository Notes

- Remote push is allowed when explicitly requested.
- Keep local tool state out of git (`.claude/`, `.playwright-mcp/`, `.roo/`, `.cursorrules`).
