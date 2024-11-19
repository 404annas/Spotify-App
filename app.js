console.log("Let's write some JavaScript!");

const back = document.getElementById("back");
const play = document.getElementById("play");
const next = document.getElementById("forward");

let currentSong = new Audio();
let songs;
let currFolder;

const secondsToMinutes = (sec) => {
  if (isNaN(sec) || sec < 0) {
    return "00:00";
  }
  const minutes = Math.floor(sec / 60);
  const remainingSeconds = Math.floor(sec % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
};

async function getSongs(folder) {
  currFolder = folder;
  // Get all songs from the server
  let data = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await data.text();
  // console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  // console.log(as);

  songs = [];
  // Loop through all the links and get all the mp3 files
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  // console.log(songs);
  // Show all songs in the songsList

  const songUl = document
    .querySelector(".songsList")
    .getElementsByTagName("ul")[0];
  songUl.innerHTML = "";
  for (const song of songs) {
    songUl.innerHTML += `<li><img class="invert" src="./images/music.svg" alt="Music Icon">
    <div class="info">
    <div>${song.replaceAll("%20", " ")}</div>
    <div>Song Artist</div>
    </div>
    <div class="playNow">
    <img class="invert" src="./images/play.svg" alt="Play Icon">
    </div></li>`;
  }

  // Attach event listeners to the each song
  Array.from(
    document.querySelector(".songsList").getElementsByTagName("li")
  ).forEach((li) => {
    li.addEventListener("click", () => {
      console.log(li.querySelector(".info").firstElementChild.innerHTML);

      playMusic(li.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}

const playMusic = (song, pause = false) => {
  // var audio = new Audio("./songs/" + song);
  currentSong.src = `/${currFolder}/` + song;
  if (!pause) {
    currentSong.play();
    play.src = "./images/pause.svg";
  }

  document.querySelector(".songInfo").innerHTML = decodeURI(song);
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
};

async function displayAlbumbs() {
  let b = await fetch("http://127.0.01:5500/songs/");
  let response = await b.text();
  let creatingDiv = document.createElement("div");
  creatingDiv.innerHTML = response;
  // console.log(creatingDiv);
  let anchors = creatingDiv.getElementsByTagName("a");
  // console.log(anchors)
  let cardCoontainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs/")) {
      let folder = e.href.split("/").slice(-1)[0];
      console.log(folder);

      // Get the metaDeta of the folder
      let c = await fetch(`http://127.0.01:5500/songs/${folder}/info.json`);
      let response = await c.json();
      console.log(response);
      cardCoontainer.innerHTML =
        cardCoontainer.innerHTML +
        `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" data-encore-id="icon"
                                role="img" aria-hidden="true" viewBox="0 0 24 24" class="Svg-sc-ytk21e-0 bneLcE">
                                <path
                                    d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z">
                                </path>
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="Song Image">
                        <h3>${response.title}</h3>
                        <p>${response.description}</p>
                    </div>`;
    }
  }

  // Add an event listener when certain card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    console.log(e);
    e.addEventListener("click", async (item) => {
      // console.log(item);
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  // Get all songs from the server
  await getSongs("songs/hindi");
  console.log(songs);

  // Setting 1 song by defualt loaded
  playMusic(songs[0], true);

  // Display all the Albumbs on the page
  displayAlbumbs();

  // Attach event listeners to the play, back and forward buttons
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "./images/pause.svg";
    } else {
      currentSong.pause();
      play.src = "./images/play.svg";
    }
  });

  back.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    console.log(index);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    console.log(index);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Listen for timeUpdating Event
  currentSong.addEventListener("timeupdate", () => {
    console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".songTime").innerHTML = `${secondsToMinutes(
      currentSong.currentTime
    )}/${secondsToMinutes(currentSong.duration)}`;

    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Attack event listeners to the seekBar to control it
  document.querySelector(".seekBar").addEventListener("click", (e) => {
    // console.log(e.target.getBoundingClientRect().width, e.offsetX)

    let movingPercent =
      (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = movingPercent + "%";

    currentSong.currentTime = (currentSong.duration * movingPercent) / 100;
  });

  // Add an event listener to Menu Icon
  document.querySelector(".menuIcon").addEventListener("click", () => {
    document.querySelector(".left").style.left = 0;
  });

  // Add an event listener to Close Menu Icon
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Add an event listener to Volume Bar
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Setting Volume To =", e.target.value + " Out Of 100");
      currentSong.volume = e.target.value / 100;
    });

  // Add an event to volume btn to mute the song when clicked
  // document.querySelector(".volume > img").addEventListener("click", (e) => {
  //   if (e.target.src.includes("./images/volume.svg")) {
  //     e.target.src = e.target.src.replace(
  //       "./images/volume.svg",
  //       "./images/mute.svg"
  //     );
  //     currentSong.volume = 0;
  //     document
  //       .querySelector(".range")
  //       .getElementsByTagName("input")[0].value = 0;
  //   } else {
  //     e.target.src = e.target.src.replace(
  //       "./images/mute.svg",
  //       "./images/volume.svg"
  //     );
  //     currentSong.volume = 0.1;
  //     document
  //       .querySelector(".range")
  //       .getElementsByTagName("input")[0].value = 10;
  //   }
  // });
}
main();
