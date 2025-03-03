import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Hello, World!");
});
app.get("/about", (req, res) => {
  res.send("Hello. this is your about");
});

app.get("/contact", (req, res) => {
    res.end("ok")
});

app.use(express.json())
let teaData = []
let nextId = 1

app.post(`/teas`, (req, res) => {
  const { name, price } = req.body
  const newTea = { id: nextId++, name, price }
  teaData.push(newTea)
  res.status(201).send(newTea)
})

app.get('/teas', (req, res) => {
  res.status(200).send(teaData)
})

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});



