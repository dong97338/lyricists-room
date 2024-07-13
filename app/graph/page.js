'use client'
import dynamic from "next/dynamic";
import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import * as d3 from 'd3'
import OpenAI from 'openai'
import dotenv from 'dotenv'
dotenv.config()

function Graph() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [graph, setGraph] = useState({ nodes: [{ id: 1, name: searchParams.get('topic') || 'No topic', fx: 910, fy: 390 }], links: [] })
  const [sentence, setSentence] = useState('')
  const [loadingNode, setLoadingNode] = useState(null)
  const [chips, setChips] = useState([]) // 클릭한 단어들을 저장할 상태 변수
  const [history, setHistory] = useState([]) // 응답을 저장할 상태 변수
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const svgRef = useRef(null)
  const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY, dangerouslyAllowBrowser: true })

  useEffect(() => {
    // 처음 로드될 때 스크롤 방지 및 스타일 설정
    document.body.style.overflow = 'hidden';
    return () => {
      // 컴포넌트 언마운트 시 스타일 초기화
      document.body.style.overflow = 'auto';
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    if (!sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };

  const handleHomeClick = () => {
    router.push('/');
    console.log('Home button clicked');
  };

  const handleNodeClick = async (e, node) => {
    e.stopPropagation()
    setLoadingNode(node.id)
    const content = `""키워드"": ${node.name}\n""키메시지"": ${searchParams.get('key') || ''}\n*[최종 답변 형태] 외 답변 금지\n**[답변 금지 단어]: ${graph.nodes.map(node => node.name).join(', ')}`
    const json = await (await fetch(`${searchParams.get('mood')}.json`)).json() // 분위기 json 가져오기
    json.messages.push({ role: 'user', content })
    const response = await openai.chat.completions.create(json)
    const [keyword, relatedWords] = response.choices[0].message.content.match(/(?<=1개: ).+|(?<=6개: ).+/g).map(words => words.split(', '))
    const newNodes = [keyword, ...relatedWords].map((name, i) => ({ id: graph.nodes.length + i + 1, name, x: node.x + 50 * Math.cos(i / 2), y: node.y + 50 * Math.sin(i / 2) }))
    setGraph(prevGraph => ({ nodes: [...prevGraph.nodes, ...newNodes], links: [...prevGraph.links, ...newNodes.map(newNode => ({ source: node.id, target: newNode.id }))] }))
    setLoadingNode(null)
    setChips(prevChips => [...prevChips, node.name]) // 클릭한 단어를 Chips에 추가
  }

  const handleChipClick = (chip) => {
    setSentence(prevSentence => prevSentence ? `${prevSentence}, ${chip}` : chip)
  }

  const handleMakeClick = async () => {
    if (!sentence.trim()) {
      return; // 입력창에 아무것도 적혀있지 않으면 함수 종료
    }
    const mood = searchParams.get('mood')
    const json = await (await fetch(`${mood}make.json`)).json() // 분위기 json 가져오기
    json.messages.push({ role: 'user', content: sentence })
    const response = await openai.chat.completions.create(json)
    const answers = response.choices[0].message.content.split('\n') // 문장을 개별 문장으로 분리
  
    setHistory(prevHistory => [...prevHistory, { chips: sentence.split(',').map(word => word.trim()), answers }])
    setSentence('')
    alert(`Response: ${response.choices[0].message.content}`)
  }

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Add zoom functionality
    const containerGroup = svg.append('g')  // Add a group to apply zoom transformations

    const linkGroup = containerGroup.append('g').attr('class', 'links')
    const nodeGroup = containerGroup.append('g').attr('class', 'nodes')
    const simulation = d3
      .forceSimulation(graph.nodes)
      .force(
        'link',
        d3
          .forceLink(graph.links)
          .id(d => d.id)
          .distance(70)
          .strength(0.7) // 링크 강도를 낮춰서 노드가 덜 흔들리게 합니다.
      )
      .force('charge', d3.forceManyBody().strength(-30)) // 노드 간의 반발력을 줄입니다.
      .force('collision', d3.forceCollide().radius(40).strength(0.7)) // 충돌 강도를 조정하여 부드럽게 합니다.
      .alphaDecay(0.05) // 시뮬레이션의 알파 감소율을 높여 시뮬레이션이 더 빨리 안정되도록 합니다.
      .on('tick', () => {
        graph.nodes.forEach(d => {
          d.vx = 0
          d.vy = 0
        })
        linkGroup
          .selectAll('line')
          .data(graph.links)
          .join('line')
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y)
          .attr('stroke', '#999')
          .attr('stroke-width', 2)
        nodeGroup
          .selectAll('g')
          .data(graph.nodes)
          .join(enter => {
            const nodeEnter = enter
              .append('g')
              .attr('class', 'node')
              .on('click', (e, d) => handleNodeClick(e, d))
              .call(
                d3
                  .drag()
                  .on('start', (e, d) => {
                    if (!e.active) simulation.alphaTarget(0.3).restart()
                    d.fx = d.x
                    d.fy = d.y
                  })
                  .on('drag', (e, d) => {
                    d.fx = e.x
                    d.fy = e.y
                  })
                  .on('end', (e, d) => {
                    if (!e.active) simulation.alphaTarget(0)
                    if (d.id !== 1) {
                      d.fx = null
                      d.fy = null
                    }
                  })
              )
              .on('mouseenter', function (e, d) {
                d3.select(this).select('circle').attr('fill', '#ffa500') // Change the node color on hover
                svg.style('cursor', 'pointer') // Change cursor to pointer
              })
              .on('mouseleave', function (e, d) {
                d3.select(this).select('circle').attr('fill', '#d9d9d9') // Revert the node color
                svg.style('cursor', 'default') // Revert cursor to default
              })
            nodeEnter.append('circle').attr('r', 30).attr('fill', '#d9d9d9')
            nodeEnter
              .append('text')
              .attr('dy', 4)
              .attr('x', 0)
              .attr('font-size', 12)
              .attr('text-anchor', 'middle') // 텍스트를 가운데 정렬합니다.
              .text(d => d.name)
            nodeEnter.each(function (d) {
              if (loadingNode === d.id) {
                d3.select(this)
                  .append('svg')
                  .attr('x', -35)
                  .attr('y', -35)
                  .attr('width', 70)
                  .attr('height', 70)
                  .attr('viewBox', '0 0 200 200')
                  .html(
                    "<radialGradient id='a10' cx='.66' fx='.66' cy='.3125' fy='.3125' gradientTransform='scale(1.5)'><stop offset='0' stop-color='#000000'></stop><stop offset='.3' stop-color='#000000' stop-opacity='.9'></stop><stop offset='.6' stop-color='#000000' stop-opacity='.6'></stop><stop offset='.8' stop-color='#000000' stop-opacity='.3'></stop><stop offset='1' stop-color='#000000' stop-opacity='0'></stop></radialGradient><circle transform-origin='center' fill='none' stroke='url(#a10)' stroke-width='15' stroke-linecap='round' stroke-dasharray='200 1000' stroke-dashoffset='0' cx='100' cy='100' r='70'><animateTransform type='rotate' attributeName='transform' calcMode='spline' dur='2' values='360;0' keyTimes='0;1' keySplines='0 0 1 1' repeatCount='indefinite'></animateTransform></circle><circle transform-origin='center' fill='none' opacity='.2' stroke='#000000' stroke-width='15' stroke-linecap='round' cx='100' cy='100' r='70'></circle>"
                  )
              }
            })
            return nodeEnter
          })
          .attr('transform', d => `translate(${d.x},${d.y})`)
      })
    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 10]) // Limit the zoom scale
      .on('zoom', event => {
        containerGroup.attr('transform', event.transform)
      })
    svg.call(zoom)
    svg.on('click', () => {
      simulation.stop()
    })
    simulation.nodes(graph.nodes)
    simulation.force('link').links(graph.links)
    simulation.alpha(1).restart()
  }, [graph, loadingNode])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {sidebarOpen && (
        <div style={{ width: '500px', background: '#f0f0f0', padding: '20px', position: 'fixed', left: 0, top: 0, bottom: 0, overflowY: 'auto' }}>
          <button onClick={toggleSidebar} style={{ padding: '0px', fontSize: '16px', marginBottom: '10px', marginLeft: '35px' }}>
            Close
          </button>
          {history.map((entry, index) => (
            <div key={index} style={{ padding: '10px', margin: '5px'}}>
              <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '10px' }}>
                {entry.chips.map((chip, chipIndex) => (
                  <div key={chipIndex} style={{ padding: '5px 10px', margin: '5px', background: '#d9d9d9', borderRadius: '16px' }}>
                    {chip}
                  </div>
                ))}
              </div>
              <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}></div>
              {entry.answers.map((answer, answerIndex) => (
                <div key={answerIndex} style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                  {answer}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: sidebarOpen ? '500px' : '0', height: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '10px 20px', boxSizing: 'border-box', alignItems: 'center' }}>
          <button onClick={toggleSidebar} style={{ padding: '10px', fontSize: '16px' }}>
            {sidebarOpen ? 'Close' : 'History'}
          </button>
          <button onClick={handleHomeClick} style={{ padding: '10px', fontSize: '16px', marginRight: sidebarOpen ? '250px' : '0' }}>
            Home
          </button>
        </div>

        <svg ref={svgRef} width="1820" height="700" style={{ flex: '1' }}></svg>
        <div className="flex w-full items-center justify-center flex-col" style={{ marginTop: '0px', marginBottom: '0px' }}>
          <div className="flex w-full items-center justify-center flex-col" style={{ marginTop: '0px', marginBottom: '0px' }}>
            <div style={{ width: '100%', padding: '10px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {chips.map((chip, index) => (
                <div key={index} style={{ padding: '5px 10px', margin: '5px', background: '#d9d9d9', borderRadius: '16px', cursor: 'pointer' }} onClick={() => handleChipClick(chip)}>
                  {chip}
                </div>
              ))}
            </div>

            <div className="flex items-center" style={{ width: '100%', justifyContent: 'center', marginBottom: '30px' }}>
              <input
                type="text"
                placeholder="MAKE A SENTENCE USING THE CHOSEN WORD"
                value={sentence}
                onChange={e => setSentence(e.target.value)}
                style={{ width: '500px', height: '40px', padding: '0 10px', fontSize: '16px', boxSizing: 'border-box' }}
              />
              <button
                className="ml-4 rounded-md bg-gray-400 text-lg"
                style={{ height: '40px', padding: '0 20px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={handleMakeClick}
              >
                MAKE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default () => (
  <Suspense>
    <Graph />
  </Suspense>
)