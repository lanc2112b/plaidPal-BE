const app = require("./server");
const ENV = process.env.NODE_ENV || 'development';

require('dotenv').config({
  path: `${__dirname}/.env.${ENV}`,
});

//console.log(`${__dirname}/.env.${ENV}`)

app.listen(4000, () => {                    //process.env.PORT
  console.log(`listening on port 4000`);//process.env.PORT
});
