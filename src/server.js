// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");
const turf = require("@turf/turf");
const stripe = require("stripe")(
  "sk_test_51OwItoSC9D6ccGsCzVCmIcGkl2f60PXIx8reeNluGxzJ9hJSOOZLp32Hl0ASHlQq0VtWptIxYaYYzch13ow8rZXy00AgQfCG6r"
);
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
let location2;
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });


// Function to broadcast coordinates to all connected clients
function broadcastCoordinates(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}
setInterval(() => {
  // Generate random coordinates for demonstration purposes
  const randomLng = Math.random() * 360 - 180;
  const randomLat = Math.random() * 180 - 90;
  const coordinates = `${randomLng},${randomLat}`;


  // Broadcast the updated coordinates to all clients
  broadcastCoordinates({ coordinates });
}, 5000);


dotenv.config();
const bcrypt = require("bcrypt");
// Create Express app
const app = express();


app.use(express.json());
// Set up view engine
app.set("view engine", "ejs"); // Set EJS as the view engine
app.set("views", path.join(__dirname, "../views"));
app.use("/public", express.static(path.join(__dirname, "../public")));


// Connect to MongoDB (replace 'your_database_url' with your actual MongoDB Atlas URL)
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));


// Define user schema
const User = mongoose.model("User", {
  firstname: String,
  lastname: String,
  email: String,
  password: String,
  gender: String,
});


// Define the Location schema


// Create a Mongoose model for the new collection


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 120 * 60 * 1000, // Set session timeout to 30 minutes (in milliseconds)
    },
  })
);
function isLoggedIn(req, res, next) {
  if (req.session && req.session.user) {
    // If user session exists, proceed to the next middleware
    req.session.cookie.expires = new Date(Date.now() + 120 * 60 * 1000);
    return next();
  } else {
    // If user session does not exist, redirect to the landing page
    res.redirect("/");
  }
}


// const express = require('express');
// const nodemailer = require('nodemailer');
// const bodyParser = require('body-parser');


// const app = express();
// const port = 3000; // You can change this to your desired port


// Middleware to parse JSON bodies
// app.use(bodyParser.json());


// Endpoint to send email


