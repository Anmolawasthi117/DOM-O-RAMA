import type { VNode } from '../core/engine/VDOMSimulator';

interface CompileResult {
  success: boolean;
  vnode?: VNode;
  error?: string;
}


// Simple parser that converts JSX-like syntax to VNode
// This is a fallback when Babel isn't available
function simpleJSXParser(code: string): VNode | null {
  try {
    // Extract the App function body
    const appMatch = code.match(/function\s+App\s*\(\s*\)\s*\{[\s\S]*?return\s*\(([\s\S]*?)\);\s*\}/);
    if (!appMatch) return null;

    const jsx = appMatch[1].trim();
    return parseJSXElement(jsx);
  } catch {
    return null;
  }
}

function parseJSXElement(jsx: string): VNode | null {
  // Match opening tag
  const tagMatch = jsx.match(/^<(\w+)([^>]*)>([\s\S]*)<\/\1>$/);
  if (!tagMatch) {
    // Check for self-closing tag
    const selfClosing = jsx.match(/^<(\w+)([^/]*)\/\s*>$/);
    if (selfClosing) {
      return { tag: selfClosing[1], props: parseProps(selfClosing[2]) };
    }
    // Plain text
    const text = jsx.trim();
    if (text) {
      return { tag: 'text', text };
    }
    return null;
  }

  const [, tagName, propsStr, content] = tagMatch;
  const children = parseChildren(content);

  return {
    tag: tagName,
    props: parseProps(propsStr),
    children: children.length > 0 ? children : undefined
  };
}

function parseProps(propsStr: string): Record<string, any> {
  const props: Record<string, any> = {};
  const matches = propsStr.matchAll(/(\w+)=["']([^"']*)["']/g);
  for (const match of matches) {
    props[match[1]] = match[2];
  }
  return Object.keys(props).length > 0 ? props : {};
}

function parseChildren(content: string): VNode[] {
  const children: VNode[] = [];
  const trimmed = content.trim();

  // Simple regex to find child elements
  const elementRegex = /<(\w+)[^>]*>[\s\S]*?<\/\1>|<(\w+)[^/]*\/>|([^<]+)/g;
  let match;

  while ((match = elementRegex.exec(trimmed)) !== null) {
    const fullMatch = match[0].trim();
    if (!fullMatch) continue;

    if (fullMatch.startsWith('<')) {
      const child = parseJSXElement(fullMatch);
      if (child) children.push(child);
    } else {
      // Text content
      const text = fullMatch.trim();
      if (text && !text.match(/^[\s\n]*$/)) {
        children.push({ tag: 'text', text });
      }
    }
  }

  return children;
}

export async function compileJSXToVNode(code: string): Promise<CompileResult> {
  try {
    // First try simple parser (no Babel dependency)
    const parsed = simpleJSXParser(code);

    if (parsed) {
      return { success: true, vnode: parsed };
    }

    return {
      success: false,
      error: 'Could not parse JSX. Make sure you have a valid App function.'
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

// Template code for different frameworks
export const frameworkTemplates = {
  react: `// React Component
function App() {
  return (
    <div className="app">
      <h1>Hello React!</h1>
      <p>Edit this JSX to see changes</p>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ul>
      <button>Click Me</button>
    </div>
  );
}`,

  vue: `// Vue-style Template
function App() {
  return (
    <template>
      <div class="app">
        <h1>Hello Vue!</h1>
        <p>Compiler optimized</p>
        <ul>
          <li>Static hoisting</li>
          <li>Patch flags</li>
        </ul>
        <button>Click Me</button>
      </div>
    </template>
  );
}`,

  svelte: `// Svelte Component
function App() {
  return (
    <main>
      <h1>Hello Svelte!</h1>
      <p>No Virtual DOM</p>
      <ul>
        <li>Compile time</li>
        <li>Direct updates</li>
      </ul>
      <button>Click Me</button>
    </main>
  );
}`,

  solid: `// SolidJS Component
function App() {
  return (
    <div class="app">
      <h1>Hello Solid!</h1>
      <p>Fine-grained reactivity</p>
      <ul>
        <li>Signals</li>
        <li>Surgical updates</li>
      </ul>
      <button>Click Me</button>
    </div>
  );
}`,

  qwik: `// Qwik Component
function App() {
  return (
    <main>
      <h1>Hello Qwik!</h1>
      <p>Resumable by default</p>
      <ul>
        <li>Lazy loading</li>
        <li>Zero hydration</li>
      </ul>
      <button>Click to Resume</button>
    </main>
  );
}`
};
