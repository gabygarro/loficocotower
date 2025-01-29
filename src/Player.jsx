/* eslint-disable no-debugger */
import cx from "classnames"
import React, { useEffect, useState, useRef } from "react"
import Button from "@mui/material/Button"
import {
  createAudioElement,
  debounce,
  getRandomIndex,
  getMusicFileUrl,
  createAudioElementBase,
  attachAudioEventHandlers,
} from "./utils"
import { songs } from "./music"

const sjoAtcUrl = ["https://s1-bos.liveatc.net/mroc", "https://s1-fmt2.liveatc.net/mroc5"]

export const Player = () => {
  const [playing, setPlaying] = useState(false)
  const musicAudio = useRef()
  const atcAudio = useRef()
  const [musicStatus, setMusicStatus] = useState(null)
  const [atcStatus, setAtcStatus] = useState(null)
  const [isDaytime, setIsDaytime] = useState(null)
  const [selectedMusicIndex, setSelectedMusicIndex] = useState(null)
  const selectedSong = selectedMusicIndex ? songs[selectedMusicIndex] : null
  const musicAudioLoading = useRef()
  const [musicVolume, setMusicVolume] = useState(1)
  const [atcVolume, setAtcVolume] = useState(1)

  const attachAddNextMusicHandler = (audioElement, curMusicIndex) => {
    const PRE_LOAD_SECONDS = 10
    const nextMusicIndex = (curMusicIndex + 1) % songs.length
    const nextMusic = songs[nextMusicIndex]
    const preloadInterval = setInterval(() => {
      const curTime = audioElement.currentTime
      const duration = audioElement.duration
      if (curTime + PRE_LOAD_SECONDS >= duration) {
        const nextUrl = getMusicFileUrl(nextMusic.name)
        musicAudioLoading.current = createAudioElementBase(
          nextUrl,
          "music_loading"
        )
        clearInterval(preloadInterval)
      }
    }, 1000)
    audioElement.addEventListener("ended", () => {
      setMusicStatus("changing_source")
      const volume = musicAudio.current.volume
      musicAudio.current.remove()
      musicAudio.current = musicAudioLoading.current
      musicAudio.current.id = "music"
      musicAudio.current.volume = volume
      musicAudio.current.play()
      setSelectedMusicIndex(nextMusicIndex)
      musicAudioLoading.current = null
      attachAudioEventHandlers(musicAudio.current, musicStatus, setMusicStatus)
      attachAddNextMusicHandler(musicAudio.current, nextMusicIndex)
      setMusicStatus("playing")
    })
  }

  useEffect(() => {
    if (selectedSong && !musicAudio.current) {
      const url = getMusicFileUrl(selectedSong.name)
      musicAudio.current = createAudioElement(
        url,
        "music",
        musicStatus,
        setMusicStatus,
        attachAddNextMusicHandler,
        selectedMusicIndex
      )
    }
  }, [musicAudio, selectedSong])

  useEffect(() => {
    if (!atcAudio.current) {
      atcAudio.current = createAudioElement(
        sjoAtcUrl[0],
        "atc",
        atcStatus,
        setAtcStatus
      )
    }
  }, [atcAudio])

  // Use fallback atc
  useEffect(() => {
    if (atcStatus === 'broken') {
      atcAudio.current = createAudioElement(
        sjoAtcUrl[1],
        "atc",
        atcStatus,
        setAtcStatus
      )
    }
  }, [atcStatus])

  const togglePlayPause = debounce(() => {
    if (!playing) {
      atcAudio.current.play()
      musicAudio.current.play()
      setPlaying(true)
    } else {
      atcAudio.current.pause()
      musicAudio.current.pause()
      setPlaying(false)
    }
  }, 250)

  useEffect(() => {
    // Background style checker
    const updateStyle = () => {
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
    // Select music at random
    setSelectedMusicIndex(getRandomIndex(songs.length))
    return () => {
      clearInterval(intervalId)
    }
  }, [])

  return (
    <div
      className={cx("app", {
        "visibility-hidden": isDaytime === null,
        "day-background": isDaytime,
        "night-background": !isDaytime,
      })}
    >
      <div className="title-container">
        <h1 className="title">loficocotower</h1>
      </div>
      <div className="container">
        <div className="content">
          <div className="player" />
          {selectedSong && (
            <a
              className={cx("nowPlaying", {
                shadowAnimation:
                  musicStatus === "loading" ||
                  atcStatus === "loading" ||
                  playing,
              })}
              href={selectedSong.youtube}
              target="_blank"
              rel="noreferrer"
            >
              {selectedSong.name}
            </a>
          )}
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
        <div className="bottomContent">
          <div className="volume">
            <label htmlFor="musicVolume">🎹</label>
            <input
              type="range"
              id="musicVolume"
              min="0"
              max="1"
              step="0.01"
              value={musicVolume}
              onChange={(e) => {
                setMusicVolume(e.target.value)
                musicAudio.current.volume = e.target.value
              }}
            />
          </div>
          <div className="volume">
            <label htmlFor="atcVolume">✈️</label>
            <input
              type="range"
              id="atcVolume"
              min="0"
              max="1"
              step="0.01"
              value={atcVolume}
              onChange={(e) => {
                setAtcVolume(e.target.value)
                atcAudio.current.volume = e.target.value
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