// const LocationSchema = new mongoose.Schema({
//   coordinates: {
//     type: String,
//     required: true,
//   },
// });
// const LocationSchema = new mongoose.Schema({
//   coordinates: {
//     type: String,
//     required: true
//   },
//   user: {
//     type: String,
//     required: true
//   }
// });
// app.get('/logout', (req, res) => {
//   req.session.destroy(err => {
//     if (err) {
//       console.error("Error destroying session:", err);
//       return res.redirect("/");
//     }
//     res.redirect("/");
//   });
// });
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("error destroying sessionnnnnnnnnnnn ", err);
      return res.redirect("/");
    }
    res.redirect("/");
  });
});
app.get('/fetchfare', isLoggedIn, async (req, res) => {
  try {
    // Get the current user's email from the session or request parameters
    const loggedInUser = req.session.user;
    const currentUserEmail = loggedInUser.email;

    // Fetch fare data from the database based on the user's email
    const fareData = await Test.findOne({ remail: currentUserEmail });

    // Check if fare data exists
    if (!fareData) {
      // If fare data is not found, return an appropriate response
      return res.status(404).json({ error: 'Fare data not found for the current user' });
    }

    // If fare data exists, return it in the response
    res.json(fareData); // Assuming fare is a field in your Test model
  } catch (error) {
    // If an error occurs, log it and send an error response
    console.error('Error fetching fare:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const sendOTP = async (email, otp) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "unidrive534@gmail.com", // Your Gmail email address
        pass: "yhwf ffmm enzj feqn", // Your SendGrid password or API key
      },
      debug: true,
    });


    let info = await transporter.sendMail({
      from: "unidrive534@gmail.com",
      to: email,
      subject: "OTP for Signup",
      text: `Your OTP for signup is: ${otp}`,
    });


    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
app.get('/rider_data_want',isLoggedIn, async (req, res) => {
  try {
    const { email } = req.body;
    const loggedInUser = req.session.user;


   
    // Get the current user's email from the session or request parameters
    const currentUserEmail = loggedInUser.email; // Assuming the user's email is stored in req.session.user.dmail
    console.log(currentUserEmail);
    // Query the "test" collection based on the current user's email
    const userData = await Test.findOne({ dmail: currentUserEmail });


    // If user data is found, send it as a response
    if (userData) {
      res.status(200).json(userData);
    } else {
      // If no user data is found, send a 204 status code (No Content) to indicate that no data was found
      res.status(204).send();
    }
  } catch (error) {
    // If an error occurs during the database operation, send a 500 status code and an error message
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Call sendOTP function with recipient email and OTP


module.exports = sendOTP;


const LocationSchema = new mongoose.Schema({
  coordinates: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId, // Storing ObjectId of the user
    ref: "User", // Referencing the User model
    required: true,
  },
  firstname: {
    type: String,
    ref: "User", // Optionally, you can reference the User model for convenience
    required: true,
  },
  lastname: {
    type: String,
    ref: "User", // Optionally, you can reference the User model for convenience
    required: true,
  },
  gender: {
    type: String,
    ref: "User", // Optionally, you can reference the User model for convenience
    required: true,
  },
  departTime: {
    type: Date,
    required: true,
  },
  availableSeats: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    ref: "User",
    required: true,
  },
});
const Location2Schema = new mongoose.Schema({
  coordinates: {
    type: String,
    required: true,
  },
  user: {
    type: String, // Corrected type to represent email as a string
    ref: "User", // Referencing the User model
    required: true,
  },
  firstname: {
    type: String,
    ref: "User",
    required: true,
  },
  lastname: {
    type: String,
    ref: "User",
    required: true,
  },
  gender: {
    type: String,
    ref: "User",
    required: true,
  },
});
const DriverSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  coordinates: {
    type: String, // Assuming coordinates are stored as a string
    required: true,
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  distance: {
    type: Number,
    required: true,
  },
});
const riderSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },


  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  location2: {
    type: [Number],
    required: true,
  },
});
const TestSchema = new mongoose.Schema({
  dmail: {
    type: String,
    required: true,
  },
  dgender: {
    type: String,
    required: true,
  },
  dcoordinates: {
    type: String, // Assuming coordinates are stored as a string
    required: true,
  },
  dfirstname: {
    type: String,
    required: true,
  },
  dlastname: {
    type: String,
    required: true,
  },
  ddistance: {
    type: Number,
    required: true,
  },
  remail: {
    type: String,
    required: true,
  },
  rgender: {
    type: String,
    required: true,
  },


  rfirstname: {
    type: String,
    required: true,
  },
  rlastname: {
    type: String,
    required: true,
  },
  rlocation2: {
    type: [Number],
    required: true,
  },
});


// Define the Location model
const Location = mongoose.model("Location", LocationSchema);
const Location2 = mongoose.model("Location2", Location2Schema);
const Driver = mongoose.model("Driver", DriverSchema);
const Rider = mongoose.model("Rider", riderSchema);
module.exports = Rider;
const Test = mongoose.model("test", TestSchema);


module.exports = Test;


