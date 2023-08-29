//TODO scroll osv. knapper. finn navn fra 5 min +vis navn metode
/*
Hvor mange samtaler kan man ha samtidig



*/

var startAutomatisk = true;
var whisperTalegjennkjenning = true;
var googleTalegjennkjenning = true;
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var talegjennkjenning;
var talegjennkjenningErPaa = false;
var fortsettNaarTilbake = false;
var skjermLaas;
var forrigeTekst = "";

var tekstBoks = document.getElementById("tekstBoks");
var metodevalg = document.getElementById("metodevalg");
var whisperValg = document.getElementById("whisper");
var whisperBeholder = document.getElementById("whisperBeholder");
var googleValg = document.getElementById("google");
var googleBeholder = document.getElementById("googleBeholder");
var webkitValg = document.getElementById("webkit");
var webkitBeholder = document.getElementById("webkitBeholder");
var tekstBoksBeholder = document.getElementById("tekstBoksBeholder");
var bekreftMetodeKnapp = document.getElementById("bekreftMetodeKnapp");
var visValgIgjenKnapp = document.getElementById("visValgIgjenKnapp");
var startOgStoppKnapp = document.getElementById("startOgStoppKnapp");

document.body.onload = function () {
  visTekstboks(false);
  sjekkStotteForMetoder();
  fjernValgteRadioKnapper();
  visMetodeValg(true);
  bekreftMetodeKnapp.addEventListener("click", bekreftMetodeTrykket);
  visValgIgjenKnapp.addEventListener("click", endreMetodeValgTrykket);
  startOgStoppKnapp.addEventListener("click", startOgStoppTrykket);
  whisperValg.addEventListener("click", metodeValgVisualisering);
  googleValg.addEventListener("click", metodeValgVisualisering);
  webkitValg.addEventListener("click", metodeValgVisualisering);
};

function metodeValgVisualisering() {
  if (whisperValg.checked) {
    whisperBeholder.classList.add("selected");
  } else {
    whisperBeholder.classList.remove("selected");
  }
  if (googleValg.checked) {
    googleBeholder.classList.add("selected");
  } else {
    googleBeholder.classList.remove("selected");
  }
  if (webkitValg.checked) {
    webkitBeholder.classList.add("selected");
  } else {
    webkitBeholder.classList.remove("selected");
  }

  if (!whisperValg.checked && !googleValg.checked && !webkitValg.checked) {
    bekreftMetodeKnapp.disabled = true;
  } else {
    bekreftMetodeKnapp.disabled = false;
  }
}

function sjekkStotteForMetoder() {
  if (whisperTalegjennkjenning) {
    whisperBeholder.classList.remove("unavailable");
    whisperValg.disabled = false;
  } else {
    whisperBeholder.classList.add("unavailable");
    whisperValg.disabled = true;
    whisperValg.checked = false;
  }
  if (googleTalegjennkjenning) {
    googleBeholder.classList.remove("unavailable");
    googleValg.disabled = false;
  } else {
    googleBeholder.classList.add("unavailable");
    googleValg.disabled = true;
    googleValg.checked = false;
  }
  if (SpeechRecognition) {
    webkitBeholder.classList.remove("unavailable");
    webkitValg.disabled = false;
  } else {
    webkitBeholder.classList.add("unavailable");
    webkitValg.disabled = true;
    webkitValg.checked = false;
  }

  if (
    !whisperTalegjennkjenning &&
    !SpeechRecognition &&
    !googleTalegjennkjenning
  ) {
    console.log("Ingen metoder støttes"); //TODO advar og hjelp
  }
}

function fjernValgteRadioKnapper() {
  whisperValg.checked = false;
  googleValg.checked = false;
  webkitValg.checked = false;
}

function visMetodeValg(avEllerPaa) {
  if (avEllerPaa) {
    metodevalg.style.display = "block";
    metodevalg.disabled = false;
    visValgIgjenKnapp.style.display = "none";
    visValgIgjenKnapp.disabled = true;
    metodevalg.disabled = false;
    metodeValgVisualisering();
  } else {
    metodevalg.style.display = "none";
    metodevalg.disabled = true;
    visValgIgjenKnapp.style.display = "block";
    visValgIgjenKnapp.disabled = false;
  }
}
function visTekstboks(avEllerPaa) {
  if (avEllerPaa) {
    tekstBoksBeholder.style.display = "block";
  } else {
    tekstBoksBeholder.style.display = "none";
  }
}

function endreMetodeValgTrykket() {
  if (talegjennkjenning) {
    if (talegjennkjenningErPaa) {
      talegjennkjenning.stop();
    }
  }
  visMetodeValg(true);
  visTekstboks(false);
}

