# Extended Mindmap Syntax Support

---

## Line/Branch Styles

```mindmap
Machine Learning
- Supervised Learning
  - Classification               %% Standard solid line (default)
  -. Feature Engineering           %% Dotted line (weak relationship/optional)
```

| Syntax | Line Style | Semantics                          |
| ------ | ---------- | ---------------------------------- |
| `-`    | Dotted     | Standard parent-child relationship |
| `-.`   | Dotted     | Weak association / Optional / TBD  |

---

## Multi-line Node Content

```mindmap
Machine Learning
- Supervised Learning
  - Classification
    | **Definition**: Mapping inputs to discrete categories.
    | **Input**: Feature vector X
    | **Output**: Class label Y
  - Regression
    | Continuous output values.
    | Commonly used for prediction scenarios.
```

Lines starting with `|` are appended to the content of the preceding node and rendered as multi-line text within that node.

**Difference from `>` Remarks:**

| Syntax    | Display Mode    | Purpose                                               |
| --------- | --------------- | ----------------------------------------------------- |
| `> text`  | Tooltip / Hover | Supplementary notes; space-saving                     |
| `\| text` | In-node display | Used when the node itself requires multi-line content |

---

## Tags

Use `#tag` to label nodes for easy filtering and categorization:

```mindmap
Tech Stack
- React #frontend #javascript
  - Next.js #framework #ssr
  - Redux #state-management
- Python #backend #ml
  - FastAPI #framework
  - PyTorch #ml #deep-learning
- PostgreSQL #database #backend
```

Tags are rendered as small badges on the node and support filtering or highlighting.

---

## Cross-node Connections (Cross-link)

Use `{#id}` to define node anchors and `-> {#id}` to create cross-branch connections:

```mindmap
System Architecture
- Frontend {#frontend}
  - React
  - API Call -> {#api-gateway}
- Backend
  - API Gateway {#api-gateway}
    - REST
    - GraphQL
  - Data Processing
    - ETL Pipeline -> {#data-warehouse}
- Data Layer
  - Data Warehouse {#data-warehouse}
  - Cache -> {#frontend}
```

Optional annotated connections:

```
- API Call -> {#api-gateway} "HTTP/REST"
```

These are rendered as curved lines or dashed arrows between nodes, accompanied by text labels.

---

## Folding Markers (Effective in Read-only Mode)

Use `+` instead of `-` to indicate that a node is collapsed by default (hiding its child nodes):

```mindmap
Project Structure
- src/
  - components/
    - Button.tsx
    - Modal.tsx
  + utils/          <!-- Collapsed by default -->
    - format.ts
    - validate.ts
  + hooks/           <!-- Collapsed by default -->
    - useAuth.ts
    - useFetch.ts
- README.md
```

- `-` = Expanded (default)
- `+` = Collapsed (click to expand)

---

## Formula Support (LaTeX)

Technical mindmaps often require mathematical formulas:

```mindmap
Loss Functions
- MSE
  | $L = \frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2$
- Cross Entropy
  | $L = -\sum_{i} y_i \log(\hat{y}_i)$
- KL Divergence
  | $D_{KL}(P \| Q) = \sum P(x) \log\frac{P(x)}{Q(x)}$
```

Supports inline formulas with `$...$`, same-line display formulas with `$$...$$`, and standard multi-line display formulas:

```mindmap
- CPU execution time
  $$
  CPU execution time = \frac{instruction count \times CPI}{frequency}
  $$
```

The LaTeX plugin uses locally bundled MathJax to generate self-contained SVG paths, so formulas remain available in SVG and PNG exports without a CDN or external math fonts. The React ref PNG export waits for formula rendering and layout to finish; invalid formulas reject the export instead of silently exporting the source text.

Inline formulas cannot cross lines. A multi-line display formula is attached to the preceding mindmap node; its outer blank lines are removed while internal line breaks are preserved. Fenced code blocks and inline code are not parsed as formulas.

---

## Global Configuration (Front Matter)

Controls the overall behavior and styling of the mindmap.

```mindmap
---
direction: right       # right | left | both
theme: auto         # auto | light | dark
---

Machine Learning
- Supervised Learning
- Unsupervised Learning
```

**`direction`** Description:

```
          left ←  [Root]  → right

          ← [Root] →          (both: Classic dual-sided expansion)
         /          \
      left1        right1
      left2        right2
```

---

## Desktop XMind Export

The Electron desktop workspace can export the current Markdown-derived node tree as an XMind 2020+ file. This is a desktop-only capability; it is not part of the public `@xiangfa/mindmap` API.

| Markdown or mindmap data | XMind output | Notes |
| --- | --- | --- |
| Multiple root trees | Separate XMind sheets | Each root becomes one sheet |
| Node text | Topic title | Inline visual formatting is removed; math delimiters and code-span backticks are preserved to prevent formula misclassification |
| `[text](url)` | Topic hyperlink | The first link in a topic is used |
| `![alt](path)` | Topic image | The first image in a topic is used |
| `> remark` and `\| continuation` | Topic note | Both forms are combined into the XMind note |
| `#tag` | XMind label | Labels remain separate from topic text |
| `[ ]`, `[-]`, `[x]` | XMind task progress | Todo, in-progress, and done states are mapped |
| `+` folding marker | Folded topic | The persisted collapsed state is exported |

On import, complete standalone `$$...$$` blocks in topic notes become formula follow-lines; other note text stays in remarks. Legacy titles without math delimiters receive conservative, import-only recovery for recognizable TeX commands and powers, with a warning to review the inferred formulas. Existing math, code spans, links and URLs are not inferred. Ambiguous expressions can remain plain text. Formula topics with hyperlinks use a separate `↗` link so the formula is not swallowed by a Markdown link label.

Preserved math delimiters support this application's export/import cycle; they do not create native XMind Equation objects.

The export is structure-oriented rather than a screenshot of the current canvas. CSS themes, the current left/right/balanced layout, dotted-line styling, cross-links, frontmatter visual options, and LaTeX visual glyphs are not guaranteed to round-trip to XMind. Use SVG or PNG when preserving the rendered appearance is the priority.
