/*
Hvor mange samtaler kan man ha samtidig
*/
var stemmeHastighetProsent = 85; //Ser ut som 50-200 funker, men folk liker 80-100
var hvorSikkerFoerDetVises = 0.5; //Fra 0.0 til 1.0
var hvorSikkerFoerDetSies = 0.9; //Fra 0.0 til 1.0
var startAutomatisk = true;
var googleTalegjennkjenning = false;
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var whisperTalegjennkjenning = false;
var talegjennkjenning;
var talegjennkjenningStatus = 0; //0-> er av, 1->skal endres, 2->er på
var fortsettNaarTilbake = false;
var skjermLaas;
var forrigeInnhold = "";

var tekstBoks = document.getElementById("tekst-innhold");
var innstillinger = document.getElementById("innstillinger");
var whisperValg = document.getElementById("whisper");
var whisperBeholder = document.getElementById("whisper-beholder");
var googleValg = document.getElementById("google");
var googleBeholder = document.getElementById("google-beholder");
var webkitValg = document.getElementById("webkit");
var webkitBeholder = document.getElementById("webkit-beholder");
var velgStemmeDel = document.getElementById("velg-stemme-del");
var stemmeIkkeTilgjengelig = document.getElementById(
  "stemme-ikke-tilgjengelig"
);

var bekreftInnstillingerKnapp = document.getElementById(
  "bekreft-innstillinger-knapp"
);
var visInnstillingerKnapp = document.getElementById("innstillinger-knapp");
var knapper = document.getElementById("knapper");
var paaKnapp = document.getElementById("skru-paa");
var avKnapp = document.getElementById("skru-av");
var testStemmeKnapp = document.getElementById("test-stemme-knapp");
var stemmeTestTekstInput = document.getElementById("stemme-test-tekst-input");
var stemmeHastighetValg = document.getElementById("rate");
//var pitchInput = document.getElementById("pitch");
var stemmeValg = document.getElementById("voice");
var rangeV = document.getElementById("rangeV");
var hastighetsDiv = document.getElementById("hastighets-div");

const synth = window.speechSynthesis;
var nyligSagt = [];
const valgSirkelBredde = 20;

document.body.onload = function () {
  visinnstillinger(true);
  visTekstboks(false);
  sjekkStotteForMetoder();
  fjernValgteRadioKnapper();
  bekreftInnstillingerKnapp.addEventListener("click", bekreftMetodeTrykket);
  visInnstillingerKnapp.addEventListener("click", endreinnstillingerTrykket);
  avKnapp.addEventListener("click", avTrykket);
  paaKnapp.addEventListener("click", paaTrykket);
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
    //TODO leggTilStatusInfoItekstboks(   "  [INGEN TALE TIL TEKST METODER ER TILGJENGELIGE]  ");
  }

  if (!"speechSynthesis" in window) {
    console.warn("Tale syntese støttes ikke i denne nettleseren");
  }
}

