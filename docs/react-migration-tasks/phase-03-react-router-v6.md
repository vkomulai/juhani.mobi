# Phase 3: React Router v5 → v6

**Size:** Small
**Prerequisites:** Phase 2 (React 18)
**Blocks:** None

## Overview

Upgrade React Router from v5 to v6. Replace `<Switch>` with `<Routes>`, `component=` prop with `element=`, and `withRouter` HOC with `useParams()` hook. Only 2 files use routing: `src/index.js` and `src/components/SortableList/SortableList.jsx`.

## Packages

### Remove
- `react-router-prop-types` — no longer needed with hooks

### Upgrade
- `react-router` — ^5.1.2 → ^6
- `react-router-dom` — ^5.1.2 → ^6

## Files to Modify

| File | Change |
|---|---|
| `src/index.js` | `<Switch>` → `<Routes>`, `component=` → `element=` |
| `src/components/SortableList/SortableList.jsx` | Remove `withRouter` HOC, use `useParams()` hook |
| `package.json` | Update deps |

## Step-by-Step Tasks

### 1. Update index.js routing

**Before (v5):**
```js
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

<Router>
  <Switch>
    <Route path='/l/:id' component={App} />
    <Route path='/' component={App} />
  </Switch>
</Router>
```

**After (v6):**
```js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

<Router>
  <Routes>
    <Route path='/l/:id' element={<App />} />
    <Route path='/' element={<App />} />
  </Routes>
</Router>
```

### 2. Migrate SortableList from withRouter to useParams

**Before (v5):**
```jsx
import { withRouter } from 'react-router'
import ReactRouterPropTypes from 'react-router-prop-types'

export const SortableList = withRouter(
  class SortableList extends React.Component {
    static propTypes = {
      match: ReactRouterPropTypes.match
    }
    componentDidMount() {
      if (this.props.match.params && this.props.match.params.id) {
        this.props.fetchList(this.props.match.params.id)
      }
    }
    render() { /* ... */ }
  }
)
```

**After (v6):**
```jsx
import { useParams } from 'react-router-dom'
import { useEffect } from 'react'

export const SortableList = (props) => {
  const { id } = useParams()

  useEffect(() => {
    if (id) {
      props.fetchList(id)
    }
  }, [id])

  return (
    <div className="items">
      <Sortable
        shoppingItems={props.shoppingItems}
        pressDelay={500}
        onCollected={props.collectedItem}
        onRemove={props.removeItem}
        onSortEnd={props.onSortEnd}
      />
    </div>
  )
}
```

Note: SortableList is still a class component with `react-sortable-hoc`. If converting to functional component here creates issues with `SortableContainer`, keep it as a class and use a wrapper component that passes `useParams()` result as a prop. Full functional conversion happens in Phase 6.

### 3. Remove react-router-prop-types
```bash
npm uninstall react-router-prop-types
```

## Risks

- **Route matching changes:** v6 uses exact matching by default (v5 required `exact` prop). Our routes `/` and `/l/:id` should work fine since the more specific route is listed first.
- **SortableList + withRouter removal:** The class component uses `componentDidMount` which needs the router params. If keeping as class component, create a thin wrapper that passes `useParams()` as props.
- **No other router usage:** Verified that only `index.js` and `SortableList.jsx` use React Router.

## Verification

- Navigate to `http://localhost:3000/` — main app loads
- Navigate to `http://localhost:3000/l/some-id` — shared list route triggers fetch
- All 41 E2E tests pass (including shared list tests)
- All unit tests pass
