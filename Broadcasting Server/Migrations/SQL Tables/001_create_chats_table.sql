CREATE TABLE chats(
    socketid TEXT,
    username TEXT,
    message TEXT
    created_at TIMESTAMP DEFAULT now()
);