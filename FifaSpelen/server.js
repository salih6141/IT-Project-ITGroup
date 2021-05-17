const express = require ("express");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();

// middleware
app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs");

app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({extended: false})); 

// DATA
const data = { clubs: [], leagues: [] };

// functie voor afbeeldingen (van clubs) op te halen
const getImage = async(clubId) => {
  try {
    let response = await fetch(`https://futdb.app/api/clubs/${Math.random()*797}/image`, {
      method: "GET",
      headers: {
        "Content-Type": "image/png",
        "X-AUTH-TOKEN": process.env.API_TOKEN,
      },
    });
    let result = await response.arrayBuffer();
    // omvormen naar base64 (enkel zo kunnen we afbeelding tonen)
    let image = new Buffer(result).toString('base64');
    return image;
  } catch (error) {
    console.log(error)
  }
};

// functie voor eerste 20 clubs op te halen, deze worden opgeslagen in een array die wordt gestuurd naar de frontend
const getClubs = async() => {
  try {
    // deze request zal 20 clubs terugsturen, zolang zal een speelbeurt duren
    let response = await fetch("https://futdb.app/api/clubs", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-AUTH-TOKEN": process.env.API_TOKEN
      },
    });
    let result = await response.json();
    data.clubs = await Promise.all(result.items.map(async(club) => {
      club.image = await getImage(club.id);
      return club;
    }));
  } catch (error) {
    console.log(error)
  }
} 
getClubs()

//functie voor alle leagues op te halen, die slaan we op in een array en sturen we naar de frontend 
const getLeagues = async() => {
  let array = [];
  try {
    // eerste request voor de leagues van pagina 1 te krijgen (20, in totaal zijn er 48)
    let response = await fetch('https://futdb.app/api/leagues', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-AUTH-TOKEN": process.env.API_TOKEN
      },
    });
    // de eerste 20 leagues
    let result = await response.json();
    if (result !== undefined)
      array.push(...result.items);

    // loopen over het aantal pagina's en voor elke pagina terug request doen en bijsteken in array
    for (let i = 2; i <= result.page_total; i++) {
      try {
        let response = await fetch(`https://futdb.app/api/leagues?page=${i}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-AUTH-TOKEN": process.env.API_TOKEN
          },
        });
        let result = await response.json();
        array.push(...result.items);
      } catch (error) {
        console.log("er is een error")
        console.log(error)
      } 
    }
    data.leagues = array;
  } catch (error) {
    console.log(error)
  }
}
getLeagues();


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
  // console.log(data)
  res.render("spel", {
    clubs: JSON.stringify(data.clubs),
    leagues: JSON.stringify(data.leagues),
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