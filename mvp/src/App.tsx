import { useState, useEffect } from 'react'
import eventsData from './events.json'
import profData from './professions.json'

// 定义活动类型
interface Activity {
  id: string
  name: string
  desc: string
  cost: number
  effect: Effect
  reaction: string
}

const NIGHT_ACTIVITIES: Activity[] = [
  { id: 'gacha', name: '职业盲盒', desc: '9.9元抽一个“未来”，大概率是谢谢惠顾。', cost: 10, effect: { money: -10, mental: 5, competence: 0, slacking: 0 }, reaction: "你抽到了一个‘努力’挂件，感觉心理安慰大于实际作用。" },
  { id: 'course', name: '大师课：如何让老板离不开你', desc: '学习如何用 PPT 统治世界。', cost: 500, effect: { money: -500, mental: -20, competence: 50, slacking: -10 }, reaction: "听完后你觉得自己行了，但第二天看代码还是想吐。" },
  { id: 'party', name: '报复性熬夜', desc: '凌晨两点的烧烤是灵魂的救赎。', cost: 100, effect: { money: -100, mental: 40, competence: -5, slacking: 20 }, reaction: "身体很累，但灵魂得到了自由。明天起床可能会想死。" },
  { id: 'parttime', name: '深夜 AI 代写', desc: '出卖灵魂，为高中生代写作文。', cost: 0, effect: { money: 200, mental: -40, competence: 5, slacking: -10 }, reaction: "钱到账了，但你看着那些幼稚的文字，觉得自己正在毁掉下一代。" }
]

// ... 之前的接口定义保持不变 ...
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

const MOCK_LEADERBOARD = [
  { name: "卷王之王", score: 156, prof: "全栈开发" },
  { name: "手术室钉子户", score: 142, prof: "外科医生" },
  { name: "五三战神", score: 128, prof: "中学 student" }
]

