let playing = true;
let attempts = 0;
let round = 0;
let questionEl = document.getElementById("question");
let imageParent = document.getElementById("image-container");
let imageEl = document.getElementById("club-image");
let feedbackEl = document.querySelector(".spel-feedback-container");

// functies om drag en drop toe te kunnen passen:
function allowDrop(e) {
  e.preventDefault();
}
function drag(e) {
  e.dataTransfer.setData("text", e.target.id);
}
function drop(e) {
  e.preventDefault();
  console.log("attempts: " + attempts)
  let data = e.dataTransfer.getData("text");
  e.target.appendChild(document.getElementById(data));

  // antwoord checken 
  let correctLeague = leagues.find((league) => league.id === clubs[round].league);
  let leagueName = correctLeague.name.substring(0, correctLeague.name.length - 3); // remove numbering from API
  let league = leagueName.replace(/\s+/g, ''); // remove spaces 
  let received = e.target.nextElementSibling.children[0].innerText.replace(/\s+/g, ''); // remove spaces

  if (league === received) {
    showFeedback("success", leagueName);

  } else {
    showFeedback("fail", leagueName);
  }
}

function endRound() {
  attempts = 0;
  setTimeout(() => {
    round++;
    console.log("round: " + round)
    feedbackEl.hidden = true;
    document.querySelector(".image-container").style.display = "";
    if (playing) {
      imageParent.appendChild(imageEl);
      play("Wich league?", clubs[round]) // new round
    } else {
      console.log("spel is beeindigd")
      // endGame(); // show score on screen
    }
  }, 3000)
}

// functie voor de feedback te tonen
function showFeedback(type, leagueName) {
  document.querySelector(".image-container").style.display = "none"; // hide image-container
  feedbackEl.removeAttribute("hidden"); // show feedback-container
  if (type === "success") {
    feedbackEl.style.backgroundColor = "#30a56e";
    feedbackEl.children[0].textContent = "Correct!";
    feedbackEl.children[1].textContent = `${clubs[round].name} does play in ${leagueName}`;
    endRound();
  } else {
    if (attempts <= 1) {
      feedbackEl.style.backgroundColor = "#e54e4e";
      feedbackEl.children[0].textContent = "Try again!";
      feedbackEl.children[1].textContent = "";
      attempts++;
    } else {
      feedbackEl.style.backgroundColor = "#e54e4e";
      feedbackEl.children[0].textContent = "Wrong!";
      feedbackEl.children[1].textContent = `${clubs[round].name} does play in ${leagueName}`;
      endRound();
    }
  }
}

function play(question, club) {
  attempts++;
  // als eerste de vraag met afbeelding tonen
  questionEl.textContent = question
  imageEl.setAttribute("src", `data:image/jpeg;base64, ${club.image}`);

  // alle league elementen ophalen
  let leagueTxts = document.querySelectorAll(".league-text > p");
  
  // juiste league ophalen met 2 randoms erbij
  let correctLeague = leagues.find((league) => league.id === club.league);
  let league2 = leagues[Math.floor(Math.random() * 20)];
  let league3 = leagues[Math.floor(Math.random() * 20)];
  
  // dit is de array met namen die we gaan tonen en we shuffelen die, zodat het niet altijd dezelfde volgorde heeft
  let leagueNames = [correctLeague.name, league2.name, league3.name];
  const shuffledNames = leagueNames.sort((a, b) => 0.5 - Math.random());

  // tonen op scherm
  leagueTxts.forEach((leagueTxt, index) => {
    leagueTxt.textContent = shuffledNames[index].substring(0, shuffledNames[index].length - 3)
  })  
}


/**
 * HET SPEL
 */
// eerste keer wordt dit sowieso uitgevoerd 
play("Wich league?", clubs[round])

// als de button wordt geklikt
document.getElementById("stopBtn").addEventListener("click", () => {
  playing = false;
})