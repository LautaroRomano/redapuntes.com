CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    accountname varchar(250) null,
    password_hash VARCHAR(255) NOT NULL,
    img varchar(500) NULL,
    about varchar(1000) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    tags TEXT[] null,
    university_id INT REFERENCES universities(university_id),
    career_id INT REFERENCES careers(career_id),
    tsv tsvector,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE post_likes (
    like_id SERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(post_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(post_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pdf_files (
    pdf_id SERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(post_id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE follows (
    follow_id SERIAL PRIMARY KEY,
    follower_id INTEGER NOT NULL,
    followed_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (followed_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE (follower_id, followed_id)
);

CREATE TABLE contents (
    content_id SERIAL PRIMARY KEY,
    key varchar(80),
    label varchar(80),
    UNIQUE (key)
);

CREATE TABLE universities (
    university_id SERIAL PRIMARY KEY,
    name varchar(250),
    UNIQUE (name)
);

CREATE TABLE careers (
    career_id SERIAL PRIMARY KEY,
    university_id INTEGER NOT NULL,
    name varchar(250),
    FOREIGN KEY (university_id) REFERENCES universities(university_id) ON DELETE CASCADE,
    UNIQUE (name)
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_pdf_files_post_id ON pdf_files(post_id);
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX posts_tsv_idx ON posts USING gin(tsv);


CREATE OR REPLACE FUNCTION update_tsvector_column() RETURNS TRIGGER AS $$
BEGIN
  NEW.tsv := to_tsvector('spanish', NEW.content);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION update_tsvector_column();

INSERT INTO contents (key,label) VALUES
('Anuncio','Anuncio'),
('Pregunta','Pregunta'),
('Teoria','Teoria'),
('Trabajos practicos','Trabajos practicos'),
('Parciales','Parciales'),
('Finales','Finales');

INSERT INTO universities (name) VALUES
('Universidad Tecnologica Nacional'),
('Universidad Nacional Tucuman');

INSERT INTO careers (university_id, name) VALUES
(1, 'Ing. Sistemas de Informacion'),
(1, 'Ing. Civil'),
(1, 'Ing. Electrica'),
(1, 'Ing. Electronica'),
(1, 'Ing. Mecanica');

INSERT INTO careers (university_id, name) VALUES
(2, 'Abogacia'),
(2, 'Administracion'),
(2, 'Contador Publico'),
(2, 'Licenciatura en Economia'),
(2, 'Medicina'),
(2, 'Psicologia');

--Aqui comienza la actualizacion de la IA

CREATE TABLE files_ia (
    file_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    text TEXT,
    name varchar(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cuestionarios (
    cuestionario_id SERIAL PRIMARY KEY,
    file_id INT REFERENCES files_ia(file_id) ON DELETE CASCADE,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mind_maps (
    mind_id SERIAL PRIMARY KEY,
    file_id INT REFERENCES files_ia(file_id) ON DELETE CASCADE,
    edges JSONB,
    nodes JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE flashCars (
    flash_card_id SERIAL PRIMARY KEY,
    file_id INT REFERENCES files_ia(file_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cards (
    card_id SERIAL PRIMARY KEY,
    flash_card_id INT REFERENCES flashCars(flash_card_id) ON DELETE CASCADE,
    front text,
    back text,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stars (
    star_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    used boolean DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP 
);

CREATE TABLE missions (
    mission_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    type varchar(150),
    amount int,
    final_amount int,
    completed boolean DEFAULT false,
    reclaimed boolean DEFAULT false,
    expiration date,
    mission_text varchar(250);
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP 
);

