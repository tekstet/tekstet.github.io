//TODO scroll osv. knapper. finn navn fra 5 min +vis navn metode
/*
Hvor mange samtaler kan man ha samtidig


*/
var stemmeHastighetProsent = 85; //Ser ut som 50-200 funker, men folk liker 80-100
var hvorSikkerFoerDetSies = 0.9; //Fra 0.0 til 1.0 - 0.89 blir ofte litt dobbelt opp
var startAutomatisk = true;
var whisperTalegjennkjenning = false;
var googleTalegjennkjenning = false;
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
var bekreftInnstillingerKnapp = document.getElementById(
  "bekreftInnstillingerKnapp"
);
var visValgIgjenKnapp = document.getElementById("visValgIgjenKnapp");
var startOgStoppKnapp = document.getElementById("startOgStoppKnapp");
var testStemmeKnapp = document.getElementById("testStemmeKnapp");
var stemmeTestTekstInput = document.getElementById("stemmeTestTekstInput");
//var volumeInput = document.getElementById("volume");
var stemmeHastighetValg = document.getElementById("rate");
//var pitchInput = document.getElementById("pitch");
var stemmeValg = document.getElementById("voice");
var rangeV = document.getElementById("rangeV");
var hastighetsDiv = document.getElementById("hastighetsDiv");

const synth = window.speechSynthesis;
var nyligSagt = [];
var forrigeOrdTid = 0;
const valgSirkelBredde = 20;

document.body.onload = function () {
  visinnstillinger(false);
  visTekstboks(true);
  sjekkStotteForMetoder();
  setOppWhisperTalegjennkjenning();
  //fjernValgteRadioKnapper();
  bekreftInnstillingerKnapp.addEventListener("click", bekreftMetodeTrykket);
  visValgIgjenKnapp.addEventListener("click", endreinnstillingerTrykket);
  startOgStoppKnapp.addEventListener("click", startOgStoppTrykket);
  whisperValg.addEventListener("click", innstillingerVisualisering);
  googleValg.addEventListener("click", innstillingerVisualisering);
  webkitValg.addEventListener("click", innstillingerVisualisering);
  testStemmeKnapp.addEventListener("click", function (e) {
    if (stemmeTestTekstInput.value.length > 0) {
      nyligSagt = [];
      si(stemmeTestTekstInput.value);
    }
  });

  stemmeHastighetValg.addEventListener("input", function (e) {
    let prosentValgt = Number(
      ((stemmeHastighetValg.value - stemmeHastighetValg.min) * 100) /
        (stemmeHastighetValg.max - stemmeHastighetValg.min)
    );
    let avstandVenstre = Number(
      window
        .getComputedStyle(hastighetsDiv, null)
        .getPropertyValue("padding-left")
        .replace(/px/, "")
    );
    let bredde =
      Number(
        window
          .getComputedStyle(hastighetsDiv, null)
          .getPropertyValue("width")
          .replace(/px/, "")
      ) - valgSirkelBredde;

    let newPosition = bredde * prosentValgt;
    if (prosentValgt > 0) {
      newPosition = newPosition / 100;
    }
    newPosition = newPosition + avstandVenstre + valgSirkelBredde / 2;

    rangeV.innerHTML = `<span>${stemmeHastighetValg.value}%</span>`;
    rangeV.style.left = `${newPosition}px`;
  });
  stemmeHastighetValg.value = stemmeHastighetProsent;
  stemmeHastighetValg.dispatchEvent(new Event("input", { bubbles: true }));
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
    bekreftInnstillingerKnapp.disabled = true;
  } else {
    bekreftInnstillingerKnapp.disabled = false;
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
    console.warn("Ingen metoder støttes");
    leggTilStatusInfoItekstboks(
      "  [INGEN TALE TIL TEKST METODER ER TILGJENGELIGE]  "
    );
  }

  if (!"speechSynthesis" in window) {
    console.warn("Tale syntese støttes ikke i denne nettleseren");
  }
}

