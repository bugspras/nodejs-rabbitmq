import * as express from "express";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as queue from "express-queue";
import * as amqp from "amqplib";

let app, results, add_tes, edit_tes, delete_tes, que;

add_tes = async function (Nama, Status) {
  const message = {
    command: "create",
    data: {
      nama: Nama,
      status: Status,
    },
  };
  try {
    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    const result = await channel.assertQueue("tes");
    channel.sendToQueue("tes", Buffer.from(JSON.stringify(message)));
    results = { status: true, data: "success add rabbitmq" };
  } catch (ex) {
    results = { status: false, data: "failed add rabbitmq" };
  }
  return results;
};

edit_tes = async function (Id, Nama, Status) {
  const message = {
    command: "update",
    data: {
      id: Id,
      nama: Nama,
      status: Status,
    },
  };
  try {
    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    const result = await channel.assertQueue("tes");
    channel.sendToQueue("tes", Buffer.from(JSON.stringify(message)));
    results = { status: true, data: "success add rabbitmq" };
  } catch (ex) {
    results = { status: false, data: "failed add rabbitmq" };
  }
  return results;
};

delete_tes = async function (Id) {
  const message = {
    command: "delete",
    data: {
      id: Id,
    },
  };
  try {
    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    const result = await channel.assertQueue("tes");
    channel.sendToQueue("tes", Buffer.from(JSON.stringify(message)));
    results = { status: true, data: "success add rabbitmq" };
  } catch (ex) {
    results = { status: false, data: "failed add rabbitmq" };
  }
  return results;
};

que = queue({
  activeLimit: 2,
  queuedLimit: 6,
  rejectHandler: (req, res) => {
    res.sendStatus(500);
  },
});
app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(que);
app.use(bodyParser.urlencoded({ extended: true }));
app.set("port", 5001);

app.post("/api/add", async function (req, res) {
  try {
    res.status(200).json(await add_tes(req.body.nama, req.body.status));
  } catch (error) {
    res.status(200).json({ status: false, result: error });
  }
});

app.put("/api/edit", async function (req, res) {
  try {
    res
      .status(200)
      .json(await edit_tes(req.query.id, req.body.nama, req.body.status));
  } catch (error) {
    res.status(200).json({ status: false, result: error });
  }
});

app.delete("/api/delete", async function (req, res) {
  try {
    res.status(200).json(await delete_tes(req.query.id));
  } catch (error) {
    res.status(200).json({ status: false, result: error });
  }
});

app.listen(app.get("port"), function () {
  console.log("*port:" + app.get("port"));
});
