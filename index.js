const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kygk2l2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    //collections
    const TSpotsCollection = client.db("tourismDB").collection("touristSpots");
    const countryCollection = client.db("tourismDB").collection("countries");
    const blogsCollection = client.db("tourismDB").collection("blogs");

    app.get("/touristspots", async (req, res) => {
      const cursor = TSpotsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/touristspotsad", async (req, res) => {
      const cursor = TSpotsCollection.find()
        .sort({ average_cost: 1 })
        .collation({ locale: "en_US", numericOrdering: true });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/touristspotsdd", async (req, res) => {
      const cursor = TSpotsCollection.find()
        .sort({ average_cost: -1 })
        .collation({ locale: "en_US", numericOrdering: true });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/touristspots/:email", async (req, res) => {
      const email = req.params.email;
      const filter = {
        user_email: email,
      };
      const cursor = TSpotsCollection.find(filter);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/countries", async (req, res) => {
      const cursor = countryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/blogs", async (req, res) => {
      const cursor = blogsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/touristspot/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await TSpotsCollection.findOne(query);
      res.send(result);
    });

    app.get("/country_spots/:country", async (req, res) => {
      const country = req.params.country;
      const query = {
        country_name: country,
      };
      const cursor = TSpotsCollection.find(query).collation({
        locale: "en",
        strength: 2,
      });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/touristspots", async (req, res) => {
      const newSpot = req.body;

      const result = await TSpotsCollection.insertOne(newSpot);
      res.send(result);
    });

    app.put("/touristspots/:id", async (req, res) => {
      const id = req.params.id;
      const spot = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedSpot = {
        $set: {
          user_email: spot.user_email,
          user_name: spot.user_name,
          tourists_spot_name: spot.tourists_spot_name,
          country_name: spot.country_name,
          location: spot.location,
          average_cost: spot.average_cost,
          seasonality: spot.seasonality,
          travel_time: spot.travel_time,
          image: spot.image,
          total_visitors_per_year: spot.total_visitors_per_year,
          short_description: spot.short_description,
          long_description: spot.long_description,
        },
      };

      const result = await TSpotsCollection.updateOne(
        filter,
        updatedSpot,
        options
      );
      res.send(result);
    });

    app.delete("/touristspots/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await TSpotsCollection.deleteOne(query);
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
