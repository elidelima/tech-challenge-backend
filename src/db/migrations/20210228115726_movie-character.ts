import * as Knex from 'knex'


export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    CREATE TABLE movie_character (
      movieId      INT(10) UNSIGNED NOT NULL,
      actorId      INT(10) UNSIGNED NOT NULL,
      name    VARCHAR(255),

      PRIMARY KEY (movieId, actorId),
      CONSTRAINT FOREIGN KEY(movieId) REFERENCES movie(id) ON DELETE CASCADE,
      CONSTRAINT FOREIGN KEY(actorId) REFERENCES actor(id) ON DELETE CASCADE
    );
  `)
  // await knex.schema.raw(`
  //   CREATE TABLE movie_character (
  //     movieId  INT(10) UNSIGNED NOT NULL REFERENCES movie(id) ON DELETE CASCADE,
  //     actorId  INT(10) UNSIGNED NOT NULL REFERENCES actor(id) ON DELETE CASCADE,
  //     name     VARCHAR(50),
  //     PRIMARY KEY (movieId, actorId)
  //   );
  // `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw('DROP TABLE movie_character;')
}

