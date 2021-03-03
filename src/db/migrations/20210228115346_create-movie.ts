import * as Knex from 'knex'


export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`    
    CREATE TABLE movie (
      id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
      name        VARCHAR(255),
      synopsis    VARCHAR(1000),
      releasedAt  DATE,
      runtime     INT(2),
      genreId     INT(10) UNSIGNED,

      CONSTRAINT PK_movie__id PRIMARY KEY (id),
      CONSTRAINT UK_movie__name UNIQUE KEY (name),
      CONSTRAINT FOREIGN KEY(genreId) REFERENCES genre(id)
    );
  `)
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw('DROP TABLE movie;')
}

