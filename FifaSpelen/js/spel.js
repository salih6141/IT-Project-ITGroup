const config = {
  method: 'GET',
  headers: {
    "X-Auth-Token": "c7634c97-6830-4b13-acce-c3ee25784d4e",
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  mode: 'no-cors'
}

// nodige functies aanmaken
const getClubs = async() => {
  let result = await fetch('https://futdb.app/api/clubs', config);
  console.log("ik ben uitgevoerd")
  return result;
}

const getLeagues = async() => {
  let result = await fetch('https://futdb.app/api/leagues', config);
  console.log(result);
  return json.items;
}

const getImage = async(club) => {
  let result = await fetch('https://futdb.app/api/clubs/1/image', config);
  console.log(result);
  return image;
};

// alle clubs ophalen en opslaan
getClubs().then(data => console.log(data))

// image tonen op de pagina 
// let image = document.createElement("img");
// image.src = getImage(clubs[0]);
// document.getElementById("club-image").append(image);