function lastInnStemmer() {
  var voices = speechSynthesis.getVoices();

  voices.forEach(function (voice, i) {
    if (voice.lang.includes("nb-NO")) {
      let etStemmeValg = document.createElement("option");
      etStemmeValg.value = voice.name;
      etStemmeValg.innerHTML = voice.name;
      if (voice.lang) {
        etStemmeValg.innerHTML += "   (" + voice.lang + ")";
      }
      stemmeValg.appendChild(etStemmeValg);
    }
  });
  voices.forEach(function (voice, i) {
    if (voice.lang.includes("en-") || true) {
      let etStemmeValg = document.createElement("option");
      etStemmeValg.value = voice.name;
      etStemmeValg.innerHTML = voice.name;
      if (voice.lang) {
        etStemmeValg.innerHTML += "   (" + voice.lang + ")";
      }
      stemmeValg.appendChild(etStemmeValg);
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
    console.warn("Ingen metode valgt");
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
      if (i === event.results.length - 1) {
        if (
          element[0].confidence > hvorSikkerFoerDetSies ||
          element.isFinal === true
        ) {
          si(element[0].transcript);
          console.info(
            "^ med " + Math.round(element[0].confidence * 100) + "% sikkerhet"
          );
        } else {
          console.debug(
            "\t(" +
              Math.round(element[0].confidence * 100) +
              "% sikkerhet for: '" +
              element[0].transcript +
              "')"
          );
        }
        nyTekst += ". ";
      }
    }
    let naa = performance.now();
    let tidSidenSiste = naa - forrigeOrdTid;
    if (tidSidenSiste > 1000) {
      if (forrigeOrdTid !== 0) {
        nyligSagt = [];
      }
      forrigeOrdTid = naa;
    }
    nyTekst = erstattOrd(nyTekst);
    settTekstBoksTekstTil(forrigeTekst + nyTekst);
  };

  talegjennkjenning.onstart = function () {
    talegjennkjenningErPaa = true;
    startOgStoppKnapp.value = "Stopp";
    startOgStoppKnapp.textContent;
    console.info("Tale startet");
    leggTilStatusInfoItekstboks("  [LYTTER NÅ]  ");
    justerTekstBoksHoyde();
    tekstBoks.disabled = false;
    holdSkjermVaaken();
  };

  talegjennkjenning.onend = function () {
    sluttetAaLytte();
    console.info("Tale avsluttet");
  };

  talegjennkjenning.onerror = function (event) {
    sluttetAaLytte();
    console.error("Tale feilmelding");
    console.error(event);
  };

  talegjennkjenning.onspeechend = function () {
    //lytterIkkeLengre();
    //console.log("Tale sluttet");
  };

  talegjennkjenning.onnomatch = function (event) {
    console.warn("ingen match for tale");
  };

  webkitValg.checked = true;
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
  var maksTotalHoyde = Math.max(
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.clientHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight
  );
  let padding = Number(
    window
      .getComputedStyle(tekstBoks, null)
      .getPropertyValue("padding-top")
      .replace(/px/, "")
  );
  padding = padding * 2;
  let innholdHoyde = tekstBoks.scrollHeight + padding;
  if (innholdHoyde < maksTotalHoyde) {
    tekstBoks.style.height = innholdHoyde + "px";
  } else {
    tekstBoks.style.height = "60vh";
  }
  tekstBoks.scroll({
    top: innholdHoyde,
    left: 0,
    behavior: "smooth", //Auto for rask, smooth for treg
  });
}

function sluttetAaLytte() {
  forrigeTekst = tekstUtenStatus();
  leggTilStatusInfoItekstboks("  [SLUTTET Å LYTTE]  ");
  tekstBoks.disabled = true;
  talegjennkjenningErPaa = false;
  startOgStoppKnapp.value = "Start";
  laSkjermSovne();
}

function tekstUtenSagt(tekstSomSjekkes) {
  if (tekstSomSjekkes) {
    let tekstSomSjekkesListe = tekstSomSjekkes.split(" ");
    tekstSomSjekkesListe = tekstSomSjekkesListe.filter((item) => item);
    if (tekstSomSjekkesListe && tekstSomSjekkesListe.length > 0) {
      let funnetPlassering = nyligSagt.lastIndexOf(tekstSomSjekkesListe[0]);
      if (funnetPlassering > -1) {
        for (let i = 1; i < tekstSomSjekkesListe.length; i++) {
          if (nyligSagt[funnetPlassering + i] !== tekstSomSjekkesListe[i]) {
            return tekstSomSjekkesListe.slice(i);
          }
        }
      } else {
        return tekstSomSjekkesListe;
      }
    }
  }
}

function rensTekst(tekst) {
  if (tekst) {
    return tekst.replace(/[^a-z0-9]/gi, "");
  } else {
    return "";
  }
}

function si(tekst) {
  if (tekst.length > 0) {
    let nyeOrdIListe = tekstUtenSagt(tekst);
    if (!nyeOrdIListe || nyeOrdIListe.length < 1) {
      return;
    }
    tekst = nyeOrdIListe.join(" ");

    // Create a new instance of SpeechSynthesisUtterance.
    var msg = new SpeechSynthesisUtterance();

    // Set the text.
    msg.text = tekst;

    // Set the attributes.
    msg.volume = 1.0; //parseFloat(volumeInput.value);
    msg.rate = parseFloat(stemmeHastighetValg.value / 100);
    msg.pitch = 1.2; //parseFloat(pitchInput.value);

    // If a voice has been selected, find the voice and set the
    // utterance instance's voice attribute.
    if (stemmeValg.value) {
      msg.voice = speechSynthesis.getVoices().filter(function (voice) {
        return voice.name == stemmeValg.value;
      })[0];
    }

    // Queue this utterance.
    window.speechSynthesis.speak(msg);
    console.log("'" + tekst + "'");
    nyligSagt = nyligSagt.concat(nyeOrdIListe);
  }
}

window.addEventListener(
  "focus",
  function (event) {
    //TODO vent på godkjenning fra bruker også
    if (fortsettNaarTilbake && talegjennkjenningErPaa === false) {
      console.info("Fortsetter");
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

window.addEventListener(
  "click",
  function (event) {
    document.body.requestFullscreen();
  },
  false
);

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
      console.info("Hindrer skjerm i å sovne");
    } catch (err) {
      console.error(err.name, err.message);
    }
    return skjermLaas;
  }
}

function laSkjermSovne() {
  if (typeof skjermLaas !== "undeinfed" && skjermLaas != null) {
    skjermLaas.release().then(() => {
      console.info("Lar skjerm sovne");
      skjermLaas = null;
    });
  }
}
