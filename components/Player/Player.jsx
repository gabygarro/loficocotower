/* eslint-disable no-debugger */
import cx from "classnames"
import React, { useCallback, useEffect, useState, useRef } from "react"
import Button from "@mui/material/Button"
import axios from "axios"
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

export default function Player () {
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
  const [currentWeather, setCurrentWeather] = useState({ temp: ' ', wind: ' ', windDir: ' ', time: ' ', sunrise: 0, sunset: 0 })
  const firstLoad = useRef(false)

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

  // Background style checker
  const updateStyle = useCallback(() => {
    const currentHour = Date.now()
    const daytime = [currentWeather.sunrise, currentWeather.sunset]
    setIsDaytime(
      currentHour >= daytime[0] &&
      currentHour < daytime[1]
    )
    return setInterval(updateStyle, 60000)
  }, [currentWeather])

  useEffect(() => {
    let intervalId
    if (currentWeather.sunrise !== 0 && currentWeather.sunset !== 0) {
      intervalId = updateStyle()
    }
    return () => {
      clearInterval(intervalId)
    }
  }, [currentWeather])

  useEffect(() => {
    setSelectedMusicIndex(getRandomIndex(songs.length))
  }, [])

  const fetchWeatherData = async () => {
    try {
      const todaysDate = new Date().toISOString().split("T")[0]
      const tomorrowsDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      const { data: {
        hourly: { temperature_2m, wind_direction_10m, wind_speed_10m, time },
        daily: { sunrise: [sunrise], sunset: [sunset] }
      }} = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=9.999010&longitude=-84.194169&hourly=temperature_2m,wind_speed_10m,wind_direction_10m&daily=sunrise,sunset&timezone=America%2FChicago&start_date=${
          todaysDate
        }&end_date=${tomorrowsDate}`
      );
      let nextHour = new Date().getHours() + 1
      setCurrentWeather({
        temp: temperature_2m[nextHour],
        wind: wind_speed_10m[nextHour],
        windDir: wind_direction_10m[nextHour],
        time: time[nextHour],
        sunrise: Date.parse(sunrise),
        sunset: Date.parse(sunset)
      })
      // Update weather data in 30 mins
      return setInterval(fetchWeatherData, 1000 * 60 * 30)
    } catch (error) {
      setIsDaytime(true)
    }
  }

  useEffect(() => {
    let intervalId
    if (!firstLoad.current) {
      intervalId = fetchWeatherData()
      firstLoad.current = true
    }
    return () => {
      clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    if (!firstLoad.current) {
      fetchWeatherData()
      firstLoad.current = true
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
        <div className="background-container"></div>
        <div className="background-plane landing"></div>
        <div className="background-plane takingoff"></div>
        <div className="airport-stats" title={`Pronóstico para ${currentWeather.time}`}>
          <label>temp: <span>{currentWeather.temp}°C</span></label>
          <label>wind: <span>{currentWeather.wind}km/h {currentWeather.windDir}°</span></label>
        </div>
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
