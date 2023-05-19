import amqp from "amqplib";
import { LoremIpsum } from "lorem-ipsum";
import { Server } from "socket.io";

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4,
  },
  wordsPerSentence: {
    max: 10,
    min: 4,
  },
});

const io = new Server(3000, {
  cors: {
    origin: "http://localhost:3001",
  },
});

const connection = await amqp.connect("amqp://localhost");

console.log("<------------Producer Connected------------>");

let channel = await connection.createChannel();

channel.assertQueue("zegalFirstQueue");
channel.assertQueue("zegalSecondQueue");

channel.consume(
  "zegalSecondQueue",
  (event) => {
    console.log(`consuming zegalSecondQueue`);
    let resData = JSON.parse(event.content.toString());
    console.log(
      `Emitting 'consumerResponse' to socketId-> ${resData.socketId}`
    );
    io.to(resData.socketId).emit("consumerResponse", resData);
  },
  {
    noAck: true,
  }
);

io.on("connection", (socket) => {
  console.log(`New user connected ${socket.id}`);
  socket.on("messageFromApp", (connectionData) => {
    console.log("socket on messageFromApp");
    console.log("connectionData=", connectionData);
    let socketData = JSON.parse(connectionData);
    socketData.socketId = socket.id;
    console.log("initiating pushing messages...");
    pushMessageToQueue(socketData);
  });
});

function pushMessageToQueue(data) {
  console.log("pushMessageToQueue");
  var sendMessage = true;

  let executionTimeMS = 5000;

  setTimeout(() => {
    sendMessage = false;
  }, executionTimeMS);

  var pushQueue = setInterval(
    (function (counter) {
      return function () {
        if (sendMessage === false) {
          console.log("exiting...");
          clearInterval(pushQueue);
          return;
        }

        ++counter;
        let messageToQueue = lorem.generateSentences(1);
        let messagePriority = Math.floor(Math.random() * 10) + 1;
        let messageObject = {
          socketId: data.socketId,
          message: messageToQueue,
          priority: messagePriority,
          timestamp: new Date(),
        };
        channel.sendToQueue(
          "zegalFirstQueue",
          Buffer.from(JSON.stringify(messageObject))
        );
        console.log(`Message '${messageToQueue}' sent to 'zegalFirstQueue'`);
      };
    })(0),
    50
  );
}
