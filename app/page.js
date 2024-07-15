'use client'
import {useState} from 'react'
import Link from 'next/link'

export default () => {
  const [topic, setTopic] = useState('')
  const [key, setKey] = useState('')
  const [mood, setMood] = useState('')

  return (
    <>
      <h1 className="mb-4 text-5xl font-bold">Lyricist's Room</h1>
      <input 
        placeholder="키워드를 입력해주세요.. 한 단어일수록 좋아요!" value={topic} onChange={e => setTopic(e.target.value)}
        className="w-full md:w-[450px] h-14 p-4 text-lg border rounded-lg"
      />
      <input
        placeholder="키메시지를 입력해주세요!" value={key} onChange={e => setKey(e.target.value)}
        className="w-full md:w-[450px] h-14 p-4 text-lg border rounded-lg"
      />
      <select value={mood} onChange={e => setMood(e.target.value)}
        className="w-full md:w-[450px] h-14 p-4 text-lg border rounded-lg"
        >
        <option>가사 분위기를 선택해주세요!</option>
        {['그리움', '당당함', '불안함', '설렘', '슬픔', '신남', '외로움', '우울함', '평화로움', '화남', '희망찬'].map(mood => (
          <option key={mood}>{mood}</option>
        ))}
      </select>
      <Link className="w-[200px] rounded-md bg-gray-400 p-2.5 text-center text-xl" href={`graph?${new URLSearchParams({topic, key, mood}).toString()}`}>
        start
      </Link>
    </>
  )
}
