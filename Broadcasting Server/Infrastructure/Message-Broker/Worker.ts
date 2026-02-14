import amqp from "amqplib";

const Worker = async () => {
  try {
    const RabbitConnection = await amqp.connect("amqp://localhost"),
      rabbitChannel = await RabbitConnection.createChannel();

    rabbitChannel.assertExchange("broadcast", "fanout", {
      durable: false,
    });

    const rabbitQueue = await rabbitChannel.assertQueue("", {
      exclusive: true,
    });

    rabbitChannel.consume(
      rabbitQueue.queue,
      (message: amqp.ConsumeMessage | null) => {
        if (!message) return;
      },
    );
  } catch (error) {
    Error(`${(error as Error).message}`);
  }
};
