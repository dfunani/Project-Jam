const { Client } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
require("dotenv").config();

const client = new Client();
const context = {};
const price = 100;
const users = [];

const fs = require("fs");
const database = [];

client.on("qr", (qr) => qrcode.generate(qr, { small: true }));

client.on("ready", () => console.log("Whatsapp server running"));

client.initialize();

client.on("message", (message) => {
  if (!context.hasOwnProperty(message.from)) {
    context[message.from] = [{ Greeting: message.body, Reply: false }];
    message.reply("How many chickens would you like to order? 🐔");
    context[message.from][0]["Reply"] = true;
    return;
  }
  if (!context[message.from][0]["Reply"]) {
    message.reply("How many chickens would you like to order? 🐔");
    context[message.from][0]["Reply"] = true;
    return;
  }
  if (
    context[message.from].length == 1 &&
    context[message.from][0]["Reply"] &&
    parseInt(message.body)
  ) {
    context[message.from].push({
      Quantity: parseInt(message.body),
      Reply: false,
    });
    message.reply(
      `Where would you like to have the ${message.body} Chickens Delivered? Share your Location below. 🐔`
    );
    context[message.from][1]["Reply"] = true;
    return;
  }
  if (context[message.from].length == 2 && !context[message.from][1]["Reply"]) {
    message.reply(
      `Where would you like to have the ${message.body} Chickens Delivered? Share your Location below. 🐔`
    );
    context[message.from][1]["Reply"] = true;
    return;
  }
  if (
    context[message.from].length == 2 &&
    context[message.from][1]["Reply"] &&
    message.location
  ) {
    /* Location {
      latitude: -33.804387692590524,
      longitude: 18.51463403340744,
      description: undefined
    } */
    context[message.from].push({
      Location: message.location,
      Valid: false,
      Reply: false,
    });
    message.react("🙂");
    message.reply(
      `Please Confirm Order Below with a yes(y) or no(n). ${
        context[message.from][1]["Quantity"]
      } Chickens for a Total of R${
        context[message.from][1]["Quantity"] * price
      }. To be delivered to ${message.location}. 🐔`
    );
    context[message.from][2]["Reply"] = true;
    return;
  }
  if (
    context[message.from][2]["Reply"] &&
    (message.body.toLowerCase().trim()[0] === "y" ||
      message.body.toLowerCase().trim()[0] === "n")
  ) {
    context[message.from].push({
      Total: context[message.from][1]["Quantity"] * price,
      Price: price,
      Delivered: false,
      Paid: false,
    });

    try {
      const data = fs.readFileSync("./storage/orders.json", "utf8");

      // parse JSON string to JSON object
      database = JSON.parse(data);
    } catch (err) {
      console.log(`Error reading file from disk: ${err}`);
    }

    database[`${message.from} ${Date.now()}`] = context[message.from];

    try {
      // convert JSON object to a string
      const result = JSON.stringify(database, null, 4);

      // write file to disk
      fs.writeFileSync("./storage/orders.json", result, "utf8");

      console.log(`File is written successfully!`);
    } catch (err) {
      console.log(`Error writing file: ${err}`);
    }

    context[message.from] = {};
    message.reply("Thank you and Goodbye. 🐔");
    return;
  }
});

// send message to jam with .json data

/* Test run 1 on 11/04/2023 with jam, ran end to end, object created in storage:
  However storage was an array and not a key val parseInt. so we couldn't associate the array item to a context number ie user or cellphone number. Fix, database var was updated to database[sender + now] = context to approved order state. */
