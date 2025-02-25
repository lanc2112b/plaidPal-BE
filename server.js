const express = require("express");
const cors = require("cors");
const User = require("./db/model/UserModel");
const { handleAllErrors } = require('./controllers/error_handling_controllers');
const {
  createLinkToken,
  tokenExchange,
  getPlaidAccounts,
  getTransactions,
  getPlaidCategories,
  // getSingleTransaction,
  getSingleTransactionAndNote,
} = require("./controllers/controller");
const db = require("./db/db");
const passport = require("passport");
const session = require("express-session");
const dotenv = require("dotenv");

const { OAuth2Client } = require("google-auth-library"); // npm install this on pp-be
const jwt = require("jsonwebtoken"); // this needs installing too

dotenv.config({ path: "./config.env" });

require("./config/passport")(passport);

db();

const {
  createUser,
  getAllUsers,
  getUserById,
  deleteUserById,
  deleteAcount,
  postNoteByTransactionId,
} = require("./controllers/controller");

const app = express();

app.use(cors());
// app.use(
//   cors({
//     origin: ["http://localhost:3000"],
//     methods: "GET,POST,PUT,DELETE,OPTIONS",
//   })
// );   // Hmmmmmm :D   Deployed, this will be different.

// res.setHeader('Access-Control-Allow-Origin', '*');

app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.use(express.json());
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);

// app.use(passport.initialize());
// app.use(passport.session());

// app.get(
//   "/auth/google",
//   passport.authenticate("google", {
//     scope: ["profile", "email"],
//   })
// );

// app.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/" }),
//   (req, res) => {
//     res.redirect("http://localhost:3000/dashboard");
//   }
// );

app.get("/api/users", getAllUsers);

app.get("/api/users/:googleId", getUserById);

app.delete("/api/users/:googleId", deleteUserById);

app.post("/api/users", createUser);

app.post("/api/create_link_token", createLinkToken);

app.post("/api/exchange_public_token", tokenExchange);

app.post("/api/plaid/accounts", getPlaidAccounts);

app.post("/api/plaid/transactions", getTransactions);

app.get("/api/plaid/categories", getPlaidCategories);

app.post("/api/notes/:transaction_id", postNoteByTransactionId);

app.post("/api/transactions/:transaction_id", getSingleTransactionAndNote);

app.delete("/api/accounts/:account_id", deleteAcount);


const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    return { payload: ticket.getPayload() };
  } catch (error) {
    return { error: "Invalid user detected. Please try again" };
  }
}
/** to here */

