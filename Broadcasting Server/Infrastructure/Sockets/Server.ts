import { Server, Socket } from "socket.io";
import http from "http";
import { Info, Message, Warning, Error } from "../../Utils/Logger";

export class IoServer {
  io: Server;
  users: Map<string, string> = new Map();

  constructor(httpServer: http.Server) {
    this.io = new Server(httpServer, {
      connectionStateRecovery: {},
    });

    this.io.on("connection", (socket: Socket) => {
      Info(`New connection: ${socket.id}`);

      socket.on("join", (username: string) => {
        if (
          !username ||
          typeof username !== "string" ||
          username.trim().length === 0
        ) {
          socket.emit("Username taken", "Invalid username");
          return;
        }

        const trimmed = username.trim();

        const usernameTaken = [...this.users.values()].includes(trimmed);

        if (usernameTaken) {
          Error(`Username taken: ${trimmed}`);
          socket.emit("Username taken");
          return;
        }

        this.users.set(socket.id, trimmed);
        socket.emit("Username accepted", trimmed);
        Info(`${trimmed} joined the chat`);

        // Optional: broadcast who joined
        // this.io.emit("user joined", trimmed);
      });

      socket.on("Message sent", (message: string) => {
        const username = this.users.get(socket.id);
        if (!username) {
          socket.emit("error", "You are not joined");
          return;
        }

        if (typeof message !== "string" || message.trim() === "") return;

        Message(username, message);
        socket.broadcast.emit("Receive message", {
          username,
          message: message.trim(),
        });
      });

      socket.on("disconnect", (reason) => {
        const username = this.users.get(socket.id);
        if (username) {
          Warning(`${username} disconnected (${reason})`);
          this.users.delete(socket.id);
        }
      });
    });
  }
}
