import amqp from "amqplib";

const connection = await amqp.connect("amqp://localhost");

console.log("<------------Consumer Connected------------>");

const channel = await connection.createChannel();

await channel.assertQueue("zegalFirstQueue");
await channel.assertQueue("zegalSecondQueue");

channel.consume(
  "zegalFirstQueue",
  (event) => {
    console.log(`Consuming zegalFirstQueue`);
    let data = JSON.parse(event.content.toString());

    data.priority >= 7
      ? channel.sendToQueue(
          "zegalSecondQueue",
          Buffer.from(event.content.toString())
        )
      : "";
  },
  { noAck: true }
);
