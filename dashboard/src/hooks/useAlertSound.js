// useAlertSound Hook - Plays audio alerts for critical incidents
// ==============================================================

import { useRef, useCallback, useState, useEffect } from 'react'

// Local alarm sound file - using absolute path from public folder
const ALARM_SOUND_URL = '/sounds/alarm.mp3'

function useAlertSound() {
  const audioRef = useRef(null)
  const lastPlayedRef = useRef(0)
  const [isUnlocked, setIsUnlocked] = useState(false)
  
  // Minimum time between alerts (prevent spam)
  const COOLDOWN_MS = 5000 // 5 seconds

  // Initialize audio on mount
  useEffect(() => {
    audioRef.current = new Audio(ALARM_SOUND_URL)
    audioRef.current.preload = 'auto'
    audioRef.current.volume = 0.7
    
    // Log when audio is ready
    audioRef.current.addEventListener('canplaythrough', () => {
      console.log('🔊 Alarm audio loaded and ready')
    })
    
    audioRef.current.addEventListener('error', (e) => {
      console.error('❌ Audio load error:', e.target.error)
    })
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Play the alarm sound
  const playAlarmSound = useCallback(() => {
    if (!audioRef.current) {
      console.warn('Audio not initialized')
      return
    }
    
    try {
      // Reset to beginning if already playing
      audioRef.current.currentTime = 0
      
      audioRef.current.play()
        .then(() => {
          console.log('🚨 ALARM PLAYING!')
        })
        .catch((err) => {
          console.warn('Could not play alarm:', err.message)
        })
    } catch (err) {
      console.error('Audio error:', err)
    }
  }, [])

  // Stop the alarm
  const stopAlarm = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [])

  // Unlock audio (required for browser autoplay policy)
  const unlockAudio = useCallback(() => {
    if (!audioRef.current) return
    
    // Play and immediately pause to unlock
    audioRef.current.play()
      .then(() => {
        setIsUnlocked(true)
        console.log('🔓 Audio unlocked!')
      })
      .catch((err) => {
        console.warn('Could not unlock audio:', err.message)
      })
  }, [])

  // Play alert based on severity
  const playAlert = useCallback((severity) => {
    const now = Date.now()
    
    // Check cooldown
    if (now - lastPlayedRef.current < COOLDOWN_MS) {
      console.log('🔇 Alert on cooldown, skipping...')
      return
    }

    // Only play for Critical or High severity
    if (severity !== 'Critical' && severity !== 'High') {
      return
    }

    lastPlayedRef.current = now
    console.log(`🚨 Playing ${severity} alert...`)
    
    playAlarmSound()
  }, [playAlarmSound])

  // Test sound function
  const testSound = useCallback(() => {
    if (!audioRef.current) return
    
    audioRef.current.currentTime = 0
    audioRef.current.play()
      .then(() => {
        setIsUnlocked(true)
        console.log('🔊 Test alarm playing!')
      })
      .catch((err) => {
        console.warn('Could not play test:', err.message)
      })
  }, [])

  return { 
    playAlert, 
    unlockAudio, 
    testSound, 
    isUnlocked,
    stopAlarm,
    playAlarmSound
  }
}

export default useAlertSound
