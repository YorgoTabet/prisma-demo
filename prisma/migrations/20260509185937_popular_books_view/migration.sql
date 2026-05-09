/*
  
  View to show top rated books with an average rating above 4.0, ordered by average rating in descending order.

*/
CREATE OR REPLACE VIEW "PopularBooks" AS
SELECT b.id AS "bookId", a.name AS "authorName", b.title, p.name AS "publisherName", ratings."averageRating"
FROM "Book" b
JOIN "Author" a ON b."authorId" = a.id
LEFT JOIN "Publisher" p ON b."publisherId" = p.id
JOIN (
  SELECT r."bookId", AVG(r."rating") AS "averageRating"
  FROM "Review" r
  GROUP BY r."bookId"
  HAVING AVG(r."rating") > 4.0
) AS ratings ON b.id = ratings."bookId"
ORDER BY ratings."averageRating" DESC;

