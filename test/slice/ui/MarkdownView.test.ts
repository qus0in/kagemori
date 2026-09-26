import '../../helpers/registerTsx.ts'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const { MarkdownView } = await import('../../../src/ui/components/common/MarkdownView.tsx')
const render = (content?: string) => renderToStaticMarkup(createElement(MarkdownView, { content }))
const escape = (text: string) => renderToStaticMarkup(createElement('span', null, text)).slice(6, -7)

describe('[Slice / UI] Feature: MarkdownView Korean emphasis', () => {
  describe('Scenario: Punctuation touches Korean text', () => {
    for (const term of [
      "'원화로 표시된 양도성 예금증서(CD)'", '양도성 예금증서(CD)',
      '“양도성 예금증서(CD)”', '「양도성 예금증서」', '[양도성 예금증서]',
      '수익률(3.5%)', '주의!',
    ]) {
      for (const [prefix, suffix] of [['', ''], ['', '는'], ['상품은', '입니다']]) {
        it(`Given ${term} with adjacent Korean, When rendered, Then preserves text and bold`, () => {
          assert.ok(render(`${prefix}**${term}**${suffix}`).includes(
            `<p>${prefix}<strong>${escape(term)}</strong>${suffix}</p>`,
          ))
        })
      }
    }
    it('Given italic and nested emphasis, When rendered, Then preserves nesting', () => {
      assert.ok(render('*예금(CD)*는').includes('<em>예금(CD)</em>는'))
      assert.ok(render('***예금(CD)***는').includes('<em><strong>예금(CD)</strong></em>는'))
    })
    it('Given several emphasized terms, When rendered, Then keeps each boundary', () => {
      assert.ok(render('**예금(CD)**와 **채권(Bond)**는').includes(
        '<strong>예금(CD)</strong>와 <strong>채권(Bond)</strong>는',
      ))
    })
  })

  describe('Scenario: Existing Markdown semantics remain intact', () => {
    it('Given code spans and fenced code, When rendered, Then leaves asterisks literal', () => {
      const literal = '**예금(CD)**는'
      assert.ok(render('`' + literal + '`').includes(`<code>${literal}</code>`))
      assert.ok(render('```text\n' + literal + '\n```').includes(`${literal}\n</code></pre>`))
    })
    it('Given escaped or unmatched delimiters, When rendered, Then leaves them literal', () => {
      assert.ok(render('\\*\\*예금(CD)\\*\\*는').includes('<p>**예금(CD)**는</p>'))
      assert.ok(render('**예금(CD)는').includes('<p>**예금(CD)는</p>'))
    })
    it('Given headings, lists, links and English, When rendered, Then retains their structure', () => {
      const html = render('### 핵심\n\n- **예금(CD)**는 [참고](https://example.com)\n\n**bold** and *italic*')
      assert.ok(html.includes('<h3>핵심</h3>'))
      assert.ok(html.includes('<li><strong>예금(CD)</strong>는 <a href="https://example.com">참고</a></li>'))
      assert.ok(html.includes('<strong>bold</strong> and <em>italic</em>'))
    })
    it('Given raw HTML and unsafe links, When rendered, Then never enables executable HTML', () => {
      const html = render('<img src=x onerror=alert(1)>\n\n[위험](javascript:alert%281%29)')
      assert.ok(!html.includes('<img'))
      assert.ok(!html.includes('href="javascript:'))
    })
    it('Given empty content, When rendered, Then emits nothing', () => {
      assert.equal(render(), '')
      assert.equal(render(' \r\n '), '')
    })
    it('Given trailing whitespace, When rendered, Then uses normalized content', () => {
      assert.ok(render('\r\n**예금**\r\n   ').includes('<p><strong>예금</strong></p>'))
    })
  })
})
