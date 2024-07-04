'use client'
import {useEffect, useState, useRef, Suspense} from 'react'
import {useSearchParams} from 'next/navigation'
import * as d3 from 'd3'
import OpenAI from 'openai'
import dotenv from 'dotenv'
dotenv.config()

function Graph() {
  const searchParams = useSearchParams()
  const [graph, setGraph] = useState({nodes: [{id: 1, name: searchParams.get('topic') || 'No topic', fx: 480, fy: 300}], links: []})
  const [sentence, setSentence] = useState('')
  const svgRef = useRef(null)
  const openai = new OpenAI({apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY, dangerouslyAllowBrowser: true})

  const handleNodeClick = async node => {
    const content = `""키워드"": ${node.name}\n""키메시지"": ${searchParams.get('key') || ''}\n*[최종 답변 형태] 외 답변 금지\n**[답변 금지 단어]: ${graph.nodes.map(node => node.name).join(', ')}`
    const json = await (await fetch(`${searchParams.get('mood')}.json`)).json()
    json.messages.push({role: 'user', content})
    const response = await openai.chat.completions.create(json)
    const [keyword, relatedWords] = response.choices[0].message.content.match(/(?<=1개: ).+|(?<=6개: ).+/g).map(words => words.split(', '))
    const newNodes = [keyword, ...relatedWords].map((name, i) => ({id: graph.nodes.length + i + 1, name, x: node.x + 50 * Math.cos(i / 2), y: node.y + 50 * Math.sin(i / 2)}))
    setGraph(prevGraph => ({nodes: [...prevGraph.nodes, ...newNodes], links: [...prevGraph.links, ...newNodes.map(newNode => ({source: node.id, target: newNode.id}))]}))
  }

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    const linkGroup = svg.append('g').attr('class', 'links')
    const nodeGroup = svg.append('g').attr('class', 'nodes')
    const simulation = d3
      .forceSimulation(graph.nodes)
      .force(
        'link',
        d3
          .forceLink(graph.links)
          .id(d => d.id)
          .distance(50)
          .strength(1)
      )
      .force('charge', d3.forceManyBody().strength(-500))
      .force('collision', d3.forceCollide().radius(40))
      .on('tick', () => {
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
              .on('click', (e, d) => handleNodeClick(d))
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
            nodeEnter.append('circle').attr('r', 20).attr('fill', '#d9d9d9')
            nodeEnter
              .append('text')
              .attr('dy', 4)
              .attr('x', -10)
              .attr('font-size', 12)
              .text(d => d.name)
            return nodeEnter
          })
          .attr('transform', d => `translate(${d.x},${d.y})`)
      })
    simulation.nodes(graph.nodes)
    simulation.force('link').links(graph.links)
    simulation.alpha(1).restart()
  }, [graph])

  return (
    <div className="flex min-h-screen flex-col justify-between text-center">
      <svg ref={svgRef} width="960" height="600"></svg>
      <div className="mb-16 flex w-full items-center justify-center">
        <input
          type="text"
          placeholder="MAKE A SENTENCE USING THE CHOSEN WORD"
          className="w-128 rounded-md border p-3 text-lg"
          value={sentence}
          onChange={e => setSentence(e.target.value)}
        />
        <button className="ml-4 rounded-md bg-gray-400 p-3 text-lg" onClick={() => alert(`Sentence: ${sentence}`)}>
          MAKE
        </button>
      </div>
    </div>
  )
}

export default () => (
  <Suspense>
    <Graph />
  </Suspense>
)
