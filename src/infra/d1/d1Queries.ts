export const OVERVIEW_BOOKS_SQL = `
  SELECT b.id, b.volume_no, b.title, b.isbn13,
         COUNT(DISTINCT p.id) as partCount,
         COUNT(DISTINCT c.id) as chapterCount
  FROM books b
  LEFT JOIN parts p ON p.book_id = b.id
  LEFT JOIN chapters c ON c.part_id = p.id
  GROUP BY b.id, b.volume_no, b.title, b.isbn13
  ORDER BY b.volume_no ASC
`
