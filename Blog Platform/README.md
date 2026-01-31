# Weather API

Created project from roadmap.sh backend projects

## Setup

### Server

Ensure to create a database by the name, blogs

1. Create a .env file and include the field

```bash
    POSTGRES_USER=<Postgres username here>
    POSTGRES_PASSWORD=<your password here>
```

2. To start the server, ensure you are at the root folder, not blog platform folder and do

```bash
    npx tsx --watch ./Blog\ Platform/Server/Server.ts
```

### Client

1. Install all necessary modules

```bash
    npm i -g
```

2. Execute

```bash
    npm run dev
```

![A showcase image of the website](./Client/Page-showcase.png?raw=true "Title")
