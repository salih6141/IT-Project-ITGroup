let attempts = 0;
let score = 0;
let round = 0;

let questionEl = document.getElementById("question");
let imageParent = document.getElementById("image-container");
let imageEl = document.getElementById("club-image");
let imagesContainerEl = document.querySelector(".image-container-parent");
let feedbackEl = document.querySelector(".spel-feedback-container");
let selectContainerEl = document.querySelector(".club-select-container");
let selectEl = document.getElementById("clubs-select");

let club = {}

// functies om drag en drop toe te kunnen passen:
function allowDrop(e) {
  e.preventDefault();
}
function drag(e) {
  e.dataTransfer.setData("text", e.target.id);
}

// START HET SPEL
playGame()

async function playGame() {
  attempts = 0;
  round++;
  // show needed elements again:
  imageParent.style.display = "";
  imagesContainerEl.style.display = "";
  // hide everything else:
  selectContainerEl.setAttribute("hidden", true);

  imageParent.appendChild(imageEl);
  club = clubs[Math.floor(Math.random() * clubs.length)]

  // als eerste de vraag met afbeelding tonen
  questionEl.textContent = "In which league plays this club ?"
  imageEl.setAttribute("src", `data:image/jpeg;base64, ${club.image}`);
  imageEl.setAttribute("draggable", true); // make image draggable

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

// een eventListener plakken om te luisteren naar wanneer een image wordt gedropt
document.querySelectorAll(".league-container").forEach((node) => {
  node.addEventListener("drop", async(e) => {
    console.log('image gedropt')
    e.preventDefault();
    let data = e.dataTransfer.getData("text");
    e.target.appendChild(document.getElementById(data));

    // antwoord checken 
    let correctLeague = leagues.find((league) => league.id === club.league);
    let leagueName = correctLeague.name.substring(0, correctLeague.name.length - 3); // remove numbering from API
    let league = leagueName.replace(/\s+/g, ''); // remove spaces 
    let received = e.target.nextElementSibling.children[0].innerText.replace(/\s+/g, ''); // remove spaces

    if (league === received) {
      await showFeedback("success", "Correct!", `${club.name} plays in ${leagueName}`, false, true);
      bonusQuestion(correctLeague)
    } else if (attempts < 1) {
      attempts += 1
      showFeedback("fail", "Try again!", "", true, false);
    } else {
      await showFeedback("fail", "Wrong!", `${club.name} plays in ${leagueName}`, false, true)
      playGame()
    }  
  })
})

async function bonusQuestion(correctLeague) {
  // Hide image & image-boxes & feedback after 2 seconds
  imageParent.style.display = "none";
  imagesContainerEl.style.display = "none";
  // new question:
  questionEl.textContent = `Select three clubs who also play in ${leagues.find((league) => league.id === club.league).name}, hold ctrl button in while selecting clubs.`;
  // Show SELECT 
  selectContainerEl.removeAttribute("hidden");
  // Alle options wegdoen voor het geval dat er al options zijn.
  while (selectEl.firstChild) {
    selectEl.removeChild(selectEl.firstChild);
  }
  // 6 clubs tonen in de select, 3 random en 3 correct:
  let correcteclubs = [];
  let allclubs = [];
  let allclubsmix = [];
  for (let i = 0; i < clubs.length; i++) {
    if(correctLeague.id === clubs[i].league){
        correcteclubs.push(clubs[i].name)
    }
  }
  for (let i = 0; i < 3; i++) {
    allclubs.push(correcteclubs[i]);
  }
  for (let i = 0; i < 3; i++) {
    let selectLevel =Math.floor(Math.random() * clubs.length) + 1;
    if(correctLeague.id !== clubs[selectLevel].league){
        allclubs.push(clubs[selectLevel].name)
    }
  }
  for(let i = 0; i < 6;i++){
    let random = Math.floor(Math.random() * allclubs.length);
    allclubsmix.push(allclubs[random]);
    allclubs.splice(random,1);
  }
  // tonen op scherm
  allclubsmix.forEach((club) => {
    let option = document.createElement("option");
    option.value = club;
    option.textContent = club;
    selectEl.appendChild(option);
  })

  // listening to form-submit
  document.getElementById("clubs-form").addEventListener("submit", async(e) => {
    e.preventDefault();

    // retrieving selected values 
    let selectEl = document.getElementById("clubs-select");
    let selectedValues = Array.from(selectEl.selectedOptions).map(options => options.value) // array with names of selected clubs
    // als er geen 3 zaken zijn geselecteerd tonen we error-message, anders gaan we verder
    if (selectedValues.length !== 3) {
      selectEl.classList.add("is-invalid")
    } else {
      selectEl.classList.remove("is-invalid")
      
      // nieuwe array met de club-objecten van de geselecteerde namen
      let selectedClubs = selectedValues.map((name) => clubs.find((club) => club.name === name))
      // volgende stap is valideren of de clubs juist zijn en feedback tonen:
      let incorrectAnswers = [];
      selectedClubs.forEach((club) => {
        if (club.league !== correctLeague.id) {
          incorrectAnswers.push(club)
        }
      })
      if (incorrectAnswers.length === 0) {
        await showFeedback("success", "Awesome!", "", false, true);
        playGame();
      } else {
        let text = "";
        switch (incorrectAnswers.length) {
          case 1:
            text += `${incorrectAnswers[0].name} does not play in the same league`
            break;
          case 2:
            text += `${incorrectAnswers[0].name} and ${incorrectAnswers[1].name} do not play in the same league`
            break;
          case 3:
            text += "none of the selected clubs play in the same league"
            break;
          default:
            break;
        }
        await showFeedback("fail", "Wrong!", text, false, true);
        playGame();
      }
    }
  })
}



// functie voor feedback te tonen (3 seconden)
async function showFeedback(type, title, text, draggable, timed) {
  imageParent.style.display = "none" // hide image-container
  feedbackEl.removeAttribute("hidden"); // render feedback-container instead
  
  // show feedback
  feedbackEl.style.backgroundColor = type === "success" ? "#30a56e" : "#e54e4e";
  feedbackEl.children[0].textContent = title;
  feedbackEl.children[1].textContent = text;
  imageEl.setAttribute("draggable", draggable); // after correct answer or 2 wrong answers, not possible to drag again

  // removing feedback after 3 seconds 
  if (timed) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        feedbackEl.setAttribute("hidden", true);
        imageParent.removeAttribute("hidden");
        resolve("done")
      }, 3000);
    })
  }
}

// STOP: als de stop button wordt geklikt
document.getElementById("stopBtn").addEventListener("click", () => {
  console.log("einde spel")
  //hide everything and show score in the middle of screen 
})
