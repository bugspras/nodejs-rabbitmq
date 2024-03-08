import * as amqp from "amqplib";

connect()
const message = {
  command: "delete",
  data: {
    id: 106,
  },
};

async function connect() {
  try {
    const connection = await amqp.connect("amqp://localhost:5672")
    const channel = await connection.createChannel()
    const result = await channel.assertQueue("tes")
    channel.sendToQueue("tes", Buffer.from(JSON.stringify(message)))
    console.log(`Sent successfully ${Buffer.from(JSON.stringify(message))}`)
  } catch (ex) {
    console.error(ex)
  }
}