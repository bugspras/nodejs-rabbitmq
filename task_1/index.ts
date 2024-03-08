import * as express from "express";
import * as bodyParser from "body-parser";
import * as mysql from "mysql";
import * as cors from "cors";
import * as queue from "express-queue";

let connection,
  app,
  results,
  query,
  list_tes,
  add_tes,
  edit_tes,
  delete_tes,
  date_ob,
  date,
  month,
  year,
  dd,
  que;

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

list_tes = async function (id,page) {
  if (id) {
    query = `SELECT * FROM Test01 WHERE id='${id}'`;
  } else {
    var limit = 20;
    if(page == 1){
      page = 0;
    }else{
      if(page == 2){
        page = 20;
      }else{
        page = (page*limit)-limit
      }
    }
    query = `SELECT * FROM Test01 ORDER BY id ASC LIMIT ${limit} OFFSET ${page}`;
  }
  try {
    results = await new Promise((resolve, reject) =>
      connection.query(query, (err, results) => {
        if (!err) {
          if (results.length) {
            results = { status: true, result: results };
          } else {
            results = { status: false, result: [] };
          }
          resolve(results);
        }
      })
    );
    return results;
  } catch (error) {
    results = { status: false, result: error };
    return results;
  }
};

add_tes = async function (nama, Status, Created) {
  query = `INSERT INTO Test01(Nama, Status, Created) VALUES ('${nama}','${Status}','${Created}')`;
  try {
    results = await new Promise((resolve, reject) =>
      connection.query(query, (err, results) => {
        if (!err) {
          results = { status: true, data: "success add" };
        } else {
          results = { status: false, data: "failed add" };
        }
        resolve(results);
      })
    );
    return results;
  } catch (error) {
    results = { status: false, result: error };
    return results;
  }
};

edit_tes = async function (id, nama, Status, Updated) {
  query = `UPDATE Test01 SET Nama='${nama}',Status='${Status}',Updated='${Updated}' WHERE id='${id}'`;
  try {
    results = await new Promise((resolve, reject) =>
      connection.query(query, (err, results) => {
        if (!err) {
          results = { status: true, data: "success edit" };
        } else {
          results = { status: false, data: "failed edit" };
        }
        resolve(results);
      })
    );
    return results;
  } catch (error) {
    results = { status: false, result: error };
    return results;
  }
};

delete_tes = async function (id) {
  query = `DELETE FROM Test01 WHERE id='${id}'`;
  try {
    results = await new Promise((resolve, reject) =>
      connection.query(query, (err, results) => {
        if (!err) {
          results = { status: true, data: "success delete" };
        } else {
          results = { status: false, data: "failed delete" };
        }
        resolve(results);
      })
    );
    return results;
  } catch (error) {
    results = { status: false, result: error };
    return results;
  }
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
app.set("port", 5000);

app.get("/api/list", async function (req, res) {
  try {
    if (req.query.id) {
      res.status(200).json(await list_tes(req.query.id,0));
    } else {
      res.status(200).json(await list_tes(0,req.query.page));
    }
  } catch (error) {
    res.status(200).json({ status: false, result: error });
  }
});

app.post("/api/add", async function (req, res) {
  try {
    res.status(200).json(await add_tes(req.body.nama, req.body.status, dd));
  } catch (error) {
    res.status(200).json({ status: false, result: error });
  }
});

app.put("/api/edit", async function (req, res) {
  try {
    res
      .status(200)
      .json(await edit_tes(req.query.id, req.body.nama, req.body.status, dd));
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
