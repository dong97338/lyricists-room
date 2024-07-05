'use client'
import {useRouter} from 'next/navigation'
import {useState} from 'react'

export default () => {
  const router = useRouter()
  const [topic, setTopic] = useState('')
  return (
    <div className="text-center min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-5xl font-bold mb-8">Lyricist's Room</h1>
      <input type="text" placeholder="WRITE YOUR TOPIC" className="w-80 p-3 mb-4 border rounded-md text-lg" value={topic} onChange={e => setTopic(e.target.value)} />
      <select className="w-80 p-3 mb-4 border rounded-md text-lg">
        <option>CHOOSE YOUR MUSIC 분위기</option>
        <option>그리움</option>
        <option>당당함</option>
        <option>불안함</option>
        <option>설렘</option>
        <option>슬픔</option>
        <option>신남</option>
        <option>외로움</option>
        <option>우울함</option>
        <option>평화로움</option>
        <option>화남</option>
        <option>희망찬</option>
        {/* 원하는 장르를 추가 */}
      </select>
      <button className="w-80 p-3 bg-gray-400 rounded-md text-lg" onClick={() => router.push(`graph?topic=${encodeURIComponent(topic)}`)}>
        start
      </button>
    </div>
  )
}
