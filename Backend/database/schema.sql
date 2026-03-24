CREATE TABLE users(
id SERIAL PRIMARY KEY,
email TEXT,
password TEXT
);

CREATE TABLE laws(
id SERIAL PRIMARY KEY,
title TEXT,
content TEXT
);

CREATE TABLE cases(
id SERIAL PRIMARY KEY,
user_id INT,
facts TEXT,
status TEXT
);

CREATE TABLE documents(
id SERIAL PRIMARY KEY,
user_id INT,
type TEXT,
content TEXT
);