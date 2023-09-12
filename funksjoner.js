//TODO scroll osv. knapper. finn navn fra 5 min +vis navn metode
/*
Hvor mange samtaler kan man ha samtidig


*/
const synth = window.speechSynthesis;
console.log(synth.getVoices());

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
var innstillinger = document.getElementById("innstillinger");
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
var testStemmeKnapp = document.getElementById("testStemmeKnapp");
var stemmeTestTekstInput = document.getElementById("stemmeTestTekstInput");
//var volumeInput = document.getElementById("volume");
var rateInput = document.getElementById("rate");
//var pitchInput = document.getElementById("pitch");
var voiceSelect = document.getElementById("voice");

document.body.onload = function () {
  visinnstillinger(false);
  visTekstboks(true);
  sjekkStotteForMetoder();
  setOppWhisperTalegjennkjenning();
  //fjernValgteRadioKnapper();
  bekreftMetodeKnapp.addEventListener("click", bekreftMetodeTrykket);
  visValgIgjenKnapp.addEventListener("click", endreinnstillingerTrykket);
  startOgStoppKnapp.addEventListener("click", startOgStoppTrykket);
  whisperValg.addEventListener("click", innstillingerVisualisering);
  googleValg.addEventListener("click", innstillingerVisualisering);
  webkitValg.addEventListener("click", innstillingerVisualisering);
  testStemmeKnapp.addEventListener("click", function (e) {
    if (stemmeTestTekstInput.value.length > 0) {
      si(stemmeTestTekstInput.value);
    }
  });

  var x = new SpeechSynthesisUtterance();
  x.text = "hei dette er norsk";
  speechSynthesis.speak(x);
};

function innstillingerVisualisering() {
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

  if ("speechSynthesis" in window) {
    console.log("Tale syntese støttes");
  } else {
    console.log("Tale syntese støttes ikke i denne nettleseren");
  }
}

function lastInnStemmer() {
  var voices = speechSynthesis.getVoices();

  voices.forEach(function (voice, i) {
    if (voice.lang.includes("nb-NO")) {
      var stemmeValg = document.createElement("option");
      stemmeValg.value = voice.name;
      stemmeValg.innerHTML = voice.name;

      voiceSelect.appendChild(stemmeValg);
    }
  });
  voices.forEach(function (voice, i) {
    if (voice.lang.includes("en-")) {
      var stemmeValg = document.createElement("option");
      stemmeValg.value = voice.name;
      stemmeValg.innerHTML = voice.name;
      if (voice.lang) {
        stemmeValg.innerHTML += "   (" + voice.lang + ")";
      }
      voiceSelect.appendChild(stemmeValg);
    }
  });
}

function fjernValgteRadioKnapper() {
  whisperValg.checked = false;
  googleValg.checked = false;
  webkitValg.checked = false;
}

function visinnstillinger(avEllerPaa) {
  if (avEllerPaa) {
    innstillinger.style.display = "block";
    innstillinger.disabled = false;
    visValgIgjenKnapp.style.display = "none";
    visValgIgjenKnapp.disabled = true;
    innstillinger.disabled = false;
    innstillingerVisualisering();
  } else {
    innstillinger.style.display = "none";
    innstillinger.disabled = true;
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

function endreinnstillingerTrykket() {
  if (talegjennkjenning) {
    if (talegjennkjenningErPaa) {
      talegjennkjenning.stop();
    }
  }
  visinnstillinger(true);
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
    visinnstillinger(true);
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
    visinnstillinger(false);
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
    let nyTekst = "";
    for (let i = 0; i < event.results.length; i++) {
      const element = event.results[i];
      nyTekst += element[0].transcript;
      if (element.isFinal === true && i === event.results.length - 1) {
        nyTekst += ". ";
        si(element[0].transcript + ". ");
      } else if (i === event.results.length - 1) {
        nyTekst += ". ";
      }
    }
    nyTekst = erstattOrd(nyTekst);
    settTekstBoksTekstTil(forrigeTekst + nyTekst);
  };

  talegjennkjenning.onstart = function () {
    talegjennkjenningErPaa = true;
    startOgStoppKnapp.value = "Stopp";
    startOgStoppKnapp.textContent;
    console.log("Tale startet");
    leggTilStatusInfoItekstboks("  [LYTTER NÅ]  ");
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
    console.log("ingen match for tale");
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
    tekstBoks.style.height = "70vh";
    tekstBoks.scroll({
      top: innholdHoyde,
      left: 0,
      behavior: "smooth", //Auto for rask, smooth for treg
    });
  }
}

function sluttetAaLytte() {
  forrigeTekst = tekstUtenStatus() + ". ";
  leggTilStatusInfoItekstboks("  [SLUTTET Å LYTTE]  ");
  tekstBoks.disabled = true;
  talegjennkjenningErPaa = false;
  startOgStoppKnapp.value = "Start";
  laSkjermSovne();
}

function si(tekst) {
  if (tekst.length > 0) {
    // Create a new instance of SpeechSynthesisUtterance.
    var msg = new SpeechSynthesisUtterance();

    // Set the text.
    msg.text = tekst;

    // Set the attributes.
    msg.volume = 1.0; //parseFloat(volumeInput.value);
    msg.rate = parseFloat(rateInput.value);
    msg.pitch = 1.0; //parseFloat(pitchInput.value);

    // If a voice has been selected, find the voice and set the
    // utterance instance's voice attribute.
    if (voiceSelect.value) {
      msg.voice = speechSynthesis.getVoices().filter(function (voice) {
        return voice.name == voiceSelect.value;
      })[0];
    }

    // Queue this utterance.
    window.speechSynthesis.speak(msg);
  }
}

window.addEventListener(
  "focus",
  function (event) {
    //TODO vent på godkjenning fra bruker også
    if (fortsettNaarTilbake && talegjennkjenningErPaa === false) {
      console.log("Fortsetter");
      leggTilStatusInfoItekstboks("  [KLAR TIL Å FORTSETTE]  ");
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

window.speechSynthesis.onvoiceschanged = function (e) {
  lastInnStemmer();
};

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
