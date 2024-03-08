import * as amqp from "amqplib";
import * as mysql from "mysql";

let connection,
  results,
  query,
  add_tes,
  edit_tes,
  delete_tes,
  date_ob,
  date,
  month,
  year,
  dd;

date_ob = new Date();

date = ("0" + date_ob.getDate()).slice(-2);
month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
year = date_ob.getFullYear();
dd = year + "-" + month + "-" + date;

function connection_db() {
  connection = mysql.createConnection({
    host: "localhost",
    port: 3307,
    user: "root",
    password: "123.",
    insecureAuth: true,
    database: "db_test",
    charset: "utf8mb4",
  });

  connection.connect(function (err) {
    if (err) {
      console.log("error when connecting to db:", err);
      setTimeout(connection_db, 2000);
    } else {
      console.log("database connection");
    }
  });

  connection.on("error", function (err) {
    console.log("db error", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      connection_db();
    } else {
      throw err;
    }
  });
}

connection_db();

add_tes = async function (nama, Status, Created) {
  query = `INSERT INTO Test01(Nama, Status, Created) VALUES ('${nama}','${Status}','${Created}')`;
  try {
    results = await new Promise((resolve, reject) =>
      connection.query(query, (err, results) => {
        if (!err) {
          results = { status: true, data: "success add via rabbitmq" };
        } else {
          results = { status: false, data: "failed add via rabbitmq" };
        }
        resolve(results);
      })
    );
    console.log(results);
  } catch (error) {
    results = { status: false, result: error };
    console.log(results);
  }
};

edit_tes = async function (id, nama, Status, Updated) {
  query = `UPDATE Test01 SET Nama='${nama}',Status='${Status}',Updated='${Updated}' WHERE id='${id}'`;
  try {
    results = await new Promise((resolve, reject) =>
      connection.query(query, (err, results) => {
        if (!err) {
          results = { status: true, data: "success edit via rabbitmq" };
        } else {
          results = { status: false, data: "failed edit via rabbitmq" };
        }
        resolve(results);
      })
    );
    console.log(results);
  } catch (error) {
    console.log(results);
  }
};

delete_tes = async function (id) {
  query = `DELETE FROM Test01 WHERE id='${id}'`;
  try {
    results = await new Promise((resolve, reject) =>
      connection.query(query, (err, results) => {
        if (!err) {
          results = { status: true, data: "success delete via rabbitmq" };
        } else {
          results = { status: false, data: "failed delete via rabbitmq" };
        }
        resolve(results);
      })
    );
    console.log(results);
  } catch (error) {
    results = { status: false, result: error };
    console.log(results);
  }
};

connect();

async function connect() {
  try {
    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    const result = await channel.assertQueue("tes");

    channel.consume("tes", async(message) => {
      const input = JSON.parse(message.content.toString());
      if (input.command == 'create'){
        add_tes(input.data.nama,input.data.status,dd)
      }else if(input.command == 'update'){
        await edit_tes(input.data.id,input.data.nama,input.data.status,dd)
      } else if(input.command == 'delete') {
        await delete_tes(input.data.id)
      }channel.ack(message);
    });

    console.log("Waiting for messages");
  } catch (ex) {
    console.error(ex);
  }
}
