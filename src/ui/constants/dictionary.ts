// src/ui/constants/dictionary.ts
import { commonDict } from './dict/commonDict.ts'
import { catalogDict } from './dict/catalogDict.ts'
import { studyDict } from './dict/studyDict.ts'

export const DICTIONARY = {
  ...commonDict,
  catalog: catalogDict,
  study: studyDict,
} as const
