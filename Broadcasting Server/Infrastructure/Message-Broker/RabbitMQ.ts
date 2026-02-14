import amqp, { ConsumeMessage } from "amqplib";
import { Error as LogError } from "../../Utils/Logger";
import { pg } from "../../Config/Database";

export class RabbitMQService {
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private readonly exchange = "broadcast";
  private readonly queue = "chat-persistent-log";

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect("amqp://localhost");
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(this.exchange, "fanout", {
        durable: false,
      });

      await this.channel.assertQueue(this.queue, {
        durable: true,
        autoDelete: false,
        exclusive: false,
      });

      await this.channel.bindQueue(this.queue, this.exchange, "");

      this.startConsuming();
    } catch (err) {
      LogError(`RabbitMQ connection failed: ${(err as Error).message}`);
    }
  }

  private startConsuming() {
    if (!this.channel) return;

    this.channel.consume(
      this.queue,
      async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
          const content = JSON.parse(msg.content.toString());

          await pg.query(
            "INSERT INTO chats(socketid,username,message) VALUES($1,$2,$3)",
            [content.socketid, content.username, content.message],
          );

          this.channel!.ack(msg);
        } catch (err) {
          LogError(`Consume error: ${(err as Error).message}`);
          this.channel!.nack(msg, false, true); // requeue
        }
      },
      { noAck: false },
    );
  }

  async publish(message: string): Promise<void> {
    if (!this.channel) {
      LogError("Cannot publish — RabbitMQ not connected");
      return;
    }

    this.channel.publish(this.exchange, "", Buffer.from(message));
  }

  async close() {
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch {}
  }
}

export const rabbitMQ = new RabbitMQService();
