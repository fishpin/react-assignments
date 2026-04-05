# Summary

Based on the instructions and the rubric guidelines, I used React Testing Library to test my build and DevTools in Chrome to check for bugs. After identifying and implementing fixes for 3 different bugs, I improved the responsiveness and accessibility of the website.

---

## Dependencies Installed

- **Vitest** — The test runner.
- **@vitest/coverage-v8** — Generates a coverage report showing which lines of code are covered by tests.
- **@testing-library/react** — Provides `render()`, `screen`, `fireEvent` etc. to render React components in a fake DOM and query what's on screen.
- **@testing-library/jest-dom** — Adds useful matchers like `toBeInTheDocument()`, `toHaveTextContent()`, `toBeDisabled()` to the test assertions.
- **@testing-library/user-event** — Simulates real user interactions (typing, clicking) more accurately than the basic `fireEvent`. Used for testing the search input.
- **jsdom** — A JavaScript implementation of the browser DOM. Vitest runs in Node, not a browser, and jsdom gives it a fake `document`, `window`, etc. so components can render.

## Config Changes

- **vite.config.js** — Add a test block telling Vitest to use jsdom and auto-import the jest-dom matchers.
- **src/test/setup.js** (new file) — Runs before every test file. Imports the jest-dom matchers so things like `expect(...).toBeInTheDocument()` can be used.
- **package.json** — Add test script.

## Mocked Elements

- **fetch** — Tests don't make real network calls to TMDB. We mock fetch to return fake movie data so tests are fast and deterministic.
- **react-router-dom** — Components use `useNavigate` and `useParams`. I mock the entire module so no real router code runs, which avoids React instance conflicts.
- **import.meta.env.VITE_TMDB_KEY** — Vitest automatically loads `.env.test`, which provides a dummy key value. Since fetch is fully mocked, the actual key value doesn't matter. This just prevents the variable from being undefined at import time.

## Tests Written (33 across 3 files)

- **LandingPage (5 tests)** — Title, tagline, button render, navigation timing with fake timers.
- **HomePage (12 tests)** — Loading state, movie cards, genre pills, search input, error state, card navigation, clear button, pagination visibility and disabled state.
- **MovieDetailPage (16 tests)** — Loading state, all movie fields (title, tagline, rating, year, runtime, genres, overview, cast limit, director), error state, empty field fallbacks, close button, overlay click, panel click propagation stop.

## Test Structure

**1. Mock the router at the top of the file**

```js
const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))
```

**2. Mock fetch to return fake data**

```js
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve(fakeMovieData)
})
```

**3. Render the component directly**

```js
render(<HomePage />)
```

**4. Wait for async work and assert**

```js
expect(await screen.findByText('The Godfather')).toBeInTheDocument()
```

## Test Errors Encountered

- **Fake timers break findByText** — RTL's async queries use timers internally, so `vi.useFakeTimers()` deadlocks them. Only use fake timers when testing pure `setTimeout` behavior (like LandingPage's navigation delay).
- **Mock the whole module, not just hooks** — Using `importOriginal` pulls in real react-router code which causes React instance conflicts. A complete mock with just what the component needs is cleaner.
- **Genre fetch doesn't guard ok** — Discovered when the error test crashed instead of showing the error message.

## Bugs & Fixes

- Scroll bugs and the missing `ok` check on `fetchGenres` (`genres.map is not a function` error) were caught through manual testing and the Chrome DevTools console.

| Bug | File | Fix |
| --- | --- | --- |
| `fetchGenres` ignores HTTP errors | `HomePage.jsx` | Added `if (!res.ok) throw new Error(...)` to match the movies fetch |
| Background scrolls behind overlay | `MovieDetailPage.jsx` | `useEffect` sets `overflow: hidden` on mount, restores it on unmount via cleanup function |
| Page change doesn't scroll to top | `HomePage.jsx` | Effect with `[page]` dependency calls `window.scrollTo(0, 0)` on each page change |

## Performance Improvements

Using the React DevTools Profiler, I found that all `MovieCard` components were re-rendering on every search keystroke, making them candidates for memoization.

- **React.memo on MovieCard** — When query state changes during the 400ms debounce, `HomePage` re-renders but the movie list hasn't changed yet. Without memo, all cards re-render for nothing. Extracting `MovieCard` as a memoized component prevents this.
- **useCallback on event handlers** — `handleQueryChange`, `handleGenreClick`, and the card click handler are recreated on every render. Stabilising them means the memoized `MovieCard` components get the same function reference and skip re-rendering.
- **useMemo for director and cast** — These search through the full credits array on every render. Wrapping them in `useMemo` means the work only runs when `movie` actually changes.

---

## Accessibility & Responsive Changes

The layout was already fluid due to the CSS grid's `auto-fill` column behaviour, so only targeted improvements were needed:

- Added media query to adapt content for smaller screens
- Added accessible labels to buttons
- Added `aria-label` to buttons and search bar
- Added `aria-label`, `role="button"`, `tabIndex`, and keyboard (Enter key) support to movie cards
- Added `aria-pressed` to genre filters