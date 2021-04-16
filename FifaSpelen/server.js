const express = require ("express");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();

// middleware
app.set("port", process.env.PORT || 8088);
app.set("view engine", "ejs");

app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({extended: false})); 

// Data ophalen
const getClubs = async(array) => {
  try {
    console.log("clubs worden opgehaald...")
    // deze request zal 20 clubs terugsturen, zolang zal een speelbeurt duren
    let response = await fetch("https://futdb.app/api/clubs", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-AUTH-TOKEN": "3338e8d6-7c86-4779-9ae0-e9b46804be06"
      },
      mode: "no-cors"
    });
    let result = await response.json();
    array = result.items;
  } catch (error) {
    throw error;
  }
}
let clubs = [];
getClubs(clubs);

const getLeagues = async(array) => {
  try {
    console.log("leagues worden opgehaald...")
    // eerste request voor pagina 1
    let response = await fetch('https://futdb.app/api/leagues', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-AUTH-TOKEN": "3338e8d6-7c86-4779-9ae0-e9b46804be06"
      },
      mode: "no-cors"
    });
    let result = await response.json();
    // da al opslaan in de array
    array.push(...result.items);
    // loopen over aantal pagina's en voor elke pagina terug request doen en opslaan in array
    for (let i = 2; i <= result.page_total; i++) {
      let response = await fetch(`https://futdb.app/api/leagues?page=${i}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-AUTH-TOKEN": "3338e8d6-7c86-4779-9ae0-e9b46804be06"
      },
      mode: "no-cors"
    });
      let result = await response.json();
      array.push(...result.items) 
    }
  } catch (error) {
    throw error;
  }
}
let leagues = [];
getLeagues(leagues);

// const getImage = async(club) => {
//   try {
//     let result = await fetch('https://futdb.app/api/clubs/1/image', fetchConfig("image/png"));
//     console.log(result)
//     return image;  
//   } catch (error) {
//     throw error;
//   }
// };

/* Het renderen van de pagina's */ 
app.get("/", async(req, res) => {
  res.render("index");
});
app.get("/about", async(req, res) => {
  res.render("about");
})
app.get("/settings", async(req, res) => {
  res.render("settings");
})
app.get("/login", async(req, res) => {
  res.render("login");
})
app.get("/register", async(req, res) => {
  res.render("register");
})
app.get("/spel", async(req, res) => {
  res.render("spel", {
    clubs: JSON.stringify(clubs),
    leagues: JSON.stringify(leagues)
  });
})
app.get("/score", async(req, res) => {
  res.render("score");
})

// Error handling 
app.use((req, res) => {
	res.type("text/plain");
	res.status(404);
	res.send("404 - Not Found");
});

app.use((err, req, res) => {
	res.type("text/plain");
	res.status(500);
	res.send("500 - Server Error");
});

app.listen(app.get("port"), (error) => {
  if (error) {
      console.log('Something went wrong: ' + error)
  }
  else {
      console.log(`Server started on http://localhost:${app.get("port")}; press Ctrl-C to terminate.`)
  }
})