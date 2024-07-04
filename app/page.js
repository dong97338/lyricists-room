'use client'
import {useRouter} from 'next/navigation'
import {useState} from 'react'

export default () => {
  const router = useRouter()
  const [topic, setTopic] = useState('')
  const [key, setKey] = useState('')
  const [mood, setMood] = useState('')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <h1 className="mb-8 text-5xl font-bold">Lyricist's Room</h1>
      <input type="text" placeholder="WRITE YOUR TOPIC" className="mb-4 w-80 rounded-md border p-3 text-lg" value={topic} onChange={e => setTopic(e.target.value)} />
      <input type="text" placeholder="WRITE YOUR KEY MESSAGE" className="mb-4 w-80 rounded-md border p-3 text-lg" value={key} onChange={e => setKey(e.target.value)} />
      <select className="mb-4 w-80 rounded-md border p-3 text-lg" value={mood} onChange={e => setMood(e.target.value)}>
        <option>곡 분위기를 선택해주세요!</option>
        <option>그리움</option>
        <option>설렘</option>
      </select>
      <button className="w-80 rounded-md bg-gray-400 p-3 text-lg" onClick={() => router.push(`graph?topic=${encodeURIComponent(topic)}&key=${encodeURIComponent(key)}&mood=${encodeURIComponent(mood)}`)}>
        start
      </button>
    </div>
  )
}
