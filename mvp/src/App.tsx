import { useState, useEffect } from 'react'
import eventsData from './data/events.json'
import profData from './data/professions.json'

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

interface Profession {
  id: string
  name: string
  avatar: string
  outfit: string
  description: string
  initialStats: {
    money: number
    mental: number
    competence: number
    slacking: number
  }
}

export default function App() {
  const [profession, setProfession] = useState<Profession | null>(null)
  const [stats, setStats] = useState({
    money: 0,
    mental: 0,
    competence: 0,
    slacking: 0,
    day: 1
  })

  const [currentEvent, setCurrentEvent] = useState<Event | null>(null)
  const [feedback, setFeedback] = useState<{ text: string; insight: string } | null>(null)
  const [isGameOver, setIsGameOver] = useState(false)

  // 职业选择处理
  const selectProfession = (p: Profession) => {
    setProfession(p)
    setStats({ ...p.initialStats, day: 1 })
    getNextEvent(p.id)
  }

  const getNextEvent = (profId: string) => {
    const allEvents = eventsData as Record<string, Event[]>
    const profEvents = allEvents[profId] || []
    if (profEvents.length === 0) return
    const randomEvent = profEvents[Math.floor(Math.random() * profEvents.length)]
    setCurrentEvent(randomEvent)
  }

  const handleOption = (option: Option) => {
    const newStats = {
      money: stats.money + option.effect.money - 50,
      mental: stats.mental + option.effect.mental - 5,
      competence: stats.competence + option.effect.competence,
      slacking: stats.slacking + option.effect.slacking,
      day: stats.day + 1
    }

    if (newStats.money <= 0 || newStats.mental <= 0) {
      setIsGameOver(true)
    }

    setStats(newStats)
    setFeedback({ text: option.reaction, insight: option.insight })
  }

  const closeFeedback = () => {
    setFeedback(null)
    if (!isGameOver && profession) getNextEvent(profession.id)
  }

  // 1. 初始职业选择界面
  if (!profession) {
    return (
      <div className="game-container selection-screen">
        <h1 className="title">职业挑战者</h1>
        <p className="subtitle">请选择你的初始职业以开始受苦</p>
        <div className="prof-list">
          {profData.professions.map((p: Profession) => (
            <div key={p.id} className="prof-card" onClick={() => selectProfession(p)}>
              <div className="prof-avatar">{p.avatar}</div>
              <h3>{p.name}</h3>
              <p className="outfit-text">装备: {p.outfit}</p>
              <p className="prof-desc">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 2. 游戏结束界面
  if (isGameOver) {
    return (
      <div className="game-over">
        <div className="over-content">
          <h1>游戏结束</h1>
          <p className="big-day">你在职场挣扎了 {stats.day} 天</p>
          <div className="final-avatar">{profession.avatar}</div>
          <p className="reason">{stats.money <= 0 ? "你破产了，由于交不起房租，你被迫回老家种地。" : "你猝死了，在工位上变成了一尊永恒的雕像。"}</p>
          <button className="restart-btn" onClick={() => window.location.reload()}>重新投胎</button>
        </div>
      </div>
    )
  }

  // 3. 游戏主界面
  return (
    <div className="game-container">
      <div className="status-bar">
        <div title="存款">💰 {stats.money}</div>
        <div title="精神">❤️ {stats.mental}</div>
        <div title="能力">💼 {stats.competence}</div>
        <div title="摸鱼">🐟 {stats.slacking}</div>
        <div className="day-count">Day {stats.day}</div>
      </div>

      <div className="player-info">
        <span className="mini-avatar">{profession.avatar}</span>
        <span className="prof-name">{profession.name}</span>
        <span className="outfit-tag">{profession.outfit}</span>
      </div>

      {currentEvent && (
        <div className="event-card">
          <div className="event-header">
            <span className="event-icon">📢</span>
            <h2>{currentEvent.title}</h2>
          </div>
          <p className="desc">{currentEvent.description}</p>
          <div className="options">
            {currentEvent.options.map((opt, i) => (
              <button key={i} className="opt-btn" onClick={() => handleOption(opt)}>
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {feedback && (
        <div className="modal-overlay">
          <div className="modal win-95-modal">
            <div className="modal-header">
              <span>系统提示</span>
              <button className="close-x" onClick={closeFeedback}>×</button>
            </div>
            <div className="modal-body">
              <p className="reaction">{feedback.text}</p>
              <div className="insight-box">
                <strong>💡 职业心得：</strong>
                <p>{feedback.insight}</p>
              </div>
              <button className="next-day-btn" onClick={closeFeedback}>进入下一天</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
