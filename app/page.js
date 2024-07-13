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
        type="text"
        placeholder="키워드를 입력해주세요.. 한 단어일수록 좋아요!"
        value={topic}
        onChange={e => setTopic(e.target.value)}
        style={{ width: '450px', padding: '10px'}} // 스타일 추가
      />
      <input
        type="text"
        placeholder="키메시지를 입력해주세요!"
        value={key}
        onChange={e => setKey(e.target.value)}
        style={{ width: '450px', padding: '10px'}} // 스타일 추가
      />
      <select
        value={mood}
        onChange={e => setMood(e.target.value)}
        style={{ width: '450px', padding: '10px'}} // 스타일 추가
      >
        <option>가사 분위기를 선택해주세요!</option>
        {['그리움', '당당함', '불안함', '설렘', '슬픔', '신남', '외로움', '우울함', '평화로움', '화남', '희망찬'].map(mood => (
          <option key={mood}>{mood}</option>
        ))}
      </select>
      
      <Link
        
        href={`graph?${new URLSearchParams({topic, key, mood}).toString()}`}
        className="rounded-md bg-gray-400 text-center text-xl"
        style={{ display: 'inline-block', width: '200px', padding: '10px'}} // 스타일 추가
      >
        start
      </Link>
    </>
  )
}