app.post("/api/signup", async (req, res) => {
  console.log(req.body);
  console.log(req.body.credential);
  try {
    // if (true) {
    if (req.body.credential !== null) {
      const verificationResponse = await verifyGoogleToken(req.body.credential);
      // const verificationResponse = await verifyGoogleToken("eyJhbGciOiJSUzI1NiIsImtpZCI6IjFhYWU4ZDdjOTIwNThiNWVlYTQ1Njg5NWJmODkwODQ1NzFlMzA2ZjMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYmYiOjE2ODAyNjMzODQsImF1ZCI6IjgxODk0MTk1MzEzNC1naGFhc3BmbXEyODljcmVkNmJoMTJnbjU2MHRiMjc0ZC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjEwNDMxMDcxODM3NDAxOTgxNTg2MyIsImVtYWlsIjoiaGFsZWVtaHVzc2FpbjY0QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhenAiOiI4MTg5NDE5NTMxMzQtZ2hhYXNwZm1xMjg5Y3JlZDZiaDEyZ241NjB0YjI3NGQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJuYW1lIjoiSGFsZWVtIEh1c3NhaW4iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUdObXl4WXZUNFViMHUtYlZhYmd0S201Qno1bWlLbGQxSnp0ZjNRY3R0OD1zOTYtYyIsImdpdmVuX25hbWUiOiJIYWxlZW0iLCJmYW1pbHlfbmFtZSI6Ikh1c3NhaW4iLCJpYXQiOjE2ODAyNjM2ODQsImV4cCI6MTY4MDI2NzI4NCwianRpIjoiYzIzNzg5NzBkZjFkYzBiYWEyZmE2OTczZWQ4YjMwYWYxZjg2OGY2NCJ9.h66Jcm3ocJvg1GoWg5hdV4gWuNhNHV_FX0LILkAGmGN0mRWxhKu9n2800qbuqqJSwCyhtc0_nIy4-oQNjS6zIN7xNa3XsTn_zv8ObSThG2CRyG_OXRFjYuVOlUIU8Rsdx-cV9SdOMIYG1nev21ONX5LjKW_XgNNDuLQUbtrt7x8mAXjiGgEPFMHZbFSlj4s5BjLDtorCRChBicGLOHUoqWwO8cHoOtMDcoPbKl-ZLt1LsYmv8KCDXapQEycXX1N4ly2qwx8frP__cTJCBuHidLr9QH1diREX3emnSHe0ah1eopbg7nmQ10eFo9UNG7kGOcXCbitEnc4ImVkrtBkRFA");
      console.log(verificationResponse);
      if (verificationResponse.error) {
        console.log(
          "we got error on verifygoogletoken" + verificationResponse.error
        );
        return res.status(400).json({ message: verificationResponse.error });
      }
      const results = await User.find({
        googleId: verificationResponse?.payload.sub,
      });
      if (results.length > 0) {
        return res
          .status(409)
          .send({ message: "PlaidPal Error: User already exists" });
      }
      const profile = verificationResponse?.payload;
      profile.googleId = verificationResponse?.payload.sub;
      profile.displayName = verificationResponse?.payload.name;
      await User.create(profile);
      res
        .status(201)
        .send({
          message: "Signup was successful",
          user: {
            googleId: profile?.sub,
            displayName: profile?.name,
            firstName: profile?.given_name,
            lastName: profile?.family_name,
            picture: profile?.picture,
            email: profile?.email,
            token: jwt.sign({ email: profile?.email }, "mySecret", {
              expiresIn: "1d",
            }),
          },
        })
        .catch((error) => {
          console.log(error);
          console.log("plaidPal error 1st catch:");
          return res
            .status(500)
            .send({ message: "An error occurred. Registration failed. 1" });
        });
    }
  } catch (error) {
    console.log("plaidPal error 2nd catch:");
    console.log(error);
    return res
      .status(500)
      .send({ message: "An error occurred. Registration failed. 2" });
  }
});

/** Another route to add, and another function to add to the controller googleAuth.....
 * prepend /api to the route eg. /api/login
 */
app.post("/api/login", async (req, res) => {
  console.log(req.body);
  console.log(req.body.credential);

  try {
    if (req.body.credential !== null) {
      console.log(req.body);
      console.log(req.body.credential);
      const verificationResponse = await verifyGoogleToken(req.body.credential);
      console.log("verificationResponse");
      console.log(verificationResponse);
      if (verificationResponse.error) {
        return res.status(400).json({
          message: verificationResponse.error,
        });
      }

      const profile = verificationResponse?.payload;
      profile.googleId = verificationResponse?.payload.sub;

      // const existsInDB = DB.find((person) => person?.email === profile?.email); // perhaps findUserByID/Email/something? in the  user model :)
      // let existsInDB = "";
      // User.find({email:profile?.email}).then((result)=>{
      //   existsInDB = result;
      // });

      let existsInDB = await User.find({ email: profile?.email });
      console.log(existsInDB);
      if (!existsInDB) {
        return res.status(400).json({
          message: "You are not registered. Please sign up",
        });
      }
      res.status(201).json({
        message: "Login was successful", // the user object will be the one returned from the DB and not hard coded
        user: {
          firstName: profile?.given_name,
          lastName: profile?.family_name,
          picture: profile?.picture,
          email: profile?.email,
          googleId: profile?.sub,
          token: jwt.sign(
            { email: profile?.email },
            process.env.GOOGLE_CLIENT_SECRET,
            {
              expiresIn: "1d",
            }
          ),
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error?.message || error,
    });
  }
});


app.use(handleAllErrors);



module.exports = app;