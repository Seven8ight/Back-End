import amqp from "amqplib";

export const main = async () => {
  try {
    const RabbitConnection = await amqp.connect("amqp://localhost"),
      rabbitChannel = await RabbitConnection.createChannel();

    rabbitChannel.assertExchange("broadcast", "fanout", {
      durable: false,
    });

    const rabbitQueue = await rabbitChannel.assertQueue("", {
      exclusive: true,
    });

    await rabbitChannel.bindQueue(rabbitQueue.queue, "broadcast", "");
  } catch (error) {
    Error(`${(error as Error).message}`);
  }
};

(async () => await main())();
