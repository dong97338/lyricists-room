'use client'
import {useRouter} from 'next/navigation'
import {useState} from 'react'

export default () => {
  const router = useRouter()
  const [topic, setTopic] = useState('')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <h1 className="mb-8 text-5xl font-bold">Lyricist's Room</h1>
      <input type="text" placeholder="WRITE YOUR TOPIC" className="mb-4 w-80 rounded-md border p-3 text-lg" value={topic} onChange={e => setTopic(e.target.value)} />
      <select className="mb-4 w-80 rounded-md border p-3 text-lg">
        <option>CHOOSE YOUR MUSIC GENRE</option>
        <option>발라드</option>
        <option>인디뮤직</option>
        {/* 원하는 장르를 추가 */}
      </select>
      <button className="w-80 rounded-md bg-gray-400 p-3 text-lg" onClick={() => router.push(`graph?topic=${encodeURIComponent(topic)}`)}>
        start
      </button>
    </div>
  )
}
