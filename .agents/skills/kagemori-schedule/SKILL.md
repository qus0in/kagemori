---
name: kagemori-schedule
description: Reference and maintain the 47th Certified Investment Manager exam schedule, Asia/Seoul timezone rules, and D-day calculation semantics.
---

# Kagemori Schedule Domain

Use this skill when modifying, inspecting, or testing schedule dates, calendar calculations, or D-day semantics for the 47th Certified Investment Manager (투자자산운용사) exam.

## Official Schedule Source

Source: [금융투자협회 자격시험센터](https://license.kofia.or.kr)
ADR Reference: [ADR 0001](../../../docs/adr/0001-investment-manager-dday.md)

| Key | Event Name | Target Date | Display Label |
| :--- | :--- | :--- | :--- |
| `registration` | 원서접수 | `2026-10-12` | 접수 시작 |
| `exam` | 시험 | `2026-11-08` | 시험일 |

## Calculation Rules

1. **Strict Asia/Seoul Baseline**:
   - Always determine current date in `Asia/Seoul` (`YYYY-MM-DD`).
   - Visitor local machine time zones must NEVER influence calendar day difference.
2. **Pure Calendar Day Difference**:
   - Compute day difference using calendar dates without time-of-day offsets.
   - Do NOT parse date-only strings into local midnight.
3. **Display Semantics**:
   - Before target: `D-N` (e.g. `D-18`)
   - On target date: `D-Day`
   - After target date: `D+N` (e.g. `D+1`)
4. **Auto-rollover**:
   - Refresh state automatically at midnight Korean Standard Time.