app.post("/driverdata", async (req, res) => {
  try {
    // Extract data from the request body
    const { email, gender, coordinates, firstname, lastname, distance } =
      req.body;
    const location2 = req.session.location2;
    const loggedInUser = req.session.user;


    // Create a new instance of your model with the extracted data
    const newData = new Test({
      dmail: email,
      dgender: gender,
      dcoordinates: coordinates,
      dfirstname: firstname,
      dlastname: lastname,
      ddistance: distance,
      rfirstname: loggedInUser.firstname,
      rlastname: loggedInUser.lastname,
      remail: loggedInUser.email,
      rgender: loggedInUser.gender,
      rcoordinates: loggedInUser.coordinates,
      rlocation2: location2,
    });
    // Save the data to the database
    await newData.save();
    broadcastCoordinates({ coordinates });
    await Location.deleteOne({email: email});
    // Send a success response
    res.status(201).json({ message: "Data saved successfully" });
  } catch (error) {
    // If an error occurs, send an error response
    console.error("Error saving data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Assuming you've already connected to MongoDB using mongoose, as shown in your previous code


// POST endpoint to store location
// app.post("/storeLocation", isLoggedIn, async (req, res) => {
//   try {
//     const { location } = req.body;


//     // Create a new Location document using the Location model
//     const newLocation = new Location({ coordinates: location.toString() });
//     await newLocation.save();
//     res.sendStatus(200); // Send a success response
//   } catch (error) {
//     console.error("Error storing location:", error);
//     res.sendStatus(500); // Send an error response
//   }
// });
// This is your test secret API key.


// const express = require('express');
// const app = express();
// app.use(express.static('public'));


app.post("/create-checkout-session",isLoggedIn, async (req, res) => {
  const YOUR_DOMAIN = 'http://localhost:3000';
  const loggedInUser = req.session.user;
  // console.log(loggedInUser);
  await Test.deleteOne({remail: loggedInUser.email});
 
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: "price_1OwOBdSC9D6ccGsCE7MIxbZF",
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${YOUR_DOMAIN}/success`,
    cancel_url: `${YOUR_DOMAIN}/cancel`,
  });


  res.redirect(303, session.url);
});


app.post("/storeLocation", isLoggedIn, async (req, res) => {
  try {
    const { location, departTime, availableSeats } = req.body;
    const [hours, minutes] = departTime.split(":");
    if (isNaN(hours) || isNaN(minutes)) {
      throw new Error("Invalid departTime format");
    }


    const currentDate = new Date();


    // Get the current date in ISO format (YYYY-MM-DD)
    // Get the current date and time in UTC
    const currentUTCDateTime = currentDate.toISOString();


    // Combine the current date with the provided departTime to create a valid date format
    const parsedDepartTime = new Date(
      `${currentUTCDateTime.split("T")[0]}T${departTime}:00Z`
    );


    console.log(parsedDepartTime);
    const loggedInUser = req.session.user;


    // Create a new Location document associated with the logged-in user
    const newLocation = new Location({
      coordinates: location.toString(),
      user: loggedInUser._id, // Use the ObjectId of the logged-in user
      firstname: loggedInUser.firstname,
      lastname: loggedInUser.lastname,
      gender: loggedInUser.gender,
      departTime: parsedDepartTime,
      availableSeats: availableSeats,
      email: loggedInUser.email,
    });


    await newLocation.save();
    res.sendStatus(200); // Send a success response
  } catch (error) {
    console.error("Error storing location:", error);
    res.sendStatus(500); // Send an error response
  }
});


app.post("/storeLocation2", isLoggedIn, async (req, res) => {
  try {
    const { location2 } = req.body;


    // Retrieve the logged-in user's details from the session
    const loggedInUser = req.session.user;


    // Create a new Location document associated with the logged-in user
    const newLocation2 = new Location2({
      coordinates: location2.toString(),
      user: loggedInUser.email,
      firstname: loggedInUser.firstname,
      lastname: loggedInUser.lastname,
      gender: loggedInUser.gender,


      // Assigning the ObjectId of the logged-in user
    });


    await newLocation2.save();
    res.sendStatus(200); // Send a success response
  } catch (error) {
    console.error("Error storing location2:", error);
    res.sendStatus(500); // Send an error response
  }
});
app.get("/fetchPublishedRides", async (req, res) => {
  try {
    // Fetch published rides and populate user details
    const publishedRides = await Location.find().populate("user", "email"); // Ensure only email is populated
    res.json(publishedRides);
  } catch (error) {
    console.error("Error fetching published rides:", error);
    res.sendStatus(500);
  }
});


// Import Turf.js for distance calculation


// Route to calculate distances between Location2 and all Location data for the current user
// app.get("/calculateDistances", isLoggedIn, async (req, res) => {
//   try {
//     // Retrieve the logged-in user's details from the session
//     const loggedInUser = req.session.user;


//     // Find Location2 data for the current user
//     const location2 = await Location2.findOne({ user: loggedInUser.email });


//     if (!location2) {
//       return res.status(404).json({ error: "Location2 not found" });
//     }


//     // Find all Location data for the current user
//     const allLocations = await Location.find({ user: loggedInUser.email });


//     // Array to store distances
//     const distances = [];


//     // Calculate distances between Location2 and each Location
//     allLocations.forEach((location) => {
//       const locationPoint = turf.point(
//         location.coordinates.split(",").map(Number)
//       );
//       const location2Point = turf.point(
//         location2.coordinates.split(",").map(Number)
//       );
//       const distance = turf.distance(locationPoint, location2Point, {
//         units: "miles",
//       });
//       distances.push({
//         location: location._id,
//         location2: location2._id,
//         distance: distance.toFixed(2), // Round distance to 2 decimal places
//       });
//     });


//     // Log distances to the console
//     console.log(Distances for Location2 ${location2._id}:);
//     distances.forEach((distance) => {
//       console.log(
//         Location ${distance.location} to Location2 ${distance.location2}: ${distance.distance} miles
//       );
//     });


//     // Send response with distances
//     res.status(200).json(distances);
//   } catch (error) {
//     console.error("Error calculating distances:", error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while calculating distances" });
//   }
// });
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "unidrive534@gmail.com", // Your Gmail email address
    pass: "pyqm nxjt hkwt ftep",
  },
});


// Define a route to handle sending emails
app.post("/sendEmail", isLoggedIn, async (req, res) => {
  const { email } = req.body;
  const location2 = req.session.location2;


  const loggedInUser = req.session.user;
  const otp = otpGenerator.generate(6, {
    digits: true,
    alphabets: false,
    upperCase: false,
    specialChars: false,
  });
  await sendOTP(email, otp);
  req.session.otp = otp;


  // Ensure the email and user details are available
  if (!email || !loggedInUser) {
    return res.status(400).send("Email and user details are required.");
  }


  // Email content
  const mailOptions = {
    from: "unidrive534@gmail.com",
    to: email,
    subject: "Rider Selected your published ride",
    text: `Ride info:\n\nUser Details:\nName: ${loggedInUser.firstname} ${loggedInUser.lastname}\nEmail: ${loggedInUser.email}\nGender: ${loggedInUser.gender}
             Your OTP to start ride is  is: ${otp}`,
  };


  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send("Error sending email");
    } else {
      console.log("Email sent: " + info.response);


      // Save user data to the database
      try {
        const newRider = new Rider({
          firstname: loggedInUser.firstname,
          lastname: loggedInUser.lastname,
          email: loggedInUser.email,
          gender: loggedInUser.gender,
          coordinates: loggedInUser.coordinates,
          location2: location2,


          // Add other properties as needed
        });
        const savedRider = await newRider.save();
        console.log("User data saved to database:", savedRider);


        // Redirect the user to "/otp_verification2" after email is sent and user data is saved
        res.redirect("/otp_verification2");
      } catch (saveError) {
        console.error("Error saving user data:", saveError);
        res.status(500).send("Error saving user data.");
      }
    }
  });
});


// Routes
app.post("/calculateDistances", async (req, res) => {
  try {
    const { distances } = req.body; // Assuming the client sends the distances array


    // Ensure distances array is provided
    if (!distances || !Array.isArray(distances)) {
      throw new Error("Distances data is required.");
    }


    // You can perform additional processing with the distances here, such as filtering or sorting


    res.json({ success: true }); // Respond with success
  } catch (error) {
    console.error("Error processing distances:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing distances." });
  }
});
app.get("/login", (req, res) => {
  res.render("login", { error: null }); // Ensure error is defined
});

app.get("/landing", (req, res) => {
  res.render("landing");
});
// app.get("/account", (req, res) => {
//   res.render("account");
// });
app.get("/home", (req, res) => {
  res.render("home");
});
app.get("/publisher", (req, res) => {
  res.render("publisher");
});
app.get("/passenger", (req, res) => {
  res.render("passenger");
});
app.get("/calculatedistance", (req, res) => {
  res.render("calculatedistance");
});
app.get("/endride", (req, res) => {
  res.render("endride");
});
app.get("/cancel", (req, res) => {
  res.render("cancel");
});
app.get("/success", (req, res) => {
  res.render("success");
});
app.get("/checkout", (req, res) => {
  res.render("checkout");
});
app.get("/femalerides", (req, res) => {
  res.render("femalerides");
});
app.get("/account", isLoggedIn, async (req, res) => {
  try {
    // Fetch user data from the session
    const user = req.session.user;


    // If user data is found in the session, fetch user data from the database using the user's ID
    if (user) {
      // Fetch user data from the database based on the user's ID from the session
      const userData = await User.findById(user._id);


      if (userData) {
        res.render("account", { user: userData });
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    } else {
      return res.status(404).json({ error: "User not found in session" });
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching user profile" });
  }
});
app.get("/otp_verification2", (req, res) => {
  res.render("otp_verification2");
});
// POST endpoint to store location
// app.post("/storeLocation", isLoggedIn, async (req, res) => {
//   try {
//     const { location } = req.body;


//     // Retrieve the logged-in user's details from the session
//     const loggedInUser = req.session.user;


//     // Create a new Location document associated with the logged-in user
//     const newLocation = new Location({
//       coordinates: location.toString(),
//       user: loggedInUser._id, // Assigning the ObjectId of the logged-in user
//     });


//     await newLocation.save();


//     // Fetch the associated user's email
//     const userWithEmail = await User.findById(loggedInUser._id);
//     const userEmail = userWithEmail.email;


//     // Send response with location and email
//     res
//       .status(200)
//       .json({ location: newLocation.coordinates, email: userEmail });
//   } catch (error) {
//     console.error("Error storing location:", error);
//     res.sendStatus(500); // Send an error response
//   }
// });


app.get("/signup", (req, res) => {
  res.render("signup", { error: null });
});
app.get("/livelocation", (req, res) => {
  res.render("livelocation");
});
app.get("/startride", (req, res) => {
  res.render("startride");
});


app.get("/publishernext", (req, res) => {
  res.render("publishernext");
});
// app.post("/login", async (req, res) => {
//     const { email, password } = req.body;


//     try {
//       console.log("Login attempt with email:", email);


//       // Check if email and password are provided
//       if (!email || !password) {
//         console.log("Email or password missing");
//         return res.status(400).send("Email and password are mandatory");
//       }


//       // Find the user by email
//       const user = await User.findOne({ email });


//       // Check if user exists
//       if (!user) {
//         console.log("User not found");
//         return res.redirect("/login"); // Redirect to login page if user doesn't exist
//       }


//       // Compare the provided password with the hashed password
//       const isPasswordValid = await bcrypt.compare(password, user.password);


//       // Check if password is valid
//       if (!isPasswordValid) {
//         console.log("Invalid password");
//         return res.status(401).send("Invalid credentials");
//       }


//       // Store user data in session
//       req.session.user = user;


//       // Redirect to home page
//       console.log("User logged in successfully");
//       res.redirect("/home");


//     } catch (error) {
//       console.error("Login error:", error);
//       return res.status(500).send("An error occurred during login.");
//     }
//   });


// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   if (email && password) {
//     try {
//       const user = await User.findOne({ email });


//       if (user) {
//         // Compare the provided password with the hashed password stored in the database
//         const isPasswordMatch = await bcrypt.compare(password, user.password);


//         if (isPasswordMatch) {
//           req.session.user = user; // Store user data in session
//           res.redirect("/home");
//         } else {
//           res.redirect("/login");
//         }
//       } else {
//         res.redirect("/login");
//       }
//     } catch (error) {
//       console.error("Error logging in:", error);
//       res.status(500).send("An error occurred while processing your request");
//     }
//   } else {
//     res.render("/login", {
//       error: "Email and password are mandatory",
//     });
//   }
// });
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (email && password) {
    try {
      const user = await User.findOne({ email });


      if (user) {
        // Compare the provided password with the hashed password stored in the database
        const isPasswordMatch = await bcrypt.compare(password, user.password);


        if (isPasswordMatch) {
          req.session.user = user; // Store user data in session
          res.redirect("/home");
        } else {
          // Password does not match
          res.render("login", {
            error: "Incorrect password. Please try again.",
          });
        }
      } else {
        // Email does not exist in the database
        res.render("login", {
          error: "Email not found. Please check your email and try again.",
        });
      }
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).send("An error occurred while processing your request");
    }
  } else {
    // Email or password is missing in the form submission
    res.render("login", {
      error: "Email and password are mandatory",
    });
  }
});



app.post("/signup", async (req, res) => {
  const { firstname, lastname, email, password, gender } = req.body;

  // Validate mandatory fields
  if (!email || !password || !firstname || !gender) {
    return res.render("signup", {
      error: "Firstname, email, password, and gender are mandatory fields.",
    });
  }

  // Email format validation - must end with @sitpune.edu.in
  const emailString = Array.isArray(email) ? email.join("") : email;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@sitpune\.edu\.in$/;
  if (!emailRegex.test(emailString)) {
    return res.render("signup", {
      error: "Please use a valid SIT Pune email address.",
    });
  }

  // Password strength validation - at least 7 characters, one digit, one uppercase, and one special character
  const passwordString = Array.isArray(password) ? password.join("") : password;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{7,}$/;
  if (!passwordRegex.test(passwordString)) {
    return res.render("signup", {
      error: "Password must be at least 7 characters long, include one uppercase letter, one digit, and one special character.",
    });
  }

  const genderString = Array.isArray(gender) ? gender.join("") : gender;


  const otp = otpGenerator.generate(6, {
    digits: true,
    alphabets: false,
    upperCase: false,
    specialChars: false,
  });
  await sendOTP(email, otp);
  req.session.otp = otp;


  // Hash the password
  const hashedPassword = await bcrypt.hash(passwordString, 10); // 10 is the salt rounds



  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email: emailString });
    if (existingUser) {
      return res.render("signup", {
        error: "This email is already registered. Please use a different email.",
      });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });
    await sendOTP(emailString, otp);
    req.session.otp = otp;
    req.session.userDetails = {
      firstname,
      lastname,
      email: emailString,
      password: passwordString, // Store raw password temporarily for hashing after OTP verification
      gender: genderString,
    };

    // Render OTP verification page
    res.render("otp_verification", { email: emailString });
  } catch (error) {
    // Handle signup errors
    console.error("Signup error:", error);
    return res.render("error", {
      error: "An error occurred. Please try again later.",
    });
  }
});


app.post("/verify_otp", async (req, res) => {
  const { otp } = req.body;
  const storedOTP = req.session.otp;


  if (otp === storedOTP) {
    // OTP is correct, proceed to save user details
    const { firstname, lastname, email, password, gender } = req.session.userDetails;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Create and save user
    const user = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      gender, // Store hashed password in the database
    });

    await user.save();

    // Store user data in session
    req.session.user = user;

    // Clear OTP from session
    delete req.session.otp;
    delete req.session.userDetails;

    // Redirect to home page
    res.redirect("/home");
  } else {
    // Invalid OTP, render an error message
    res.render("otp_verification", {
      error: "Invalid OTP, please try again.",
    });
  }
});

app.post("/verify_otp2", async (req, res) => {
  const { otp } = req.body;
  const storedOTP = req.session.otp;


  if (otp === storedOTP) {
    // OTP is correct, set the user session
    const user = req.session.user;
    req.session.user = user;
   


    // Redirect to home page
    res.redirect("/startride");
  } else {
    // Invalid OTP, render an error message
    res.render("otp_verification2", {
      error: "Invalid OTP, please try again.",
    });
  }
});


// app.get("/account", isLoggedIn, async (req, res) => {
//   try {
//     // Fetch user data from the session
//     const user = req.session.user;


//     // Log the user object to check its structure
//     console.log("User object:", user);


//     // If user data is found in the session, render the account.ejs template with user data
//     if (user && user.firstname) {
//       res.render("account", { user });
//     } else {
//       return res
//         .status(404)
//         .json({ error: "User not found or missing firstname" });
//     }
//   } catch (error) {
//     console.error("Error fetching user profile:", error);
//     return res
//       .status(500)
//       .json({ error: "An error occurred while fetching user profile" });
//   }
// });


// app.get("/account/:email", async (req, res) => {
//   try {
//     const userEmail = req.params.email;


//     // Fetch user data from the database based on the provided email
//     const user = await User.findOne({ email: userEmail });


//     // If user data is found, render the account.ejs template with user data
//     if (user) {
//       res.render("account", { user });
//     } else {
//       return res.status(404).json({ error: "User not found" });
//     }
//   } catch (error) {
//     console.error("Error fetching user profile:", error);
//     return res
//       .status(500)
//       .json({ error: "An error occurred while fetching user profile" });
//   }
// });


app.get("/", (req, res) => {
  res.render("landing"); // Render the 'login.ejs' template
});


app.post("/processLocation", (req, res) => {
  const { location2: receivedLocation2 } = req.body;
  console.log("Received location2:", receivedLocation2);
  req.session.location2 = receivedLocation2;


  // Assign the received location2 to the global variable
  location2 = receivedLocation2;
  // Here you can process the location2 data as needed, such as performing calculations or additional actions
  //calculateDistance(location2);
  // Send a response back to the client
  //res.json({ message: "Location data received successfully" });
  res.render("calculatedistance", { location2 });
});
app.get("/getLocation2", (req, res) => {
  try {
    const loggedInUser = req.session.user;
    const location2 = req.session.location2;
    /* fetch location2 from wherever it's stored */ // Combine the user details and location2 into a single JSON object
    const responseData = {
      user: loggedInUser,
      gender: loggedInUser.gender,
      location2: location2, // Assuming location2 is fetched from somewhere else in your code
    };


    // Send the combined data as the JSON response
    res.json(responseData);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.sendStatus(500); // Send an error response if something goes wrong
  }
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));









// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const userRoutes = require('../routes/userRoutes');
// const dotenv = require('dotenv');
// const locationRoutes = require('../routes/locationRoutes');
// const location2Routes = require('../routes/location2Routes');
// const riderRoutes = require('../routes/riderRoutes');
// const path = require("path");
// const session = require('express-session'); // Include express-session

// dotenv.config();
// const app = express();
// const PORT = process.env.PORT || 3000;
// // Middleware
// app.use(bodyParser.json()); // Parse JSON request bodies
// app.use(bodyParser.urlencoded({ extended: true }));
// // Routes
// app.use('/api/users', userRoutes);
// app.use('/api/locations', locationRoutes);
// app.use('/api/location2', location2Routes);
// app.use('/api/riders', riderRoutes);


// // Set up session middleware
// app.use(session({
//   secret: process.env.SECRET|| 'your_secret_key', // Use a strong secret
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false } // Set 'secure: true' if using HTTPS
// }));

// // Set up view engine
// app.set("view engine", "ejs"); // Set EJS as the view engine
// app.set("views", path.join(__dirname, "../views"));
// app.use("/public", express.static(path.join(__dirname, "../public")));



// // Database connection
// const dbURI = process.env.MONGODB_URI; // Read the URI from .env
// console.log("MongoDB URI: ", dbURI); // Log for debugging

// mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB connected successfully'))
//   .catch(err => console.error('MongoDB connection error:', err));


// app.get("/", (req, res) => {
//   res.render("landing"); 
// });

// app.get("/login", (req, res) => {
//   res.render("login");
// });

// app.get("/home", (req, res) => {
//   // Check if the user is authenticated
//   if (req.session.user) {
//     res.render("home", { user: req.session.user }); // Render the 'home.ejs' template
//   } else {
//     res.redirect("/login"); // Redirect to login if not authenticated
//   }
// });

// // Start the server
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });
