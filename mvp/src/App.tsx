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

// 模拟排行榜数据
const MOCK_LEADERBOARD = [
  { name: "卷王之王", score: 156, prof: "全栈开发" },
  { name: "手术室钉子户", score: 142, prof: "外科医生" },
  { name: "五三战神", score: 128, prof: "中学学生" },
  { name: "退役熬夜选手", score: 98, prof: "大学学生" },
  { name: "资本家本尊", score: 85, prof: "酒店老板" }
]

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
  const [showLeaderboard, setShowLeaderboard] = useState(false)

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
      mental: Math.min(100, stats.mental + option.effect.mental - 5),
      competence: stats.competence + option.effect.competence,
      slacking: Math.min(100, stats.slacking + option.effect.slacking),
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

  // 首页职业选择 + 排行榜
  if (!profession) {
    return (
      <div className="game-container selection-screen">
        <h1 className="title">职业挑战者</h1>
        <p className="subtitle">选择你的角色，开始生存博弈</p>
        
        <div className="main-tabs">
          <button className={`tab-btn ${!showLeaderboard ? 'active' : ''}`} onClick={() => setShowLeaderboard(false)}>角色选择</button>
          <button className={`tab-btn ${showLeaderboard ? 'active' : ''}`} onClick={() => setShowLeaderboard(true)}>全国榜单</button>
        </div>

        {!showLeaderboard ? (
          <div className="prof-list">
            {profData.professions.map((p: Profession) => (
              <div key={p.id} className="prof-card" onClick={() => selectProfession(p)}>
                <div className="prof-avatar">{p.avatar}</div>
                <div className="prof-info">
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="leaderboard-list">
            {MOCK_LEADERBOARD.map((item, i) => (
              <div key={i} className="leader-item">
                <span className="rank">#{i+1}</span>
                <div className="leader-info">
                  <strong>{item.name}</strong>
                  <span>{item.prof}</span>
                </div>
                <div className="leader-score">{item.score} 天</div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (isGameOver) {
    return (
      <div className="game-container game-over">
        <div className="over-content">
          <h1>GAME OVER</h1>
          <p className="big-day">存活天数: {stats.day}</p>
          <div className="final-avatar">{profession.avatar}</div>
          <p>{stats.money <= 0 ? "你已经身无分文。" : "你的精神已经彻底崩溃。"}</p>
          <button className="restart-btn" onClick={() => window.location.reload()}>重新投胎</button>
        </div>
      </div>
    )
  }

  return (
    <div className="game-container">
      <div className="day-badge">DAY {stats.day}</div>
      
      <div className="status-bar">
        <StatBar label="💰 存款" value={stats.money} max={5000} color="#ffdeeb" />
        <StatBar label="❤️ 精神" value={stats.mental} max={100} color="#ff6b6b" />
        <StatBar label="💼 能力" value={stats.competence} max={200} color="#4dabf7" />
        <StatBar label="🐟 摸鱼" value={stats.slacking} max={100} color="#51cf66" />
      </div>

      <div className="mini-profile">
        <span>{profession.avatar} {profession.name}</span>
        <small>{profession.outfit}</small>
      </div>

      {currentEvent && (
        <div className="event-card">
          <div className="event-header">
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
          <div className="modal">
            <h3>结果反馈</h3>
            <p>{feedback.text}</p>
            <div className="insight-box">
              <strong>💡 职业心得</strong>
              <p>{feedback.insight}</p>
            </div>
            <button className="next-day-btn" onClick={closeFeedback}>继续下一天</button>
          </div>
        </div>
      )}
    </div>
  )
}

function StatBar({ label, value, max, color }: { label: string, value: number, max: number, color: string }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className="stat-item">
      <span style={{ minWidth: '60px' }}>{label}</span>
      <div className="stat-bar-bg">
        <div className="stat-fill" style={{ width: `${percentage}%`, backgroundColor: color }}></div>
      </div>
      <span style={{ fontSize: '10px' }}>{value}</span>
    </div>
  )
}
