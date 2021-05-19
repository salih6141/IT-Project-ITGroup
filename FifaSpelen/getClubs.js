// This file was used to write all clubs with image to a json-file
const fetch = require("node-fetch");
const fs = require('fs/promises');
require("dotenv").config();

// functie voor eerste 20 clubs op te halen, deze worden opgeslagen in een array die wordt gestuurd naar de frontend
const getClubs = async() => {
  let array = []
  try {
    let promise = await fetch(`https://futdb.app/api/clubs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-AUTH-TOKEN": process.env.API_TOKEN
      },
    });
    let result = await promise.json(); 
    // de eerste 20 clubs in de array steken
    array.push(...result.items)
    // al de andere pagina's doen
    for (let i = 2; i <= result.page_total; i++) {
      try {
        let promise = await fetch(`https://futdb.app/api/clubs?page=${i}`, {
          method: 'GET',
          headers: {
            "Content-Type": "application/json",
            "X-AUTH-TOKEN": process.env.API_TOKEN,
          },
        });
        let response = await promise.json();
        // de eerste 20 clubs in de array steken
        array.push(...response.items);
      } catch (error) {
        throw new Error("iets verkeerd gegaan bij het ophalen van de andere pagina's")
      }
    }
    console.log(array.length)
    return array;
  } catch (error) {
    throw new Error(`iets is mis gegaan bij het ophalen van alle clubs (eerste pagina)`)
  }
} 
getClubs().then(async(clubs) => {
  let array = clubs;
  for (let i = 0; i < array.length; i++) {
    let image = await getImage(clubs[i])
    array[i].image = image; 
  }
  await fs.writeFile('clubs.json', JSON.stringify(array))
})


const getImage = async(club) => {
  try {
    let promise = await fetch(`https://futdb.app/api/clubs/${club.id}/image`, {
      method: "GET",
      headers: {
        "Content-Type": "image/png",
        "X-AUTH-TOKEN": process.env.API_TOKEN
      },
    });
    let result = await promise.arrayBuffer();
    // omvormen naar base64 (enkel zo kunnen we afbeelding tonen)
    let image = new Buffer(result).toString('base64');
    return image;
  } catch (error) {
    console.log("error: " + club.id)
  }
};