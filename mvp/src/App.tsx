import { useState, useEffect } from 'react'
import eventsData from './data/events.json'

interface Effect {
  money: number
  mental: number
  competence: number
  slacking: number
}

interface Option {
  text: string
  effect: Effect
  reaction: string
  insight: string
}

interface Event {
  id: string
  title: string
  description: string
  options: Option[]
}

export default function App() {
  // 核心资源状态
  const [stats, setStats] = useState({
    money: 2000,
    mental: 100,
    competence: 10,
    slacking: 0,
    day: 1
  })

  const [currentEvent, setCurrentEvent] = useState<Event | null>(null)
  const [feedback, setFeedback] = useState<{ text: string; insight: string } | null>(null)
  const [isGameOver, setIsGameOver] = useState(false)

  // 初始化获取第一个事件
  useEffect(() => {
    getNextEvent()
  }, [])

  const getNextEvent = () => {
    const devEvents = eventsData.fullstack_dev
    const randomEvent = devEvents[Math.floor(Math.random() * devEvents.length)]
    setCurrentEvent(randomEvent)
  }

  const handleOption = (option: Option) => {
    // 1. 更新数值
    const newStats = {
      money: stats.money + option.effect.money - 50, // 每日固定开销
      mental: stats.mental + option.effect.mental - 5, // 每日固定压力
      competence: stats.competence + option.effect.competence,
      slacking: stats.slacking + option.effect.slacking,
      day: stats.day + 1
    }

    // 2. 判定胜负
    if (newStats.money <= 0 || newStats.mental <= 0) {
      setIsGameOver(true)
    }

    setStats(newStats)
    setFeedback({ text: option.reaction, insight: option.insight })
  }

  const closeFeedback = () => {
    setFeedback(null)
    if (!isGameOver) getNextEvent()
  }

  if (isGameOver) {
    return (
      <div className="game-over">
        <h1>游戏结束</h1>
        <p>你在第 {stats.day} 天倒下了...</p>
        <p>{stats.money <= 0 ? "破产了，流落街头。" : "精神崩溃，住进了 ICU。"}</p>
        <button onClick={() => window.location.reload()}>重新投胎</button>
      </div>
    )
  }

  return (
    <div className="game-container">
      {/* 状态栏 */}
      <div className="status-bar">
        <div>💰 {stats.money}</div>
        <div>❤️ {stats.mental}</div>
        <div>💼 {stats.competence}</div>
        <div>🐟 {stats.slacking}</div>
        <div>Day {stats.day}</div>
      </div>

      {/* 事件主体 */}
      {currentEvent && (
        <div className="event-card">
          <h2>{currentEvent.title}</h2>
          <p className="desc">{currentEvent.description}</p>
          <div className="options">
            {currentEvent.options.map((opt, i) => (
              <button key={i} onClick={() => handleOption(opt)}>
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 剧情与干货弹窗 */}
      {feedback && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>结果反馈</h3>
            <p className="reaction">{feedback.text}</p>
            <div className="insight-box">
              <strong>💡 职业心得：</strong>
              <p>{feedback.insight}</p>
            </div>
            <button onClick={closeFeedback}>进入下一天</button>
          </div>
        </div>
      )}
    </div>
  )
}
