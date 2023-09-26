//Innstillinger
var stemmeHastighetProsent = 85; //Ser ut som 50-200 funker, men folk liker 80-100
var sikkerhetForAaVise = 0.5; //Fra 0.0 til 1.0
var sikkerhetForAaSi = 0.9; //Fra 0.0 til 1.0
var startUtenAtBrukerTrykker = true;
var stoppIBakgrunnen = false;
const valgSirkelBredde = 20;

//Globale variabler
var talegjennkjenning;
var talegjennkjenningStatus = false;
var onsketTalegjennkjenningStatus = false;
var forrigeStartTid = -1;
var googleTalegjennkjenning = false;
var webSpeechTalegjennkjenning;
var whisperTalegjennkjenning = false;
var skjermLaas;
var forsoekUtenTekst = 0;
var forrigeInnhold = "";
var nyligSagt = [];
const synth = window.speechSynthesis;
var forrigeScrollPosisjon = 0;
var forrigeScrollRetning = false;
var ignorerScroll = false;

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
    visStatus("Ingen metoder støttes i denne nettleseren. Prøv Chrome f.eks.");
  }

  if (!"speechSynthesis" in window) {
    visStatus("Ingen metoder støttes i denne nettleseren. Prøv Chrome f.eks.");
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
    if (talegjennkjenningStatus) {
      stoppTalegjennkjenning();
    }
    visinnstillinger(true);
    visTekstboks(false);
  } else {
    visinnstillinger(false);
    visTekstboks(true);
  }
}

function paaTrykket() {
  startTalegjennkjenning();
}

