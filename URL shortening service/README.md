# URL Shortening service

## Setup

### Server

- To run the server you need a .env file in the Config folder defining

```bash
    POSTGRES_USERNAME=""
    POSTGRES_PASSWORD=""
    POSTGRES_DB=""
    PORT=""
```

- Once theyre defined simply do a

```bash
    npm run migrate
```

- This is to create the necessary tables needed

- After this setup simply do a

```bash
    npx tsx --watch Server.ts
```

The server is good to go

### Client

Its a Next.js setup here
To run it just do a

```bash
    npm run dev
```

and ur ready to go

This project is inspired by roadmap.sh. Check it out if you have the time.
