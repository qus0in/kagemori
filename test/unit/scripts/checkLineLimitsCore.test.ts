import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  inspectFileContent,
  summarizeInspection,
  getRefactoringSuggestions,
} from '../../../scripts/line-limits-core.ts';

describe('[Unit / Scripts] Feature: LineLimitsCore', () => {
  describe('Scenario: Inspecting files within limits', () => {
    it('Given a source file under 128 lines, When inspected, Then flags no violations', () => {
      // Given
      const content = 'line\n'.repeat(50);
      const filePath = 'src/domain/models/Sample.ts';

      // When
      const result = inspectFileContent(filePath, content);

      // Then
      assert.equal(result.lineCount, 51);
      assert.equal(result.isHardViolation, false);
      assert.equal(result.isSoftViolation, false);
      assert.equal(result.suggestions.length, 0);
    });
  });

  describe('Scenario: Inspecting source file exceeding 128 lines', () => {
    it('Given a src component over 128 lines, When inspected, Then flags soft violation and suggests refactoring', () => {
      // Given
      const content = 'line\n'.repeat(130);
      const filePath = 'src/ui/components/BigComponent.tsx';

      // When
      const result = inspectFileContent(filePath, content);

      // Then
      assert.equal(result.isSoftViolation, true);
      assert.equal(result.isHardViolation, false);
      assert.ok(result.suggestions.length > 0);
      assert.ok(result.suggestions.some((s) => s.includes('presentational subcomponents')));
    });

    it('Given a usecase over 128 lines, When inspected, Then suggests usecase decomposition', () => {
      // Given
      const content = 'line\n'.repeat(150);
      const filePath = 'src/app/usecases/BigUseCase.ts';

      // When
      const result = inspectFileContent(filePath, content);

      // Then
      assert.equal(result.isSoftViolation, true);
      assert.ok(result.suggestions.some((s) => s.includes('orchestration helper')));
    });
  });

  describe('Scenario: Inspecting file exceeding 1000 lines', () => {
    it('Given any file exceeding 1000 lines, When inspected, Then flags hard violation', () => {
      // Given
      const content = 'line\n'.repeat(1005);
      const filePath = 'test/integration/HugeTest.test.ts';

      // When
      const result = inspectFileContent(filePath, content);

      // Then
      assert.equal(result.isHardViolation, true);
      assert.ok(result.suggestions.length > 0);
    });
  });

  describe('Scenario: Summarizing inspection results', () => {
    it('Given hard violations exist, When summarized, Then flags hasErrors as true', () => {
      // Given
      const mockResults = [
        {
          filePath: 'fileA.ts',
          lineCount: 1050,
          isHardViolation: true,
          isSoftViolation: false,
          suggestions: ['split'],
        },
      ];

      // When
      const summary = summarizeInspection(mockResults, false);

      // Then
      assert.equal(summary.hasErrors, true);
      assert.equal(summary.hardViolations.length, 1);
    });

    it('Given only soft violations exist and strict is false, When summarized, Then hasErrors is false', () => {
      // Given
      const mockResults = [
        {
          filePath: 'src/fileB.ts',
          lineCount: 150,
          isHardViolation: false,
          isSoftViolation: true,
          suggestions: ['split'],
        },
      ];

      // When
      const summary = summarizeInspection(mockResults, false);

      // Then
      assert.equal(summary.hasErrors, false);
      assert.equal(summary.softViolations.length, 1);
    });

    it('Given soft violations exist and strict is true, When summarized, Then hasErrors is true', () => {
      // Given
      const mockResults = [
        {
          filePath: 'src/fileB.ts',
          lineCount: 150,
          isHardViolation: false,
          isSoftViolation: true,
          suggestions: ['split'],
        },
      ];

      // When
      const summary = summarizeInspection(mockResults, true);

      // Then
      assert.equal(summary.hasErrors, true);
    });
  });
});