function startOgStoppTrykket() {
  if (talegjennkjenning) {
    if (talegjennkjenningErPaa) {
      talegjennkjenning.stop();
    } else {
      talegjennkjenning.start();
    }
  } else {
    sjekkStotteForMetoder();
    visMetodeValg(true);
  }
}

function bekreftMetodeTrykket() {
  let valgBleTatt = false;
  if (whisperValg.checked) {
    setOppWhisperTalegjennkjenning();
    valgBleTatt = true;
  } else if (googleValg.checked) {
    setOppGoogleTalegjennkjenning();
    valgBleTatt = true;
  } else if (webkitValg.checked) {
    setOppWebkitTalegjennkjenning();
    valgBleTatt = true;
  } else {
    console.log("Ingen metode valgt");
  }

  if (valgBleTatt) {
    visMetodeValg(false);
    visTekstboks(true);
    if (startAutomatisk) {
      startOgStoppTrykket();
    }
  }
}

function setOppWhisperTalegjennkjenning() {
  setOppWebkitTalegjennkjenning(); //TODO implementer
}

function setOppGoogleTalegjennkjenning() {
  setOppWebkitTalegjennkjenning(); //TODO implementer
}

function setOppWebkitTalegjennkjenning() {
  talegjennkjenning = new SpeechRecognition();
  talegjennkjenning.continuous = true;
  talegjennkjenning.lang = "nb-NO";
  talegjennkjenning.interimResults = true;
  talegjennkjenning.maxAlternatives = 1;

  talegjennkjenning.onresult = function (event) {
    console.log(event.results);
    let nyTekst = "";
    for (let i = 0; i < event.results.length; i++) {
      const element = event.results[i];
      nyTekst += element[0].transcript;
    }
    nyTekst = erstattOrd(nyTekst);
    settTekstBoksTekstTil(forrigeTekst + nyTekst);
  };

  talegjennkjenning.onstart = function () {
    talegjennkjenningErPaa = true;
    startOgStoppKnapp.value = "Stopp Talegjennkjenning";
    startOgStoppKnapp.textContent;
    console.log("Tale startet");
    leggTilStatusInfoItekstboks("  [Lytter nå]  ");
    justerTekstBoksHoyde();
    tekstBoks.disabled = false;
    holdSkjermVaaken();
  };

  talegjennkjenning.onend = function () {
    sluttetAaLytte();
    console.log("Tale avsluttet");
  };

  talegjennkjenning.onerror = function (event) {
    sluttetAaLytte();
    console.log("Tale feilmelding");
  };

  talegjennkjenning.onspeechend = function () {
    //lytterIkkeLengre();
    //console.log("Tale sluttet");
  };

  talegjennkjenning.onnomatch = function (event) {
    console.log(event);
  };
}

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

function tekstUtenStatus() {
  return tekstBoks.value.replace(/ *\[[^)]*\] */g, "");
}

function leggTilStatusInfoItekstboks(ekstraTekst) {
  settTekstBoksTekstTil(tekstUtenStatus() + ekstraTekst);
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
    tekstBoks.style.height = "80vh";
    tekstBoks.scroll({
      top: innholdHoyde,
      left: 0,
      behavior: "smooth", //Auto for rask, smooth for treg
    });
  }
}

function sluttetAaLytte() {
  forrigeTekst = tekstUtenStatus() + " ";
  leggTilStatusInfoItekstboks("  [sluttet å lytte]  ");
  tekstBoks.disabled = true;
  talegjennkjenningErPaa = false;
  startOgStoppKnapp.value = "Start Talegjennkjenning";
  laSkjermSovne();
}

window.addEventListener(
  "focus",
  function (event) {
    if (fortsettNaarTilbake && talegjennkjenningErPaa === false) {
      console.log("Fortsetter");
      leggTilStatusInfoItekstboks("  [klar til å fortsette]  ");
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

/*
window.addEventListener(
  "click",
  function (event) {
    document.body.requestFullscreen();
  },
  false
);
*/

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

function isScreenLockSupported() {
  return "wakeLock" in navigator;
}

async function holdSkjermVaaken() {
  if (isScreenLockSupported()) {
    try {
      skjermLaas = await navigator.wakeLock.request("screen");
      console.log("Hindrer skjerm i å sovne");
    } catch (err) {
      console.log(err.name, err.message);
    }
    return skjermLaas;
  }
}

function laSkjermSovne() {
  if (typeof skjermLaas !== "undeinfed" && skjermLaas != null) {
    skjermLaas.release().then(() => {
      console.log("Lar skjerm sovne");
      skjermLaas = null;
    });
  }
}
