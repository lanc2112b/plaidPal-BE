const app = require("./server");
const ENV = process.env.NODE_ENV || 'development';

require('dotenv').config({
  path: `${__dirname}/.env.${ENV}`,
});

//console.log(`${__dirname}/.env.${ENV}`)

app.listen(process.env.PORT, () => {
  console.log(`listening on port ${process.env.PORT}`);
});
