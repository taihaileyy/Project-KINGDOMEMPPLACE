# Paradise: where the game plugs in

The `/paradise` page is finished; only the game itself is missing.

- `game-stage.tsx`: the frame (size, shape, border, glow). On phones it is a tall
  4:5 panel; from 640px up it is 16:9. Anything placed inside should fill it
  (`absolute inset-0` / `size-full`). The frame also has `id="paradise-stage"`.
- `paradise-game.tsx`: **the integration point.** Set `mode` to `"iframe"` and
  fill in `iframeSrc`, or to `"component"` and return your React component.
  Leave it as `"placeholder"` to keep the "Coming Soon" panel.
- `paradise-art.tsx`: decorative Garden of Eden artwork used by the page and the
  homepage teaser.

Notes: if the game is an iframe on another domain, nothing else is needed. If it
needs a different aspect ratio, change the `aspect-*` classes in `GameStage`.
