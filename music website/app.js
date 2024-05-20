document.addEventListener("DOMContentLoaded", async function () {
  const clientId = "7d5b720ad9054b93a1a8f5311dd6d862";
  const clientSecret = "99d1373a855f4c0ea95a8d6f4fb347a6";

  async function getAccessToken() {
    const url = "https://accounts.spotify.com/api/token";
    const headers = new Headers({
      Authorization: "Basic " + btoa(clientId + ":" + clientSecret),
      "Content-Type": "application/x-www-form-urlencoded",
    });
    const body = "grant_type=client_credentials";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: body,
      });
      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error("Error fetching access token:", error);
    }
  }

  async function fetchAlbumData(accessToken, albumId) {
    const url = `https://api.spotify.com/v1/albums/${albumId}`;
    const headers = new Headers({
      Authorization: `Bearer ${accessToken}`,
    });

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: headers,
      });
      if (!response.ok) {
        throw new Error(`Error fetching album data: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching album data:", error);
    }
  }

  async function fetchArtistData(accessToken, artistId) {
    const url = `https://api.spotify.com/v1/artists/${artistId}`;
    const headers = new Headers({
      Authorization: `Bearer ${accessToken}`,
    });

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: headers,
      });
      if (!response.ok) {
        throw new Error(`Error fetching artist data: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching artist data:", error);
    }
  }

  async function fetchArtistTopTracks(accessToken, artistId) {
    const url = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`;
    const headers = new Headers({
      Authorization: `Bearer ${accessToken}`,
    });

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: headers,
      });
      if (!response.ok) {
        throw new Error(
          `Error fetching artist top tracks: ${response.statusText}`
        );
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching artist top tracks:", error);
    }
  }

  let currentPlayingButton = null;
  let currentSongIndex = -1;
  let songsList = [];
  let currentAlbum = null;

  const songInfoContainer = document.createElement("div");
  songInfoContainer.classList.add("song-info-container");

  const songNameElement = document.createElement("div");
  songNameElement.classList.add("song-name");

  const songImageElement = document.createElement("img");
  songImageElement.classList.add("song-image");
  songImageElement.alt = "";

  songInfoContainer.appendChild(songImageElement);
  songInfoContainer.appendChild(songNameElement);

  const controlItems = document.querySelector(".control-items");
  controlItems.insertBefore(
    songInfoContainer,
    controlItems.querySelector("#controls-loop").previousSibling
  );

  async function fetchAlbums() {
    const accessToken = await getAccessToken();
    const albumIds = [
      "3IBcauSj5M2A6lTeffJzdv",
      "1ATL5GLyefJaxhQzSPVrLX",
      "1d1FYLFpu2NITI6ilVaHDd",
      "5xjaz957o6YGSXmlfd2tex",
      "53CrWGB4SGRk5DQgRterIG",
      "3QEdmlZg1FD9YYe1lzB5kp",
      "3uuu6u13U0KeVQsZ3CZKK4",
    ];

    const albumsContainer = document.getElementById("album-scroll");
    if (!albumsContainer) {
      console.error("Error: albumsContainer not found");
      return;
    }

    albumsContainer.innerHTML = "";

    for (const albumId of albumIds) {
      const albumData = await fetchAlbumData(accessToken, albumId);
      if (albumData) {
        displayAlbum(albumData);
      } else {
        console.error(`Album data is missing or invalid for ID: ${albumId}`);
      }
    }
  }

  function displayAlbum(album) {
    const albumsContainer = document.getElementById("album-scroll");
    const albumElement = document.createElement("div");
    albumElement.classList.add("album");
    albumElement.dataset.albumId = album.id;

    const albumImage = document.createElement("img");
    albumImage.src = album.images[0].url;
    albumImage.alt = album.name;
    albumElement.appendChild(albumImage);

    const playButton = document.createElement("button");
    playButton.classList.add("play-button");
    playButton.innerHTML = '<i class="fa-solid fa-play"></i>';

    playButton.addEventListener("click", () => {
      currentAlbum = album;
      fetchAndDisplaySongs(album.id);
    });

    albumElement.append(playButton);
    albumsContainer.appendChild(albumElement);
  }

  async function fetchAndDisplaySongs(albumId) {
    const accessToken = await getAccessToken();
    const apiUrl = `https://api.spotify.com/v1/albums/${albumId}/tracks`;
    const headers = new Headers({
      Authorization: `Bearer ${accessToken}`,
    });

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: headers,
      });
      const data = await response.json();

      const songs = data.items;

      if (!songs || songs.length === 0) {
        console.error("no songs found for this album.");
      }

      songsList = songs;

      const playlistTab = document.getElementById("playlist-tab");
      playlistTab.innerHTML = "";

      songsList.forEach((song, index) => {
        const songElement = document.createElement("div");
        songElement.classList.add("song");
        songElement.textContent = song.name;

        const playButton = document.createElement("button");
        playButton.classList.add("play-btn");
        playButton.innerHTML = '<i class="fa-solid fa-play"></i>';
        playButton.addEventListener("click", () => {
          togglePlayState(
            playButton,
            song.preview_url,
            song.name,
            currentAlbum.images[0].url
          );
          currentSongIndex = index;
        });

        songElement.appendChild(playButton);
        playlistTab.appendChild(songElement);
      });

      if (songsList.length > 0) {
        currentSongIndex = 0;
        playSong(songsList[currentSongIndex]);
      }
    } catch (error) {
      console.error("Error fetching songs:", error);
    }
  }

  function togglePlayState(button, url, songName, songImage) {
    const audioPlayer = document.getElementById("audio-player");
    if (!audioPlayer) {
      throw new Error("audio-player not found");
    }

    if (currentPlayingButton && currentPlayingButton !== button) {
      currentPlayingButton.classList.remove("playing");
      currentPlayingButton.innerHTML = '<i class="fa-solid fa-play"></i>';
      audioPlayer.pause();
    }

    const isPlaying = button.classList.contains("playing");

    if (isPlaying) {
      button.classList.remove("playing");
      button.innerHTML = '<i class="fa-solid fa-play"></i>';
      audioPlayer.pause();
    } else {
      if (url) {
        button.classList.add("playing");
        button.innerHTML = '<i class="fa-solid fa-pause"></i>';
        audioPlayer.src = url;
        audioPlayer.play();

        songNameElement.textContent = songName;
        songImageElement.src = songImage;
      }
    }

    currentPlayingButton = button;
  }

  function playSong(song) {
    const audioPlayer = document.getElementById("audio-player");
    if (!audioPlayer) {
      throw new Error("audio-player not found");
    }

    if (!audioPlayer.paused) {
      audioPlayer.pause();
    }

    // audioPlayer.removeAttribute("src");
    // audioPlayer.load();

    if (song.preview_url) {
      audioPlayer.src = song.preview_url;
      audioPlayer.play();

      songNameElement.textContent = song.name || "unknown Title";

      songImageElement.src = song.album.images[0].url;

      const playlistTab = document.getElementById("playlist-tab");
      if (playlistTab) {
        const playButtons = playlistTab.getElementsByClassName("play-btn");
        if (playButtons[currentSongIndex]) {
          if (currentPlayingButton) {
            currentPlayingButton.classList.remove("playing");
            currentPlayingButton.innerHTML = '<i class="fa-solid fa-play"></i>';
          }

          currentPlayingButton = playButtons[currentSongIndex];
          currentPlayingButton.classList.add("playing");
          currentPlayingButton.innerHTML = '<i class="fa-solid fa-pause"></i>';
        }
      }
    } else {
      alert("No preview available for this track.");
    }
  }

  const audioPlayer = document.getElementById("audio-player");
  if (!audioPlayer) {
    throw new Error("audio-player not found");
  }

  if (audioPlayer) {
    audioPlayer.addEventListener("play", () => {
      if (currentPlayingButton) {
        currentPlayingButton.classList.add("playing");
        currentPlayingButton.innerHTML = '<i class="fa-solid fa-pause"></i>';
      }
    });

    audioPlayer.addEventListener("pause", () => {
      if (currentPlayingButton) {
        currentPlayingButton.classList.remove("playing");
        currentPlayingButton.innerHTML = '<i class="fa-solid fa-play"></i>';
      }
    });

    audioPlayer.addEventListener("ended", () => {
      if (currentSongIndex < songsList.length - 1) {
        currentSongIndex++;
        playSong(songsList[currentSongIndex]);
      } else {
        if (currentPlayingButton) {
          currentPlayingButton.classList.remove("playing");
          currentPlayingButton.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
      }
    });
  }

  async function fetchArtists() {
    const accessToken = await getAccessToken();
    const artistIds = [
      "1dfeR4HaWDbWqFHLkxsg1d",
      "3Nrfpe0tUJi4K4DXYWgMUX",
      "6eUKZXaKkcviH0Ku9w2n3V",
      "53XhwfbYqKCa1cC15pYq2q",
      "66CXWjxzNUsdJxJ2JdwvnR",
    ];

    const artistsContainer = document.getElementById("artist-scroll");
    if (!artistsContainer) {
      console.error("Error: artistsContainer not found");
      return;
    }

    artistsContainer.innerHTML = "";

    for (const artistId of artistIds) {
      const artistData = await fetchArtistData(accessToken, artistId);
      if (artistData) {
        displayArtist(artistData);
      } else {
        console.error(`Artist data is missing or invalid for ID: ${artistId}`);
      }
    }
  }

  function displayArtist(artist) {
    const artistsContainer = document.getElementById("artist-scroll");
    const artistElement = document.createElement("div");
    artistElement.classList.add("artist");
    artistElement.dataset.artistId = artist.id;

    const artistImage = document.createElement("img");
    artistImage.src = artist.images[0].url;
    artistImage.alt = artist.name;
    artistElement.appendChild(artistImage);

    const artistName = document.createElement("div");
    artistName.textContent = artist.name;
    artistElement.appendChild(artistName);

    artistElement.addEventListener("click", () => {
      fetchAndDisplayArtistTracks(artist.id);
    });

    artistsContainer.appendChild(artistElement);
  }

  async function fetchAndDisplayArtistTracks(artistId) {
    const accessToken = await getAccessToken();
    const tracksData = await fetchArtistTopTracks(accessToken, artistId);

    songsList = tracksData.tracks;

    const playlistTab = document.getElementById("playlist-tab");
    playlistTab.innerHTML = "";

    songsList.forEach((song, index) => {
      const songElement = document.createElement("div");
      songElement.classList.add("song");
      songElement.textContent = song.name;

      const playButton = document.createElement("button");
      playButton.classList.add("play-btn");
      playButton.innerHTML = '<i class="fa-solid fa-play"></i>';
      playButton.addEventListener("click", () => {
        togglePlayState(
          playButton,
          song.preview_url,
          song.name,
          song.album.images[0].url
        );
        currentSongIndex = index;
      });

      songElement.appendChild(playButton);
      playlistTab.appendChild(songElement);
    });

    if (songsList.length > 0) {
      currentSongIndex = 0;
      playSong(songsList[currentSongIndex]);
    }
  }

  async function search(accessToken, query) {
    const apiUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      query
    )}&type=track&limit=10`;
    const headers = new Headers({
      Authorization: `Bearer ${accessToken}`,
    });

    try {
      const response = await fetch(apiUrl, { headers });
      const data = await response.json();

      const songs = data.tracks.items;

      if (!songs || songs.length === 0) {
        console.error("No songs found for this search.");
        return;
      }

      songsList = songs;

      const playlistTab = document.getElementById("playlist-tab");
      playlistTab.innerHTML = "";

      songs.forEach((song, index) => {
        const songElement = document.createElement("div");
        songElement.classList.add("song");
        songElement.textContent = song.name;

        const playButton = document.createElement("button");
        playButton.classList.add("play-btn");
        playButton.innerHTML = '<i class="fa-solid fa-play"></i>';
        playButton.addEventListener("click", () => {
          currentSongIndex = index;
          togglePlayState(
            playButton,
            song.preview_url,
            song.name,
            song.album?.images[0]?.url
          );
        });

        songElement.appendChild(playButton);
        playlistTab.appendChild(songElement);
      });

      if (songsList.length > 0) {
        currentSongIndex = 0;
        playSong(songsList[currentSongIndex]);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  }

  async function main() {
    const accessToken = await getAccessToken();
    await fetchAlbums();
    await fetchArtists();

    const searchButton = document.getElementById("search-btn");
    searchButton.addEventListener("click", async () => {
      const query = document.getElementById("search-bar").value;
      if (query) {
        await search(accessToken, query);
      }
    });
  }

  main();
});

function toggleControl() {
  const playlist = document.querySelector(".layout-controls");
  playlist.classList.toggle("visible");
}
