import React, { useState, useEffect, useRef } from 'react'
import { Card } from './Card'
import { Html } from '@react-three/drei'
import confetti from 'canvas-confetti'; // canvas-confettiをインポート

// ヘルパー関数：配列をシャッフル
const shuffle = (array) => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// ヘルパー関数：ペアを生成
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
  const [mistakeCount, setMistakeCount] = useState(0)

  // ゲームクリア判定
  const isGameClear = matchedIndices.length === 20

  // リセット時の処理
  useEffect(() => {
    setTime(0)
    setIsActive(false)
    if (resetTick >= 0) {
      // ★リセット時に紙吹雪が残っていたら消す
      confetti.reset();

      setFlippedIndices([])
      setMatchedIndices([])
      setIsProcessing(false)
      setShuffledNumbers(shuffle(generatePairs()))
      setMistakeCount(0)
    }
  }, [resetTick])

  // タイマー処理
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

  // クリア時にタイマー停止
  if (isGameClear && isActive) {
    setIsActive(false)
  }

  // 絵文字紙吹雪を発射するエフェクト
  useEffect(() => {
    if (isGameClear) {
      // 1. 絵文字の形（シェイプ）を作成する関数
      const scalar = 3; // 絵文字の大きさ倍率（2〜4くらいがおすすめ）
      const emojiShape = (emoji) => confetti.shapeFromText({ text: emoji, scalar });

      // 2. 飛ばしたい絵文字を定義
      const shapes = [
        emojiShape('🧩'), // 神経衰弱なのでピース
        emojiShape('🍎'), // りんご
        emojiShape('🦆'), // アヒル
        emojiShape('⛵'), // ヨット
        emojiShape('👑'), // 王冠
        emojiShape('🐱'), // ねこ
        emojiShape('🍇'), // 葡萄
        emojiShape('🎂'), // お祝い
      ];

      // 3. 紙吹雪を実行
      confetti({
        particleCount: 150, // 粒の数
        spread: 100,        // 広がり具合（100だと広範囲）
        origin: { y: 0.6 }, // 画面の高さの60%の位置から発射
        shapes: shapes,     // 作成した絵文字シェイプ
        scalar: scalar,     // 全体のサイズ倍率
        ticks: 400,         // アニメーションの長さ（フレーム数）
        zIndex: 2000,       // HTMLより手前に表示させる
      });
    }
  }, [isGameClear]); // isGameClearがtrueになった時に実行

  // カードクリック時の処理
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
        setMistakeCount(prev => prev + 1)
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
      {/* HUD（2Dオーバーレイ） */}
      <Html fullscreen style={{ pointerEvents: 'none' }}>
        <div className="hud-container">
          <button className="reset-button" onClick={onReset} style={{ pointerEvents: 'auto' }}>
            🔁 もう一度
          </button>
        </div>

        {isGameClear && (
          <div className="clear-message">
            <h1> 🎊 👏</h1>
            <p style={{ fontSize: '24px', color: '#be185d', marginTop: '10px' }}>
              ⏱：{time}秒
            </p>
            <p>🥺 ミス：{mistakeCount}回</p>
          </div>
        )}
      </Html>

      {/* 3Dカードの描画ループ */}
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
