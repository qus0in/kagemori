import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { validateStructuredDiagram, diagramImageKey } from '../../../src/domain/models/DiagramContent.ts'

describe('[Unit / Domain] Feature: Structured diagram validation', () => {
  it('Given allow-listed Mermaid in a code fence, When validated, Then strips the fence and keeps the code', () => {
    const result = validateStructuredDiagram({ kind: 'mermaid', code: '```mermaid\nflowchart TD\n  A["위험"] --> B["베타(β)"]\n```' })
    assert.deepEqual(result, { kind: 'mermaid', code: 'flowchart TD\n  A["위험"] --> B["베타(β)"]' })
    assert.ok(validateStructuredDiagram({ kind: 'mermaid', code: 'xychart-beta\n  x-axis [1, 2]\n  line [1, 2]' }))
  })

  it('Given unsafe or unsupported Mermaid, When validated, Then rejects it', () => {
    for (const code of [
      "%%{init: {'securityLevel':'loose'}}%%\nflowchart TD\n A-->B",
      'flowchart TD\n A-->B\n click A callback',
      'flowchart TD\n A["<script>x</script>"]',
      'sequenceDiagram\n A->>B: hi',
      '',
    ]) assert.equal(validateStructuredDiagram({ kind: 'mermaid', code }), null, code)
  })

  it('Given GFM tables, When validated, Then requires a header separator row', () => {
    assert.ok(validateStructuredDiagram({ kind: 'table', markdown: '| 구분 | 체계적 |\n| :--- | ---: |\n| 보상 | 있음 |' }))
    assert.equal(validateStructuredDiagram({ kind: 'table', markdown: '| 구분 | 체계적 | | --- | --- |' }), null)
    assert.equal(validateStructuredDiagram({ kind: 'table', markdown: '표 없음' }), null)
  })

  it('Given a model and question version, When building the image key, Then scopes the R2 object by both', () => {
    assert.equal(diagramImageKey('gemini-3.1-flash-image', 'q-1', 2), 'diagrams/gemini-3.1-flash-image/q-1/v2')
  })
})
