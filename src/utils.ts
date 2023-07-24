export function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(
  func: F,
  wait: number, 
  immediate?: boolean,
): (...args: Parameters<F>) => void { 

  let timeout: NodeJS.Timeout;

  return (...args: Parameters<F>): void => {
    if (immediate &&!timeout) {
        func(...args);
      }
      clearTimeout(timeout);
      timeout = setTimeout(() => !immediate && func(...args), wait);
  }
};
  


const createAudioElementBase = (url: string, id: string) => {
  const audioElement = new Audio(url)
  audioElement.preload = "metadata"
  audioElement.setAttribute("id", id)
  audioElement.controls = false
  document.querySelector(".player")?.appendChild(audioElement)
  return audioElement
}

const attachAudioEventHandlers = (audioElement: HTMLAudioElement, curStatus: string, setStatus: ((s: string)=>void)) => {
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
    console.error(err)
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

export const createAudioElement = (url: string, id: string, curStatus: string, setStatus: ((s: string)=>void)) => {
  const audioElement = createAudioElementBase(url, id)
  attachAudioEventHandlers(audioElement, curStatus, setStatus)
  return audioElement
}
