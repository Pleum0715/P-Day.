document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  const candleCountDisplay = document.getElementById("candleCount");
  const songTitleElement = document.getElementById("songTitle");
  const lyricsDisplay = document.getElementById("lyricsDisplay");
  
  let candles = [];
  let audioContext;
  let analyser;
  let microphone;
  
  // ประกาศตัวเล่นเพลงตัวเดียวที่นี่
  let audio = new Audio('My Day.mp3');

  // --- ข้อมูลเนื้อเพลง (ยึดตามที่คุณแปะมาล่าสุด) ---
  const lyricsData = [
    { time: 0, text: " (Music Intro)" },
    { time: 11.18, text: "I wait for you to come home" },
    { time: 16.04, text: "Counting down the clock" },
    { time: 18.55, text: "I walk to your stop" },
    { time: 22.40, text: "To you" },
    { time: 24.35, text: "Wanna go on a date?" },
    { time: 27.00, text: "Or just stay inside?" },
    { time: 29.87, text: "Let's do what you like" },
    { time: 32.83, text: "My day will always be shaped" },
    { time: 37.2, text: "Shaded by whether your skies were grey" },
    { time: 43.27, text: "My heart will always belong to you" },
    { time: 50.71, text: "Even if you paint me in blue" },
    { time: 56.76, text: "I move with you" },
    { time: 62.22, text: "Look tired again" },
    { time: 65.14, text: "And it never ends" },
    { time: 68.13, text: "Hope that you know that I'll be" },
    { time: 73.89, text: "Here in your corner" },
    { time: 76.01, text: "Kills me inside when you're not alright" },
    { time: 81.7, text: "HAVE A GOOD DAY :)" }
  ];

  // --- ฟังก์ชันซิงค์เนื้อเพลง ---
  audio.addEventListener("timeupdate", function() {
    const currentTime = audio.currentTime;
    
    // โชว์ชื่อเพลงเมื่อเพลงเริ่มเล่น
    if (currentTime > 0.5) {
        songTitleElement.style.opacity = 1;
    }

    // ค้นหาท่อนเพลงปัจจุบัน
    const currentLine = lyricsData.slice().reverse().find(line => currentTime >= line.time);

    if (currentLine) {
      if (lyricsDisplay.innerText !== currentLine.text) {
          lyricsDisplay.innerText = currentLine.text;
          // เอฟเฟกต์เด้งเล็กน้อยเมื่อเปลี่ยนท่อน
          lyricsDisplay.style.transform = "scale(1.1)";
          setTimeout(() => lyricsDisplay.style.transform = "scale(1)", 150);
      }
    } else {
      lyricsDisplay.innerText = "";
    }
  });

  // --- ส่วนการทำงานของเค้ก ---
  function updateCandleCount() {
    const activeCandles = candles.filter(
      (candle) => !candle.classList.contains("out")
    ).length;
    candleCountDisplay.textContent = activeCandles;
  }

  function addCandle(left, top) {
    const candle = document.createElement("div");
    candle.className = "candle";
    candle.style.left = left + "px";
    candle.style.top = top + "px";

    const flame = document.createElement("div");
    flame.className = "flame";
    candle.appendChild(flame);

    cake.appendChild(candle);
    candles.push(candle);
    updateCandleCount();
  }

  // --- แก้ไขส่วนการคลิกปักเทียน (ให้รองรับมือถือที่ย่อจอ) ---
  cake.addEventListener("click", function (event) {
    const rect = cake.getBoundingClientRect();
    
    // คำนวณ Scale Factor (หาอัตราส่วนการย่อขยาย)
    const scaleX = rect.width / cake.offsetWidth;
    const scaleY = rect.height / cake.offsetHeight;

    // คำนวณตำแหน่งที่ถูกต้องโดยการหารด้วย scale
    const left = (event.clientX - rect.left) / scaleX;
    const top = (event.clientY - rect.top) / scaleY;

    addCandle(left, top);
  });
  // -----------------------------------------------------

  function isBlowing() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    let average = sum / bufferLength;

    return average > 50; 
  }

  function blowOutCandles() {
    let blownOut = 0;

    if (candles.length > 0 && candles.some((candle) => !candle.classList.contains("out"))) {
      if (isBlowing()) {
        candles.forEach((candle) => {
          if (!candle.classList.contains("out") && Math.random() > 0.5) {
            candle.classList.add("out");
            blownOut++;
          }
        });
      }

      if (blownOut > 0) {
        updateCandleCount();
      }

      if (candles.every((candle) => candle.classList.contains("out"))) {
        setTimeout(function() {
          triggerConfetti();
          endlessConfetti(); 
        }, 200);
        audio.play(); 
      }
    }
  }

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        setInterval(blowOutCandles, 200);
      })
      .catch(function (err) {
        console.log("Unable to access microphone: " + err);
      });
  } else {
    console.log("getUserMedia not supported on your browser!");
  }
});

function triggerConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
}

function endlessConfetti() {
  setInterval(function() {
    confetti({
      particleCount: 200,
      spread:90,
      origin:{y:0}
    });
  }, 1000 );
}
