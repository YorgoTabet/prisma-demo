import { faker } from "@faker-js/faker";

import { prisma } from "./lib/prisma";

async function main() {
  const genres = await Promise.all(
    Array.from({ length: 5 }).map(() =>
      prisma.genre.create({
        data: { name: faker.book.genre() },
      }),
    ),
  );

  const publishers = await Promise.all(
    Array.from({ length: 3 }).map(() =>
      prisma.publisher.create({
        data: { name: faker.book.publisher() },
      }),
    ),
  );

  const users = await Promise.all(
    Array.from({ length: 10 }).map(() =>
      prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: faker.internet.password(),
        },
      }),
    ),
  );

  const authors = await Promise.all(
    Array.from({ length: 4 }).map(() =>
      prisma.author.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          books: {
            create: Array.from({
              length: faker.number.int({ min: 2, max: 4 }),
            }).map(() => ({
              title: faker.book.title(),
              publisher: {
                connect: { id: faker.helpers.arrayElement(publishers).id },
              },
              genres: {
                create: faker.helpers
                  .arrayElements(genres, { min: 1, max: 3 })
                  .map((g) => ({
                    genre: { connect: { id: g.id } },
                  })),
              },
            })),
          },
        },
        include: { books: true },
      }),
    ),
  );

  const allBooks = authors.flatMap((a) => a.books);

  for (const book of allBooks) {
    await Promise.all(
      Array.from({
        length: faker.number.int({ min: 3, max: 7 }),
      }).map(() =>
        prisma.review.create({
          data: {
            rating: faker.number.int({ min: 3, max: 5 }),
            comment: faker.helpers.maybe(() => faker.lorem.sentence(), {
              probability: 0.8,
            }),
            user: {
              connect: { id: faker.helpers.arrayElement(users).id },
            },
            book: { connect: { id: book.id } },
          },
        }),
      ),
    );
  }

  console.log("Seeded:", {
    genres: genres.length,
    publishers: publishers.length,
    users: users.length,
    authors: authors.length,
    books: allBooks.length,
    bookGenres: await prisma.bookGenre.count(),
    reviews: await prisma.review.count(),
  });
}


main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
