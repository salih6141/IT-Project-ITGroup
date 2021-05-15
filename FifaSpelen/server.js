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

async function writeToDatabase(data) {
  const client = new MongoClient(process.env.DB_CONNECT,{ useNewUrlParser: true, useUnifiedTopology: true } );
  try {
    // connectie leggen met DB
    await client.connect();
    await client.db('Fifa').collection('clubs').insert(data)
  } catch (exception){
    console.log(exception);
  }
  finally {
    client.close();
  }
}

// DATA
const data = { clubs: [], leagues: [] };

// functie voor afbeeldingen (van clubs) op te halen
const getImage = async(clubId) => {
  try {
    let response = await fetch(`https://futdb.app/api/clubs/${clubId}/image`, {
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
    // we willen 20 requests sturen voor 20 random clubs op te halen
    for (let i = 1; i <= 20; i++) {
      // een random id bepalen
      let randomId = Math.floor((Math.random() * 797) + 1);

      let response = await fetch(`https://futdb.app/api/clubs/${randomId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-AUTH-TOKEN": process.env.API_TOKEN
        }, 
      }); 
      if (response.status === 500) {
        console.log("er is geen club gevonden")
        continue;
      }
      let result = await response.json();
      console.log(result)
      // dan slaan we deze club op in een variabele
      let club = result.item;
      // aan deze variabele voegen we een image van die club toe
      club.image = await getImage(randomId);
      // dit object slaan we dan op in onze array dat gestuurd wordt naar de frontend
      data.clubs.push(club);
    }
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
  // console.log(data);
  console.log("aantal clubs gevonden: " + data.clubs.length)
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