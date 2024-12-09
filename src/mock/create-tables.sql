-- Drop existing tables to avoid conflicts
DROP TABLE IF EXISTS users CASCADE;

DROP TABLE IF EXISTS wallets CASCADE;

DROP TABLE IF EXISTS history CASCADE;

DROP TABLE IF EXISTS transactions CASCADE;

DROP TABLE IF EXISTS messages CASCADE;

DROP TABLE IF EXISTS chat CASCADE;

-- Create Users table
CREATE TABLE wallets (
    id VARCHAR(255) NOT NULL,
    balance double precision,
    wallet VARCHAR(255),
    CONSTRAINT wallets_pkey PRIMARY KEY (id)
);

CREATE TABLE users (
    id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    wallet_id VARCHAR(255),
    is_verify boolean,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_walletid_fkey FOREIGN KEY (wallet_id) REFERENCES wallets (id)
);

-- Create history table 
CREATE TABLE history (
    id VARCHAR(255) NOT NULL,
    amount double precision,
    action VARCHAR(255) NOT NULL,
    wallet_id VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    date VARCHAR(255) NOT NULL,
    card VARCHAR(255),
    wallet VARCHAR(255),
    comment VARCHAR(255),
    transact_id VARCHAR(255),
    CONSTRAINT history_pkey PRIMARY KEY (id)
);

-- Create transactions table with a foreign key to history table
CREATE TABLE transactions (
    id VARCHAR(255) NOT NULL,
    reciever_id VARCHAR(255) NOT NULL,
    sender_id VARCHAR(255) NOT NULL,
    amount double precision,
    status VARCHAR(255),
    CONSTRAINT transactions_pkey PRIMARY KEY (id)
);

-- Create chat table with a foreign key to user table
CREATE TABLE chat (
    chat_id VARCHAR(255) NOT NULL,
    user1_id VARCHAR(255) NOT NULL,
    user2_id VARCHAR(255) NOT NULL,
    last_message_id VARCHAR(255),
    CONSTRAINT chat_pkey PRIMARY KEY (chat_id),
    CONSTRAINT chat_user1_id_user2_id_key UNIQUE (user1_id, user2_id),
    CONSTRAINT chat_user1_id_fkey FOREIGN KEY (user1_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT chat_user2_id_fkey FOREIGN KEY (user2_id) REFERENCES users (id) ON DELETE CASCADE
);

-- -- Create message table with a foreign key to user table
CREATE TABLE messages (
    message_id VARCHAR(255) NOT NULL,
    text text NOT NULL,
    send_date VARCHAR(255) NOT NULL,
    chat_id VARCHAR(255) NOT NULL,
    sender_id VARCHAR(255) NOT NULL,
    CONSTRAINT messages_pkey PRIMARY KEY (message_id),
    CONSTRAINT messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES chat (chat_id) ON DELETE CASCADE
);

INSERT INTO
    wallets (id, balance, wallet)
VALUES
    (
        '3duz69tsqvfskpgrwq0x',
        '1000',
        '4798811485900948'
    ),
    (
        'n9fvcw6wglc34i6je1p2',
        '50',
        '2849708795244879'
    ),
    (
        '7m1w50j6spc24bg5za92',
        '0',
        '3449231059191161'
    );

-- Insert mock data to user table
INSERT INTO
    users (id, email, password, wallet_id, is_verify)
VALUES
    (
        '3p1ckdk20tsr5nhozu45',
        'bkolodiy2001@gmail.com',
        '$2b$10$cHTzQjXeEiqIxEW0/Sh1vOXVtfp/LfYL5nGQ7jBRrE3peRL3ZvBA.',
        '3duz69tsqvfskpgrwq0x',
        True
    ),
    (
        'k7oilq4nabo6d58pbo1y',
        'dsfds@gmail.com',
        '$2b$10$DjDGO/RbdbN7xFIX5sd0LuQKQKqj38rOuLMVBIDWtRrDR5WXAmUm6',
        'n9fvcw6wglc34i6je1p2',
        True
    ),
    (
        'xn22vjo65ano1zsi2clw',
        'bkolodiy20013@gmail.com',
        '$2b$10$/PX6nJNA1R/qowGOYl2evuHMP.pyXZO94op7XIBoWIhU7lNcEviaK',
        '7m1w50j6spc24bg5za92',
        True
    );

-- Insert mock data to history table
-- Insert mock data to transaction table
INSERT INTO
    transactions(id, reciever_id, sender_id, amount, status)
VALUES
    (
        '8dem7ap68z1yo9nlo9rq',
        'tl5rbw8v75xm2ntuymkj',
        'tawc7kvk5duupoq0jkr7',
        '10',
        'Revert'
    ),
    (
        'v9injjyauq7shgpbwohe',
        '8jx9hfk3subcytlei39s',
        'jvx41pm9jqj4aaoyfwxs',
        '10',
        'Success'
    );

INSERT INTO
    chat(
        chat_id,
        user1_id,
        user2_id,
        last_message_id
    )
VALUES
    (
        'fclxkngk5xi6oysbjfso',
        '3p1ckdk20tsr5nhozu45',
        'k7oilq4nabo6d58pbo1y',
        'bw8h3cj6okkp0f2sarxi'
    );

INSERT INTO
    messages(
        message_id,
        text,
        send_date,
        chat_id,
        sender_id
    )
VALUES
    (
        '2cdr2tdydyjem3ndoea2',
        'Hi',
        '9/10/2024, 1:09:06 PM',
        'fclxkngk5xi6oysbjfso',
        'k7oilq4nabo6d58pbo1y'
    ),
    (
        'bw8h3cj6okkp0f2sarxi',
        'What`s up',
        '9/10/2024, 1:09:14 PM',
        'fclxkngk5xi6oysbjfso',
        '3p1ckdk20tsr5nhozu45'
    );