function lastInnStemmer() {
  var voices = speechSynthesis.getVoices();
  if (!voices || voices.length <= 0) {
    velgStemmeDel.style.display = "none";
    stemmeIkkeTilgjengelig.style.display = "block";
  } else {
    stemmeIkkeTilgjengelig.style.display = "none";
    velgStemmeDel.style.display = "block";
    let etStemmeValg = document.createElement("option");
    etStemmeValg.value = "Ingen";
    etStemmeValg.innerHTML = "Ingen";
    stemmeValg.appendChild(etStemmeValg);

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
}

function fjernValgteRadioKnapper() {
  whisperValg.checked = false;
  googleValg.checked = false;
  webkitValg.checked = false;
}

function visinnstillinger(paaEllerAv) {
  if (paaEllerAv) {
    innstillinger.style.display = "block";
    innstillinger.disabled = false;
    innstillinger.disabled = false;
    knapper.style.display = "none";
    innstillingerVisualisering();
  } else {
    innstillinger.style.display = "none";
    innstillinger.disabled = true;
    knapper.style.display = "flex";
  }
}
function visTekstboks(avEllerPaa) {
  if (avEllerPaa) {
    tekstBoks.style.display = "block";
    knapper;
  } else {
    tekstBoks.style.display = "none";
  }
}

function endreinnstillingerTrykket() {
  if (innstillinger.style.display === "none") {
    if (talegjennkjenning) {
      if (talegjennkjenningStatus !== 0) {
        talegjennkjenningStatus = 1;
        talegjennkjenning.stop();
      }
    }
    visinnstillinger(true);
    visTekstboks(false);
  } else {
    visinnstillinger(false);
    visTekstboks(true);
  }
}

function paaTrykket() {
  if (talegjennkjenning) {
    if (talegjennkjenningStatus === 0) {
      talegjennkjenningStatus = 1;
      fortsettNaarTilbake = true;
      talegjennkjenning.start();
    }
  } else {
    sjekkStotteForMetoder();
    visinnstillinger(true);
  }
}

function avTrykket() {
  if (talegjennkjenning) {
    if (talegjennkjenningStatus !== 0) {
      talegjennkjenningStatus = 1;
      fortsettNaarTilbake = false;
      talegjennkjenning.stop();
    }
  }
}

function bekreftMetodeTrykket() {
  let noeErValgt = false;
  //TODO ikke sett opp på nytt konstant? kan være fint for å fikse feil
  if (whisperValg.checked) {
    settOppWhisperTalegjennkjenning();
    noeErValgt = true;
  } else if (googleValg.checked) {
    settOppGoogleTalegjennkjenning();
    noeErValgt = true;
  } else if (webkitValg.checked) {
    settOppWebkitTalegjennkjenning();
    noeErValgt = true;
  } else {
    console.warn("Ingen metode valgt");
  }

  if (noeErValgt) {
    visinnstillinger(false);
    visTekstboks(true);
    if (startAutomatisk) {
      paaTrykket();
    }
  }
}

function settOppWhisperTalegjennkjenning() {
  settOppWebkitTalegjennkjenning(); //TODO implementer
}

function settOppGoogleTalegjennkjenning() {
  settOppWebkitTalegjennkjenning(); //TODO implementer
}

function settOppWebkitTalegjennkjenning() {
  talegjennkjenning = new SpeechRecognition();
  talegjennkjenning.continuous = true;
  talegjennkjenning.lang = "nb-NO";
  talegjennkjenning.interimResults = true;
  talegjennkjenning.maxAlternatives = 1;

  talegjennkjenning.onresult = function (event) {
    /*while (tekstBoks.firstChild) {
      tekstBoks.removeChild(tekstBoks.lastChild);
    }*/
    var nyttInnhold = document.createElement("div");

    for (let i = 0; i < event.results.length; i++) {
      if (
        event.results[i].isFinal ||
        event.results[i][0].confidence > hvorSikkerFoerDetVises
      ) {
        var p = document.createElement("p");
        p.innerHTML = event.results[i][0].transcript + ".";
        p.style.color = fargeFraSikkerhet(event.results[i][0].confidence);
        console.debug(
          event.results[i][0].transcript +
            " (" +
            event.results[i][0].confidence +
            ")"
        );
        if (event.results[i].isFinal) {
          p.classList += "endelig";
        } else {
          p.classList += "ganske-sikker";
        }
        nyttInnhold.appendChild(p);
        if (
          event.results[i].isFinal ||
          event.results[i][0].confidence > hvorSikkerFoerDetSies
        ) {
          si(event.results[i][0].transcript);
        }
      }
    }
    tekstBoks.innerHTML = forrigeInnhold + nyttInnhold.innerHTML;
    scrollTilNederst();
  };

  talegjennkjenning.onstart = function () {
    talegjennkjenningStatus = 2;
    console.info("Tale startet");
    //TODO leggTilStatusInfoItekstboks("  [LYTTER NÅ]  ");
    scrollTilNederst();
    tekstBoks.classList.remove("av");
    tekstBoks.classList.add("paa");
    holdSkjermVaaken();
  };

  talegjennkjenning.onend = function () {
    sluttetAaLytte();
    console.info("Tale avsluttet");
  };

  talegjennkjenning.onerror = function (event) {
    if (event.error === "not-allowed") {
      talegjennkjenningStatus = 1;
    } else {
      console.error("Tale feilmelding");
    }
    sluttetAaLytte();
  };

  talegjennkjenning.onspeechend = function () {
    console.debug("Tale sluttet");
  };

  talegjennkjenning.onnomatch = function (event) {
    console.warn("ingen match for tale");
  };

  webkitValg.checked = true;
}

const ordErstanninger = {
  /*
  " komma": ",",
  " punktum": ".",
  " utropstegn": "!",
  " spørsmålstegn": "?",
  */
};

function erstattOrd(tekst) {
  for (const [key, value] of Object.entries(ordErstanninger)) {
    tekst = tekst.replaceAll(key, value);
  }

  return tekst;
}

function scrollTilNederst() {
  tekstBoks.scroll({
    top: tekstBoks.scrollHeight,
    left: 0,
    behavior: "smooth", //Auto for rask, smooth for treg
  });
}

function sluttetAaLytte() {
  forrigeInnhold = tekstBoks.innerHTML;
  //TODO leggTilStatusInfoItekstboks("  [SLUTTET Å LYTTE]  ");
  tekstBoks.classList.add("av");
  tekstBoks.classList.remove("paa");
  if (talegjennkjenningStatus == 2) {
    talegjennkjenningStatus = 1;
    talegjennkjenning.start();
  } else {
    talegjennkjenningStatus = 0;
    laSkjermSovne();
  }
}

function tekstUtenSagt(tekstSomSjekkes) {
  if (tekstSomSjekkes) {
    let tekstSomSjekkesListe = tekstSomSjekkes.toLowerCase().split(" ");
    tekstSomSjekkesListe = tekstSomSjekkesListe.filter((item) => item);
    if (tekstSomSjekkesListe && tekstSomSjekkesListe.length > 0) {
      let funnetPlassering = nyligSagt.lastIndexOf(tekstSomSjekkesListe[0]);
      if (funnetPlassering > -1) {
        if (
          tekstSomSjekkesListe.length === 1 &&
          funnetPlassering !== nyligSagt.length - 1
        ) {
          return tekstSomSjekkesListe;
        } else {
          for (let i = 1; i < tekstSomSjekkesListe.length; i++) {
            if (nyligSagt[funnetPlassering + i] !== tekstSomSjekkesListe[i]) {
              return tekstSomSjekkesListe.slice(i);
            }
          }
        }
      } else {
        return tekstSomSjekkesListe;
      }
    }
  }
  return [];
}

function si(tekst) {
  if (stemmeValg.value !== "Ingen" && tekst.length > 0) {
    let nyeOrdIListe = tekstUtenSagt(tekst);
    if (!nyeOrdIListe || nyeOrdIListe.length < 1) {
      return;
    }
    tekst = nyeOrdIListe.join(" ");

    var msg = new SpeechSynthesisUtterance();

    msg.text = tekst;

    msg.volume = 1.0; //parseFloat(volumeInput.value);
    msg.rate = parseFloat(stemmeHastighetValg.value / 100);
    msg.pitch = 1.2; //parseFloat(pitchInput.value);

    if (stemmeValg.value) {
      msg.voice = speechSynthesis.getVoices().filter(function (voice) {
        return voice.name == stemmeValg.value;
      })[0];
    }

    window.speechSynthesis.speak(msg);
    console.debug("sier: '" + tekst + "'");
    nyligSagt = nyligSagt.concat(nyeOrdIListe);
  }
}

window.addEventListener(
  "focus",
  function (event) {
    if (
      fortsettNaarTilbake &&
      talegjennkjenningStatus === 0 &&
      tekstBoks.style.display !== "none"
    ) {
      console.info("Fortsetter");
      //TODO leggTilStatusInfoItekstboks("  [KLAR TIL Å FORTSETTE]  ");
      talegjennkjenningStatus = 1;
      talegjennkjenning.start();
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
    //document.body.requestFullscreen();
  },
  false
);

document.addEventListener("keydown", tastetrykk, false);

function tastetrykk(e) {
  if (e.key === "Escape") {
    avTrykket();
  } else if (e.key === "Enter") {
    paaTrykket();
  }
}

window.addEventListener(
  "resize",
  function (event) {
    scrollTilNederst();
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
      console.debug("Hindrer skjerm i å sovne");
    } catch (err) {
      console.error(err.name, err.message);
    }
    return skjermLaas;
  }
}

function laSkjermSovne() {
  if (typeof skjermLaas !== "undeinfed" && skjermLaas != null) {
    skjermLaas.release().then(() => {
      console.debug("Lar skjerm sovne");
      skjermLaas = null;
    });
  }
}

function skalerTall(tall, min1, max1, min2, max2) {
  let nyttTall = min2 + ((max2 - min2) * (tall - min1)) / (max1 - min1);
  if (nyttTall > max2) {
    return max2;
  } else if (nyttTall < min2) {
    return min2;
  } else {
    return nyttTall;
  }
}

function fargeFraSikkerhet(sikkerhet) {
  return (
    "rgb(" +
    (255 - Math.round(skalerTall(sikkerhet, 0.1, 0.94, 0, 255))) +
    ",0,0)"
  );
}
