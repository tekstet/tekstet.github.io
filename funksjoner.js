//Innstillinger
var stemmeHastighetProsent = 85; //Ser ut som 50-200 funker, men folk liker 80-100
var sikkerhetForAaVise = 0.5; //Fra 0.0 til 1.0
var sikkerhetForAaSi = 0.9; //Fra 0.0 til 1.0
var startUtenAtBrukerTrykker = true;
var startTaleMedEnGang = false;
const valgSirkelBredde = 20;

//Globale variabler
var fortsettNaarTilbake = false;
var talegjennkjenning;
var googleTalegjennkjenning = false;
var webSpeechTalegjennkjenning;
var whisperTalegjennkjenning = false;
var talegjennkjenningStatus = 0; //0-> er av, 1->skal endres, 2->er på
var skjermLaas;
var forrigeInnhold = "";
var nyligSagt = [];
const synth = window.speechSynthesis;

//HTML elementer
var tekstBoks = document.getElementById("tekst-innhold");
var innstillinger = document.getElementById("innstillinger");
var whisperValg = document.getElementById("whisper");
var whisperBeholder = document.getElementById("whisper-beholder");
var googleValg = document.getElementById("google");
var googleBeholder = document.getElementById("google-beholder");
var webkitValg = document.getElementById("webkit");
var webkitBeholder = document.getElementById("webkit-beholder");
var visInnstillingerKnapp = document.getElementById("innstillinger-knapp");
var fullskjermKnapp = document.getElementById("fullskjerm-knapp");
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
var bekreftInnstillingerKnapp = document.getElementById(
  "bekreft-innstillinger-knapp"
);

function oppsett() {
  visinnstillinger(true);
  visTekstboks(false);
  seHvilkeMetoderSomKanBrukes();
  fjernValgteMetoder();
  bekreftInnstillingerKnapp.addEventListener("click", bekreftMetodeTrykket);
  visInnstillingerKnapp.addEventListener("click", endreInnstillingerTrykket);
  fullskjermKnapp.addEventListener("click", endreFullskjermTilstand);
  avKnapp.addEventListener("click", avTrykket);
  paaKnapp.addEventListener("click", paaTrykket);
  whisperValg.addEventListener("click", oppdaterInnstillingsKontroll);
  googleValg.addEventListener("click", oppdaterInnstillingsKontroll);
  webkitValg.addEventListener("click", oppdaterInnstillingsKontroll);
  testStemmeKnapp.addEventListener("click", testStemmeTykket);
  stemmeHastighetValg.addEventListener("input", hastighetsValgEndret);
  stemmeHastighetValg.value = stemmeHastighetProsent;
  stemmeHastighetValg.dispatchEvent(new Event("input", { bubbles: true }));
  setTimeout(lastInnStemmer, 1300);
}

document.body.onload = oppsett;