export default function App() {
  const [profession, setProfession] = useState<Profession | null>(null)
  const [stats, setStats] = useState({ money: 0, mental: 0, competence: 0, slacking: 0, day: 1 })
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null)
  const [feedback, setFeedback] = useState<{ text: string; insight: string } | null>(null)
  const [isGameOver, setIsGameOver] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [phase, setPhase] = useState<'work' | 'night'>('work')

  const selectProfession = (p: Profession) => {
    setProfession(p)
    setStats({ ...p.initialStats, day: 1 })
    getNextEvent(p.id)
  }

  const getNextEvent = (profId: string) => {
    const allEvents = eventsData as Record<string, Event[]>
    const profEvents = allEvents[profId] || []
    const randomEvent = profEvents[Math.floor(Math.random() * profEvents.length)]
    setCurrentEvent(randomEvent)
  }

  const handleOption = (option: Option) => {
    const newStats = {
      money: stats.money + option.effect.money - 50,
      mental: Math.min(100, stats.mental + option.effect.mental - 5),
      competence: stats.competence + option.effect.competence,
      slacking: Math.min(100, stats.slacking + option.effect.slacking),
      day: stats.day
    }
    setStats(newStats)
    setFeedback({ text: option.reaction, insight: option.insight })
    if (newStats.money <= 0 || newStats.mental <= 0) setIsGameOver(true)
  }

  const handleActivity = (act: Activity) => {
    const newStats = {
      money: stats.money + act.effect.money,
      mental: Math.min(100, stats.mental + act.effect.mental),
      competence: stats.competence + act.effect.competence,
      slacking: Math.min(100, stats.slacking + act.effect.slacking),
      day: stats.day + 1
    }
    setStats(newStats)
    setFeedback({ text: act.reaction, insight: "【深夜感悟】夜晚的每一次消费，都是对白天的补偿。" })
    setPhase('work')
    if (newStats.money <= 0 || newStats.mental <= 0) setIsGameOver(true)
  }

  const closeFeedback = () => {
    setFeedback(null)
    if (isGameOver) return
    if (phase === 'work') {
      setPhase('night')
    } else {
      if (profession) getNextEvent(profession.id)
    }
  }

  if (!profession) {
    return (
      <div className="game-container selection-screen">
        <h1 className="title">职业挑战者</h1>
        <div className="main-tabs">
          <button className={`tab-btn ${!showLeaderboard ? 'active' : ''}`} onClick={() => setShowLeaderboard(false)}>角色选择</button>
          <button className={`tab-btn ${showLeaderboard ? 'active' : ''}`} onClick={() => setShowLeaderboard(true)}>全国榜单</button>
        </div>
        {!showLeaderboard ? (
          <div className="prof-list">
            {profData.professions.map((p: Profession) => (
              <div key={p.id} className="prof-card" onClick={() => selectProfession(p)}>
                <div className="prof-avatar">{p.avatar}</div>
                <div className="prof-info"><h3>{p.name}</h3><p>{p.description}</p></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="leaderboard-list">
            {MOCK_LEADERBOARD.map((item, i) => (
              <div key={i} className="leader-item">
                <span className="rank">#{i+1}</span>
                <div className="leader-info"><strong>{item.name}</strong><span>{item.prof}</span></div>
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
          <button className="restart-btn" onClick={() => window.location.reload()}>重新开始</button>
        </div>
      </div>
    )
  }

  return (
    <div className="game-container" style={{ backgroundColor: phase === 'night' ? '#1a202c' : '#fff', color: phase === 'night' ? '#fff' : '#000' }}>
      <div className="day-badge" style={{ backgroundColor: phase === 'night' ? '#4a5568' : '#000' }}>DAY {stats.day} - {phase === 'work' ? '搬砖中' : '赛博夜晚'}</div>
      
      <div className="status-bar" style={{ backgroundColor: phase === 'night' ? '#2d3748' : '#fff', border: phase === 'night' ? '2px solid #fff' : '2px solid #000' }}>
        <StatBar label="💰 存款" value={stats.money} max={5000} color="#ffdeeb" />
        <StatBar label="❤️ 精神" value={stats.mental} max={100} color="#ff6b6b" />
        <StatBar label="💼 能力" value={stats.competence} max={200} color="#4dabf7" />
        <StatBar label="🐟 摸鱼" value={stats.slacking} max={100} color="#51cf66" />
      </div>

      {phase === 'work' ? (
        currentEvent && (
          <div className="event-card" style={{ background: phase === 'night' ? '#2d3748' : '#fff' }}>
            <div className="event-header"><h2>{currentEvent.title}</h2></div>
            <p className="desc" style={{ color: phase === 'night' ? '#cbd5e0' : '#333' }}>{currentEvent.description}</p>
            <div className="options">
              {currentEvent.options.map((opt, i) => (
                <button key={i} className="opt-btn" onClick={() => handleOption(opt)}>{opt.text}</button>
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="night-screen">
          <h2 style={{ color: '#ecc94b' }}>🌙 深夜食堂 & 赛博消遣</h2>
          <p style={{ fontSize: '13px', marginBottom: '20px' }}>选择一种方式来度过漫漫长夜...</p>
          <div className="activities-list">
            {NIGHT_ACTIVITIES.map(act => (
              <button key={act.id} className="act-card" onClick={() => handleActivity(act)} disabled={stats.money < act.cost}>
                <div className="act-header">
                  <strong>{act.name}</strong>
                  <span>{act.cost} 元</span>
                </div>
                <p>{act.desc}</p>
              </button>
            ))}
          </div>
          <button className="skip-btn" onClick={() => { setPhase('work'); setStats({...stats, day: stats.day+1}); if (profession) getNextEvent(profession.id); }}>直接睡觉 (无事发生)</button>
        </div>
      )}

      {feedback && (
        <div className="modal-overlay">
          <div className="modal" style={{ color: '#000' }}>
            <h3>结果反馈</h3>
            <p>{feedback.text}</p>
            <div className="insight-box">
              <strong>💡 职业心得</strong>
              <p>{feedback.insight}</p>
            </div>
            <button className="next-day-btn" onClick={closeFeedback}>
              {phase === 'work' ? '进入夜晚' : '迎接明天'}
            </button>
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
      <div className="stat-bar-bg" style={{ border: '2px solid currentColor' }}>
        <div className="stat-fill" style={{ width: `${percentage}%`, backgroundColor: color }}></div>
      </div>
      <span style={{ fontSize: '10px' }}>{value}</span>
    </div>
  )
}
