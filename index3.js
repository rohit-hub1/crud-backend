import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/teaDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));


// Create Schema
const teaSchema = new mongoose.Schema({
  name: String,
  price: Number
});

// Create Model
const Tea = mongoose.model("Tea", teaSchema);


const app = express();
app.use(cors());

const port = 3000;

app.get("/", (req, res) => {
    res.send("hello express")
        
});

app.use(express.json()) //→ Enables JSON parsing.
let teaData = [] //→ Stores tea objects.
let nextId = 1 //→ Keeps track of unique IDs.


//writing new tea 
app.post(`/teas`, (req, res) => { //→ Handles tea creation.
    const { name, price } = req.body //→ Extracts data from the request.
    const newTea = {id: nextId++, name, price}
    teaData.push(newTea)  //→ Stores new tea.
    res.status(201).send(newTea) //→ Responds with the created tea.
})

//finding all teas
app.get('/teas', (req, res) => {
    res.status(200).send(teaData)
});

//finding tea with individual id
app.get('/teas/:id', (req, res) => {
    const tea = teaData.find(t => t.id === parseInt(req.params.id))
    if (!tea) {
        return res.status(404).send('sorry, tea not found')
    }
    res.status(200).send(tea)
})

//updating the tea
app.put('/teas/:id', (req, res) => {
    const tea = teaData.find((t) => t.id === parseInt(req.params.id));
    if (!tea) {
      return res.status(404).send("sorry, tea not found");
    }

    const { name, price } = req.body
    tea.name = name
    tea.price = price
    res.send(200).send(tea)

})
    
//deleting the tea

// app.delete('/teas/:id', (req, res) => {
//     console.log("delete")
//     console.log(req.params.id)
//     const index = teaData.findIndex(t => t.id === parseInt(req.params.id))
//     if (index === -1) {
//         return res.status(404).send('tea not found')
//     }
//     teaData.splice(index, 1)
//     return res.status(204).send('deleted')
// })

app.delete("/teas/:id", (req, res) => {
  const teaId = parseInt(req.params.id, 10); // Convert id to number
  console.log("Deleting tea with ID:", teaId);

  const index = teaData.findIndex((t) => t.id === teaId);
  if (index === -1) {
    return res.status(404).send({ message: "Tea not found" });
  }

  const deletedTea = teaData.splice(index, 1)[0]; // Get the deleted tea object

  return res
    .status(200)
    .send({ message: "Tea deleted successfully", deletedTea });
});



app.listen(port, () => {
    console.log(`server is listning at port ${port}`);
    
});