function oppdaterInnstillingsKontroll() {
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

function seHvilkeMetoderSomKanBrukes() {
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
  //Webkit / Web Speech
  try {
    webSpeechTalegjennkjenning = webkitSpeechRecognition;
  } catch (ReferenceError) {}
  if (webSpeechTalegjennkjenning) {
    webkitBeholder.classList.remove("unavailable");
    webkitValg.disabled = false;
  } else {
    webkitBeholder.classList.add("unavailable");
    webkitValg.disabled = true;
    webkitValg.checked = false;
  }

  if (
    !whisperTalegjennkjenning &&
    !webSpeechTalegjennkjenning &&
    !googleTalegjennkjenning
  ) {
    console.warn("Ingen metoder støttes");
    console.debug("  [INGEN TALE TIL TEKST METODER ER TILGJENGELIGE]  ");
  }

  if (!"speechSynthesis" in window) {
    console.warn("Tale syntese støttes ikke i denne nettleseren");
  }

  if (!document.fullscreenEnabled) {
    fullskjermKnapp.style.display = "none";
  }
}

function lastInnStemmer() {
  var velgStemmeDel = document.getElementById("velg-stemme-del");
  var stemmeIkkeTilgjengelig = document.getElementById(
    "stemme-ikke-tilgjengelig"
  );
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

function fjernValgteMetoder() {
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
    oppdaterInnstillingsKontroll();
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

function endreInnstillingerTrykket() {
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
    seHvilkeMetoderSomKanBrukes();
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
    console.warn("Ingen metode ble valgt");
  }

  if (noeErValgt) {
    visinnstillinger(false);
    visTekstboks(true);
    if (startUtenAtBrukerTrykker) {
      paaTrykket();
    }
  }
}

function testStemmeTykket() {
  if (stemmeTestTekstInput.value.length > 0) {
    nyligSagt = [];
    si(stemmeTestTekstInput.value);
  }
}

function hastighetsValgEndret() {
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
}

function settOppWhisperTalegjennkjenning() {
  settOppWebkitTalegjennkjenning(); //TODO implementer
}

function settOppGoogleTalegjennkjenning() {
  settOppWebkitTalegjennkjenning(); //TODO implementer
}

function settOppWebkitTalegjennkjenning() {
  talegjennkjenning = new webSpeechTalegjennkjenning();
  talegjennkjenning.continuous = true;
  talegjennkjenning.lang = "nb-NO";
  talegjennkjenning.interimResults = true;
  talegjennkjenning.maxAlternatives = 1;

  talegjennkjenning.onresult = function (event) {
    var nyttInnhold = document.createElement("div");
    for (let i = 0; i < event.results.length; i++) {
      if (
        event.results[i].isFinal ||
        event.results[i][0].confidence > sikkerhetForAaVise
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
          event.results[i][0].confidence > sikkerhetForAaSi
        ) {
          si(event.results[i][0].transcript);
        }
      }
    }
    tekstBoks.innerHTML = forrigeInnhold + nyttInnhold.innerHTML;
    blaTilNederstITekst();
  };

  talegjennkjenning.onstart = function () {
    talegjennkjenningStatus = 2;
    console.info("Tale startet");
    console.debug("  [LYTTER NÅ]  ");
    blaTilNederstITekst();
    tekstBoks.classList.remove("av");
    tekstBoks.classList.add("paa");
    holdSkjermVaaken();
  };

  talegjennkjenning.onend = function () {
    sluttetAaLytte();
    console.info("Tale avsluttet");
    if (startTaleMedEnGang && talegjennkjenningStatus === 0) {
      talegjennkjenningStatus = 1;
      talegjennkjenning.start();
      startTaleMedEnGang = false;
    }
  };

  talegjennkjenning.onerror = function (event) {
    if (event.error === "not-allowed") {
      talegjennkjenningStatus = 1;
      sluttetAaLytte();
    } else if (event.error === "no-speech") {
      if (talegjennkjenningStatus === 2) {
        talegjennkjenningStatus = 1;
        talegjennkjenning.start();
      } else {
        startTaleMedEnGang = true;
      }
    } else {
      console.error(event.error);
      sluttetAaLytte();
    }
  };

  talegjennkjenning.onspeechend = function () {
    console.debug("Tale sluttet");
    if (startTaleMedEnGang && talegjennkjenningStatus === 0) {
      talegjennkjenningStatus = 1;
      talegjennkjenning.start();
      startTaleMedEnGang = false;
    }
  };

  talegjennkjenning.onnomatch = function (event) {
    console.warn("ingen match for tale");
  };

  webkitValg.checked = true;
}

const ordErstattninger = {
  /*
  " komma": ",",
  " punktum": ".",
  " utropstegn": "!",
  " spørsmålstegn": "?",
  */
};

function erstattOrd(tekst) {
  for (const [key, value] of Object.entries(ordErstattninger)) {
    tekst = tekst.replaceAll(key, value);
  }
  return tekst;
}

function blaTilNederstITekst() {
  tekstBoks.scroll({
    top: tekstBoks.scrollHeight,
    left: 0,
    behavior: "smooth", //Auto for rask, smooth for treg
  });
}

function sluttetAaLytte() {
  forrigeInnhold = tekstBoks.innerHTML;
  console.debug("  [SLUTTET Å LYTTE]  ");
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

function tekstUtenTidligereSagt(tekstSomSjekkes) {
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
    let nyeOrdIListe = tekstUtenTidligereSagt(tekst);
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
      console.debug("  [KLAR TIL Å FORTSETTE]  ");
      talegjennkjenningStatus = 1;
      talegjennkjenning.start();
    }
  },
  false
);

window.speechSynthesis.onvoiceschanged = function (e) {
  lastInnStemmer();
};

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
    blaTilNederstITekst();
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

function endreFullskjermTilstand(element) {
  if (
    !document.fullscreenElement &&
    !document.mozFullScreenElement &&
    !document.webkitFullscreenElement
  ) {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(
        Element.ALLOW_KEYBOARD_INPUT
      );
    }
  } else {
    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    }
  }
}
