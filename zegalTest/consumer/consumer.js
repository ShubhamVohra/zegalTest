import amqp from "amqplib";

const connection = await amqp.connect("amqp://localhost");

console.log("<------------Consumer Connected------------>");

const channel = await connection.createChannel();

await channel.assertQueue("zegalFirstQueue");
await channel.assertQueue("zegalSecondQueue");

channel.consume(
  "zegalFirstQueue",
  (event) => {
    console.log(`consuming ZegalFirstQueue`);
    let data = JSON.parse(event.content.toString());

    RTCDataChannelEvent.sendToQueue(
      chooseQueue(data.priority),
      Buffer.from(event.content.toString())
    );
  },
  { noAck: true }
);

function chooseQueue(priority) {
  if (priority <= 5) return "zegalFirstQueue";

  return "zegalSecondQueue";
}
