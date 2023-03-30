const app = require("./server");

//console.log(process.env.PORT)

app.listen(4000, () => {                    //process.env.PORT
  console.log(`listening on port 4000`);//process.env.PORT
});
