import React, { useState, useEffect, useRef } from 'react'
import { Card } from './Card'
import { Html } from '@react-three/drei'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'

const shuffle = (array) => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

const generatePairs = () => [
  1, 1, 2, 2, 3, 3, 4, 4, 5, 5,
  6, 6, 7, 7, 8, 8, 9, 9, 10, 10
]

export function CardGrid({ resetTick, onReset }) {
  const [time, setTime] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const timerRef = useRef(null)

  const [shuffledNumbers, setShuffledNumbers] = useState(() => shuffle(generatePairs()))
  const [flippedIndices, setFlippedIndices] = useState([])
  const [matchedIndices, setMatchedIndices] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const { width, height } = useWindowSize()
  const isGameClear = matchedIndices.length === 20

  useEffect(() => {
    setTime(0)
    setIsActive(false)
    if (resetTick >= 0) {
      setFlippedIndices([])
      setMatchedIndices([])
      setIsProcessing(false)
      setShuffledNumbers(shuffle(generatePairs()))
    }
  }, [resetTick])

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1)
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isActive])

  if (isGameClear && isActive) {
    setIsActive(false)
  }

  const handleCardClick = (index) => {
    if (isProcessing || flippedIndices.includes(index) || matchedIndices.includes(index)) return
    if (!isActive) setIsActive(true)

    const newFlipped = [...flippedIndices, index]
    setFlippedIndices(newFlipped)

    if (newFlipped.length === 2) {
      setIsProcessing(true)
      const [first, second] = newFlipped
      if (shuffledNumbers[first] === shuffledNumbers[second]) {
        setMatchedIndices((prev) => [...prev, first, second])
        setFlippedIndices([])
        setIsProcessing(false)
      } else {
        setTimeout(() => {
          setFlippedIndices([])
          setIsProcessing(false)
        }, 1000)
      }
    }
  }

  const colCount = 4
  const gapX = 1.2
  const gapY = 1.5
  const offsetX = ((colCount - 1) * gapX) / 2
  const rowCount = Math.ceil(shuffledNumbers.length / colCount)
  const offsetY = ((rowCount - 1) * gapY) / 2

  return (
    <group position={[0, 0, 0]}>
      {/* オーバーレイ（HUD）を統合 */}
      <Html fullscreen style={{ pointerEvents: 'none' }}>
        <div className="hud-container">

          <button className="reset-button" onClick={onReset} style={{ pointerEvents: 'auto' }}>
            🔁 もう一度
          </button>
        </div>

        {isGameClear && (
        <div className="clear-message">
          <h1> 🎊 </h1>
          <p style={{ fontSize: '24px', color: '#5d5d5d' }}>
             全部そろいました👏
          </p>
          <p style={{ fontSize: '24px', color: '#be185d', marginTop: '10px' }}>
            ⏱：{time}秒
          </p>
        </div>
      )}


      </Html>

      {isGameClear && (
        <Html fullscreen style={{ pointerEvents: 'none' }}>
          <Confetti width={width} height={height} recycle={true} numberOfPieces={300} />
        </Html>
      )}

      {shuffledNumbers.map((num, index) => {
        const x = (index % colCount) * gapX
        const y = Math.floor(index / colCount) * -gapY
        const isFlipped = flippedIndices.includes(index) || matchedIndices.includes(index)

        return (
          <Card
            key={`${resetTick}-${index}`}
            position={[x - offsetX, y + offsetY, 0]}
            number={num}
            flipped={isFlipped}
            onPointerDown={() => handleCardClick(index)}
          />
        )
      })}
    </group>
  )
}
