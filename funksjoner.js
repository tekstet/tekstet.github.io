var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || window.webkitSpeechGrammarList;
var SpeechRecognitionEvent =
  SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

var talegjennkjenningErPaa = false;
var talegjennkjenning = new SpeechRecognition();
talegjennkjenning.continuous = true;
talegjennkjenning.lang = "nb-NO";
talegjennkjenning.interimResults = true;
talegjennkjenning.maxAlternatives = 1;
var fortsettNaarTilbake = false;
var tekstBoks = document.getElementById("tekstBoks");

document.body.onload = function () {
  justerTekstBoksHoyde();
  talegjennkjenning.start();
};

talegjennkjenning.onresult = function (event) {
  console.log(event.results);
  let nyTekst = "";
  for (let i = 0; i < event.results.length; i++) {
    const element = event.results[i];
    nyTekst += element[0].transcript;
  }
  nyTekst = erstattOrd(nyTekst);
  settTekstBoksTekstTil(nyTekst);
};

const ordErstanninger = {
  " komma": ",",
  " punktum": ".",
  " utropstegn": "!",
  " spørsmålstegn": "?",
};

function erstattOrd(tekst) {
  for (const [key, value] of Object.entries(ordErstanninger)) {
    tekst = tekst.replaceAll(key, value);
  }
  return tekst;
}

function settTekstBoksTekstTil(denNyeTeksten) {
  tekstBoks.value = denNyeTeksten;
  justerTekstBoksHoyde();
}

function justerTekstBoksHoyde() {
  let innholdHoyde = tekstBoks.scrollHeight;

  var maksTotalHoyde = Math.max(
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.clientHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight
  );
  if (innholdHoyde < maksTotalHoyde) {
    tekstBoks.style.height = tekstBoks.scrollHeight + "px";
  } else {
    tekstBoks.style.height = "100vh";
    tekstBoks.scroll({
      top: innholdHoyde,
      left: 0,
      behavior: "smooth", //Auto for rask, smooth for treg
    });
  }
}

talegjennkjenning.onstart = function () {
  talegjennkjenningErPaa = true;
  console.log("Tale startet");
  settTekstBoksTekstTil("(Nå lytter vi og skal skrive ned det som blir sagt)");
  tekstBoks.disabled = false;
};

talegjennkjenning.onend = function () {
  lytterIkkeLengre();
  console.log("Tale avsluttet");
};

talegjennkjenning.onerror = function (event) {
  lytterIkkeLengre();
  console.log("Tale feilmelding");
};

talegjennkjenning.onspeechend = function () {
  //lytterIkkeLengre();
  //console.log("Tale sluttet");
};

talegjennkjenning.onnomatch = function (event) {
  console.log(event);
};

function lytterIkkeLengre() {
  settTekstBoksTekstTil("(sluttet å lytte)");
  tekstBoks.disabled = true;
  talegjennkjenningErPaa = false;
}

window.addEventListener(
  "focus",
  function (event) {
    if (fortsettNaarTilbake && talegjennkjenningErPaa === false) {
      console.log("Fortsetter");
      settTekstBoksTekstTil(
        "(klar til å fortsette å skrive ned det som blir sagt. Trykk godta igjen for å starte)"
      );
      talegjennkjenning.start();
    }
  },
  false
);

window.addEventListener(
  "blur",
  function (event) {
    if (talegjennkjenningErPaa) {
      fortsettNaarTilbake = true;
    }
  },
  false
);
document.addEventListener("keydown", tastetrykk, false);

function tastetrykk(e) {
  console.log(e.key);
  if (e.key === "Escape") {
    if (talegjennkjenningErPaa) {
      talegjennkjenning.stop();
    }
  } else if (e.key === "Enter") {
    if (talegjennkjenningErPaa === false) {
      talegjennkjenning.start();
    }
  }
}

window.addEventListener(
  "resize",
  function (event) {
    justerTekstBoksHoyde();
  },
  true
);
