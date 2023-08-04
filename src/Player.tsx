import cx from "classnames"
import { useEffect, useState, useRef } from "react"
import Button from "@mui/material/Button"
import { type AudioElementStatus, createAudioElement, debounce } from "./utils"

const musicStreamUrl = "https://stream-160.zeno.fm/0r0xa792kwzuv"

const sjoAtcUrl = "https://s1-fmt2.liveatc.net/mroc"


export const Player = () : JSX.Element => {
  const [playing, setPlaying] = useState(false)
  const musicAudio = useRef<HTMLAudioElement>()
  const atcAudio = useRef<HTMLAudioElement>()
  const [musicStatus, setMusicStatus] = useState<AudioElementStatus>(null)
  const [atcStatus, setAtcStatus] = useState<AudioElementStatus>(null)
  const [isDaytime, setIsDaytime] = useState<boolean|null>(null)

  useEffect(() => {
    if (musicAudio.current === undefined) {
      musicAudio.current = createAudioElement(
        musicStreamUrl,
        "music",
        musicStatus,
        setMusicStatus
      )
    }
  }, [musicAudio])

  useEffect(() => {
    if (atcAudio.current === undefined) {
      atcAudio.current = createAudioElement(
        sjoAtcUrl,
        "atc",
        atcStatus,
        setAtcStatus
      )
    }
  }, [atcAudio])

  const togglePlayPause = debounce(() => {
    if (!playing) {
      atcAudio.current?.play().catch((reason) => {
        console.error(reason)
      })
      musicAudio.current?.play().catch((reason) => {
        console.error(reason)
      })
      setPlaying(true)
    } else {
      atcAudio.current?.pause()
      musicAudio.current?.pause()
      setPlaying(false)
    }
  }, 250)

  useEffect(() => {
    const updateStyle = (): void => {
      const currentUtcHour = new Date().getUTCHours()
      const desiredUtcHours = [0, 12]
      setIsDaytime(
        !(
          currentUtcHour >= desiredUtcHours[0] &&
          currentUtcHour < desiredUtcHours[1]
        )
      )
    }
    const intervalId = setInterval(updateStyle, 1000)
    return () => {
      clearInterval(intervalId)
    }
  }, [])

  return (
    <div
      className={cx("app", {
        "visibility-hidden": isDaytime === null,
        "day-background": isDaytime,
        "night-background": !(isDaytime ?? false),
      })}
    >
      <div className="title-container">
        <h1 className="title">loficocotower</h1>
      </div>
      <div className="content">
        <div className="player" />
        <Button
          className={cx("playButton", {
            shadowAnimation:
              musicStatus === "loading" || atcStatus === "loading" || playing,
          })}
          onClick={togglePlayPause}
          disabled={musicStatus === "loading" || atcStatus === "loading"}
        >
          {musicStatus === "loading" || atcStatus === "loading"
            ? "loading..."
            : playing
            ? "stop"
            : "play"}
        </Button>
      </div>
    </div>
  )
}