function avTrykket() {
  stoppTalegjennkjenning();
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

function oppsettForNyTalegjennkjenning() {
  if (talegjennkjenning !== null && talegjennkjenning !== undefined) {
    stoppTalegjennkjenning();
  }
}

function settOppWhisperTalegjennkjenning() {
  oppsettForNyTalegjennkjenning();
  settOppWebkitTalegjennkjenning(); //TODO implementer
}

function settOppGoogleTalegjennkjenning() {
  oppsettForNyTalegjennkjenning();
  settOppWebkitTalegjennkjenning(); //TODO implementer
}

function settOppWebkitTalegjennkjenning() {
  oppsettForNyTalegjennkjenning();
  talegjennkjenning = new webSpeechTalegjennkjenning();
  talegjennkjenning.continuous = true;
  talegjennkjenning.lang = "nb-NO";
  talegjennkjenning.interimResults = true;
  talegjennkjenning.maxAlternatives = 1;

  talegjennkjenning.onresult = function (hendelse) {
    var nyttInnhold = document.createElement("div");
    for (let i = 0; i < hendelse.results.length; i++) {
      if (
        hendelse.results[i].isFinal ||
        hendelse.results[i][0].confidence > sikkerhetForAaVise
      ) {
        var p = document.createElement("p");
        p.innerHTML = hendelse.results[i][0].transcript + ".";
        p.style.color = fargeFraSikkerhet(hendelse.results[i][0].confidence);
        /*console.debug(
          hendelse.results[i][0].transcript +
            " (" +
            hendelse.results[i][0].confidence +
            ")"
        );*/
        if (hendelse.results[i].isFinal) {
          p.classList += "endelig";
        } else {
          p.classList += "ganske-sikker";
        }
        nyttInnhold.appendChild(p);
        if (
          hendelse.results[i].isFinal ||
          hendelse.results[i][0].confidence > sikkerhetForAaSi
        ) {
          si(hendelse.results[i][0].transcript);
        }
      }
    }
    ignorerScroll = true;
    tekstBoks.innerHTML = forrigeInnhold + nyttInnhold.innerHTML;
    setTimeout(function () {
      ignorerScroll = false;
    }, 10);
    blaTilNederstITekst();
    if (forsoekUtenTekst > 0) {
      forsoekUtenTekst = 0;
    }
  };

  talegjennkjenning.onstart = function () {
    talegjennkjenningStatus = true;
    forrigeStartTid = -1;
    console.info("Tale startet");
    blaTilNederstITekst();
    tekstBoks.classList.remove("av");
    tekstBoks.classList.add("paa");
    fjernStatus();
    holdSkjermVaaken();
  };

  talegjennkjenning.onend = function () {
    taleHarSluttet();
  };

  talegjennkjenning.onerror = function (hendelse) {
    if (["no-speech", "network"].includes(hendelse.error)) {
      stoppOgStartTalegjennkjenning();
    } else if (hendelse.error === "not-allowed") {
      stoppTalegjennkjenning();
    } else {
      console.error(hendelse.error);
      stoppOgStartTalegjennkjenning();
    }
  };

  talegjennkjenning.onspeechend = function () {
    console.debug("Tale sluttet");
  };

  talegjennkjenning.onnomatch = function (hendelse) {
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

function blaTilNederstITekst(uansett) {
  //Hvis bruker ser paa teksten lengre opp, ikke scroll til bunnen
  if (
    uansett ||
    (forrigeScrollRetning === false &&
      tekstBoks.scrollHeight - tekstBoks.clientHeight - tekstBoks.scrollTop <
        tekstBoks.offsetHeight * 1.25)
  ) {
    tekstBoks.scroll({
      top: tekstBoks.scrollHeight,
      left: 0,
      behavior: "smooth", //Auto for rask, smooth for treg
    });
  }
}

function startTalegjennkjenning() {
  onsketTalegjennkjenningStatus = true;
  if (talegjennkjenningStatus) {
    console.debug("Starter ikke på nytt siden alt ser ut til å være i orden");
    //stoppOgStartTalegjennkjenning();
  } else {
    if (forsoekUtenTekst < 10) {
      forsoekUtenTekst += 1;
      if (talegjennkjenning !== null && talegjennkjenning !== undefined) {
        if (forrigeStartTid === -1) {
          //Forste gang vi starter
          forrigeStartTid = performance.now();
          talegjennkjenning.start();
        } else if (performance.now() - forrigeStartTid > 8000) {
          //Kan henge seg opp på mobil her
          stoppTalegjennkjenning();
          talegjennkjenning = null;
          talegjennkjenningStatus = false;
          onsketTalegjennkjenningStatus = false;
          forrigeStartTid = -1;
          setTimeout(bekreftMetodeTrykket, 100);
        } else {
          console.debug(
            "Starter ikke på nytt siden vi nylig prøvde og fortsatt venter"
          );
        }
      } else {
        console.warn("Talgjennkjenningsoppsett forsvant");
        visTekstboks(false);
        seHvilkeMetoderSomKanBrukes();
        visinnstillinger(true);
        //TODO vurder å heller rette opp automatisk?
      }
    } else {
      console.warn(
        "For mange forsøk på kort tid. Forsikkre deg om at du ikke har flere kopier gående på denne maskinen."
      );
      visStatus(
        "Kunne ikke starte. Er det flere kopier av Auto-tolk som kjører nå?",
        "viktig"
      );
      onsketTalegjennkjenningStatus = false;
      forsoekUtenTekst = 0;
    }
  }
}

function stoppTalegjennkjenning() {
  onsketTalegjennkjenningStatus = false;
  if (talegjennkjenning !== null && talegjennkjenning !== undefined) {
    try {
      talegjennkjenning.stop();
    } catch (feilmelding) {
      console.log(feilmelding);
      console.log(feilmelding.msg);
      taleHarSluttet();
    }
  } else {
    console.warn("Talgjennkjenningsoppsett forsvant");
    visTekstboks(false);
    seHvilkeMetoderSomKanBrukes();
    visinnstillinger(true);
    //TODO rett opp automatisk?
  }
}

function stoppOgStartTalegjennkjenning() {
  stoppTalegjennkjenning();
  try {
    startTalegjennkjenning();
    return;
  } catch (DOMException) {
    if (DOMException.message.includes("already started")) {
      console.debug("allerede startet");
      stoppTalegjennkjenning();
      setTimeout(stoppOgStartTalegjennkjenning, 150);
    } else {
      console.error(DOMException);
    }
  }
}

function taleHarSluttet() {
  console.info("Tale avsluttet");
  talegjennkjenningStatus = false;
  forrigeStartTid = -1;
  if (onsketTalegjennkjenningStatus) {
    stoppOgStartTalegjennkjenning();
    setTimeout(function () {
      if (!talegjennkjenningStatus) {
        visSluttetAaLytte();
      }
    }, 150);
  } else {
    visSluttetAaLytte();
  }
}

function visSluttetAaLytte(ikkeVent) {
  forrigeInnhold = tekstBoks.innerHTML.replace(
    /<p class="status.*<\/p>/gim,
    ""
  );

  console.debug("[SLUTTET Å LYTTE]");
  tekstBoks.classList.add("av");
  tekstBoks.classList.remove("paa");
  laSkjermSovne();
}

function fjernStatus() {
  const statusElementer = tekstBoks.getElementsByClassName("status");
  while (statusElementer.length > 0) {
    statusElementer[0].parentNode.removeChild(statusElementer[0]);
  }
}

function visStatus(beskjed, type) {
  fjernStatus();
  var statusP = document.createElement("p");
  statusP.innerHTML = beskjed;
  statusP.classList += "status " + type;
  tekstBoks.appendChild(statusP);
  blaTilNederstITekst(true);
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
  "blur",
  function (hendelse) {
    if (
      stoppIBakgrunnen &&
      talegjennkjenningStatus &&
      tekstBoks.style.display !== "none"
    ) {
      console.info("stopper til vi er tilbake");
      stoppTalegjennkjenning();
    }
  },
  false
);

window.addEventListener(
  "focus",
  function (hendelse) {
    if (
      stoppIBakgrunnen &&
      !talegjennkjenningStatus &&
      tekstBoks.style.display !== "none"
    ) {
      console.info("Fortsetter");
      startTalegjennkjenning();
    }
  },
  false
);

window.speechSynthesis.onvoiceschanged = function (hendelse) {
  lastInnStemmer();
};

document.addEventListener("keydown", tastetrykk, false);

function tastetrykk(trykkHendelse) {
  if (trykkHendelse.keyCode === 27) {
    //Esc-tast ble trykket
    avTrykket();
  } else if (trykkHendelse.keyCode === 13) {
    //Enter-tast ble trykket
    paaTrykket();
  } else if (trykkHendelse.keyCode === 32) {
    if (document.activeElement.nodeName !== "BUTTON") {
      //Mellomrom-tast ble trykket uten at det er for å aktivere en knapp
      if (talegjennkjenningStatus && onsketTalegjennkjenningStatus) {
        avTrykket();
      } else if (!talegjennkjenningStatus && !onsketTalegjennkjenningStatus) {
        paaTrykket();
      }
    }
  }
}

window.addEventListener(
  "resize",
  function (hendelse) {
    forrigeScrollRetning = false;
    blaTilNederstITekst();
  },
  true
);

tekstBoks.addEventListener(
  "scroll",
  function () {
    if (!ignorerScroll) {
      forrigeScrollRetning = tekstBoks.scrollTop < forrigeScrollPosisjon;
      forrigeScrollPosisjon =
        tekstBoks.scrollTop <= 0 ? 0 : tekstBoks.scrollTop;
    }
  },
  false
);

function isScreenLockSupported() {
  return "wakeLock" in navigator;
}

async function holdSkjermVaaken() {
  if (isScreenLockSupported()) {
    try {
      skjermLaas = await navigator.wakeLock.request("screen");
      console.debug("Hindrer skjerm i å sovne");
    } catch (feilemelding) {
      console.error(feilemelding.name, feilemelding.message);
    }
    return skjermLaas;
  }
}

function laSkjermSovne() {
  if (typeof skjermLaas !== "undefined" && skjermLaas != null) {
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
