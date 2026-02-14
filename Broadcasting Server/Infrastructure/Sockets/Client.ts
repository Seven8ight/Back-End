import io, { Socket } from "socket.io-client";
import { Info, Message, Warning, Error } from "../../Utils/Logger";

export class IoClient {
  public socket: SocketIOClient.Socket;
  public username: string = "";
  public isConnected: boolean = false;
  public error: string = "";

  constructor(serverUrl: string) {
    this.socket = io(serverUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.socket.on("connect", () => {
      Info("Connected to server");
    });

    this.socket.on("connect_error", (error: Error) => {
      Error(`Connection error: ${error.message}`);
    });

    this.socket.on("Username accepted", (username: string) => {
      this.username = username;
      this.isConnected = true;
      Info(`Joined chat as ${username}`);
    });

    this.socket.on("Username taken", () => {
      Warning("Username already exists");
      this.error = "Username already exists";
      this.isConnected = false;
    });

    this.socket.on(
      "Receive message",
      (data: { username: string; message: string }) => {
        Message(data.username, data.message);
      },
    );

    this.socket.on("user joined", (username: string) =>
      Info(`${username} has joined the chat`),
    );

    this.socket.on("disconnect", (reason: string) => {
      Warning(`Disconnected: ${reason}`);
      this.isConnected = false;
    });
  }

  /** Call this when user submits a username (first time or retry) */
  public async tryJoin(username: string): Promise<boolean> {
    if (this.isConnected) {
      Warning("Already joined with another username");
      return true;
    }

    this.username = "";
    this.error = "";
    this.socket.emit("join", username);

    // Wait for response (simple promise-based wait)
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.error = "No response from server";
        resolve(false);
      }, 5000);

      const onAccepted = () => {
        clearTimeout(timeout);
        this.socket.off("Username accepted", onAccepted);
        this.socket.off("Username taken", onTaken);
        resolve(true);
      };

      const onTaken = () => {
        clearTimeout(timeout);
        this.socket.off("Username accepted", onAccepted);
        this.socket.off("Username taken", onTaken);
        resolve(false);
      };

      this.socket.once("Username accepted", onAccepted);
      this.socket.once("Username taken", onTaken);
    });
  }

  public sendMessage(message: string) {
    if (!this.isConnected || !this.username) {
      Warning("Cannot send - not joined yet");
      return;
    }
    this.socket.emit("Message sent", message);
  }
}
