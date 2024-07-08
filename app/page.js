'use client'
import {useState} from 'react'
import Link from 'next/link'

export default () => {
  const [topic, setTopic] = useState('')
  const [key, setKey] = useState('')
  const [mood, setMood] = useState('')

  return (
    <>
      <h1 className="mb-8 text-5xl font-bold">Lyricist's Room</h1>
      <input type="text" placeholder="WRITE YOUR TOPIC" className="mb-4" value={topic} onChange={e => setTopic(e.target.value)} />
      <input type="text" placeholder="WRITE YOUR KEY MESSAGE" className="mb-4" value={key} onChange={e => setKey(e.target.value)} />
      <select value={mood} className="mb-4" onChange={e => setMood(e.target.value)}>
        <option>곡 분위기를 선택해주세요!</option>
        {['그리움', '당당함', '불안함', '설렘', '슬픔', '신남', '외로움', '우울함', '평화로움', '화남', '희망찬'].map(mood => (
          <option>{mood}</option>
        ))}
      </select>
      <Link className="w-80 rounded-md bg-gray-400 p-3 text-center text-lg" href={`graph?${new URLSearchParams({topic, key, mood}).toString()}`}>
        start
      </Link>
    </>
  )
}
