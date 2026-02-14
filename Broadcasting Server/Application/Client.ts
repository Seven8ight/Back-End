import readline from "readline/promises";
import { IoClient } from "../Infrastructure/Sockets/Client"; // ← make sure this is the improved version
import { SERVER_PORT } from "../Config/Env";
import { Error as LogError, Info, Warning } from "../Utils/Logger";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function askQuestion(question: string): Promise<string> {
  return (await rl.question(question)).trim();
}

async function main() {
  let username: string | null = null;
  let client: IoClient | null = null;

  try {
    // Username selection loop
    while (!username) {
      const input = await askQuestion("Enter your username: ");

      if (!input) {
        Warning("Username cannot be empty.");
        continue;
      }

      username = input;

      client = new IoClient(`http://localhost:${SERVER_PORT}`);

      Info("Connecting to server...");

      const joined = await client.tryJoin(username);

      if (joined) {
        Info(`Successfully joined as ${username}`);
        break;
      } else {
        Warning("Username is already taken or invalid.");
        username = null;
        client = null;
      }
    }

    if (!client || !username) {
      LogError("Failed to join chat.");
      return;
    }

    console.log("\nType your message and press Enter. Type 'exit' to quit.\n");

    while (true) {
      const message = await askQuestion("> ");

      if (message.toLowerCase() === "exit") {
        Info("Goodbye!");
        break;
      }

      if (!message) {
        Warning("Empty message — please type something.");
        continue;
      }

      client.sendMessage(message);
    }
  } catch (err) {
    LogError(`Error: ${(err as Error).message}`);
  } finally {
    rl.close();

    if (client) client.socket.disconnect();
  }
}

main();
