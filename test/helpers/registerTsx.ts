import { readFileSync } from 'node:fs'
import { registerHooks } from 'node:module'
import { transpileModule, ModuleKind, JsxEmit } from 'typescript'

// Keep the Node test runner while rendering the same TSX components used by Vite.
registerHooks({
  load(url, context, nextLoad) {
    if (!url.startsWith('file:') || !url.endsWith('.tsx')) return nextLoad(url, context)
    const { outputText } = transpileModule(readFileSync(new URL(url), 'utf8'), {
      fileName: new URL(url).pathname,
      compilerOptions: { module: ModuleKind.ESNext, jsx: JsxEmit.ReactJSX },
    })
    return { format: 'module', source: outputText, shortCircuit: true }
  },
})
