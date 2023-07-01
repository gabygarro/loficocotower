import React, { useEffect, useState, useRef } from 'react'
import Button from '@mui/material/Button'

const musicStreamUrl = "https://stream-160.zeno.fm/0r0xa792kwzuv"
const sjoAtcUrl = "https://s1-fmt2.liveatc.net/mroc?nocache=2023061720454128791"

export const Player = () => {
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [canPlayMusic, setCanPlayMusic] = useState(false)
  const [canPlayAtc, setCanPlayAtc] = useState(false)
  const musicAudio = useRef()
  const atcAudio = useRef()

  useEffect(() => {
    musicAudio.current = new Audio(musicStreamUrl)
    musicAudio.current.addEventListener('canplay', () => {
      setCanPlayMusic(true)
    })
    atcAudio.current = new Audio(sjoAtcUrl)
    atcAudio.current.addEventListener('canplay', () => {
      setCanPlayAtc(true)
    })
  }, [])

  useEffect(() => {
    if (loading && canPlayMusic && canPlayAtc) {
      musicAudio.current.play()
      atcAudio.current.play()
      setPlaying(true)
      setLoading(false)
    }
  }, [canPlayMusic, canPlayAtc])

  const playOnClick = () => {
    setLoading(true)
    if (!canPlayMusic || !canPlayAtc) return
    if (!playing) {
      musicAudio.current.play()
      atcAudio.current.play()
      setPlaying(true)
      setLoading(false)
    } else if (playing) {
      musicAudio.current.pause()
      atcAudio.current.pause()
      setPlaying(false)
      setLoading(false)
    }
  }

  return (<>
  <h1 className="title">loficocotower</h1>
  <div className="content">
    <Button
      className="playButton"
      onClick={playOnClick}
      disabled={loading}>
        {loading ? 'loading...' : (playing ? 'stop' : 'play')}
    </Button>
  </div></>)
}
