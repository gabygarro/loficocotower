export const debounce = (func, wait, immediate) => {
  let timeout
  return function () {
    const context = this
    const args = arguments
    const later = function () {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
}

export const createAudioElementBase = (url, id) => {
  const audioElement = new Audio(url)
  audioElement.preload = "metadata"
  audioElement.setAttribute("id", id)
  audioElement.controls = false
  document.querySelector(".player").appendChild(audioElement)
  return audioElement
}

export const attachAudioEventHandlers = (
  audioElement,
  curStatus,
  setStatus
) => {
  audioElement.addEventListener("play", () => {
    if (curStatus === "paused") {
      setStatus("loading")
    }
    const interval = setInterval(() => {
      if (audioElement.currentTime > 0) {
        setStatus("playing")
        clearInterval(interval)
      }
    }, 200)
  })
  audioElement.addEventListener("pause", () => {
    setStatus("paused")
  })
  // eslint-disable-next-line n/handle-callback-err
  audioElement.addEventListener("error", (err) => {
    setStatus("broken")
  })
  // error handling hook
  // kind of hacky with the interval
  const interval = setInterval(() => {
    // network state = 3 means NETWORK_NO_SOURCE
    // https://www.w3schools.com/tags/av_prop_networkstate.asp
    if (audioElement.networkState === 3) {
      setStatus("broken")
      clearInterval(interval)
    }
  }, 1000)
}

export const createAudioElement = (
  url,
  id,
  curStatus,
  setStatus,
  attachAddNextMusicHandler,
  selectedMusicIndex
) => {
  const audioElement = createAudioElementBase(url, id)
  attachAudioEventHandlers(audioElement, curStatus, setStatus)
  if (id === "music") {
    attachAddNextMusicHandler(audioElement, selectedMusicIndex)
  }
  return audioElement
}

export const getRandomIndex = (maxIndex) => Math.floor(Math.random() * maxIndex)

export const getMusicFileUrl = (name) =>
  `${process.env.PUBLIC_URL || ""}/music/${encodeURIComponent(name)}.mp3`
