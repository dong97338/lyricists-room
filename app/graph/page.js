'use client'
import React, {useEffect, useState, useRef, Suspense} from 'react'
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

  const generateResponse = async nodeName => {
    const prompt = `"${nodeName}"와 관련된 단어 3개를 쉼표로 나눠서 제시해줘. 예) 단어1,단어2,단어3`
    const response = await openai.chat.completions.create({model: 'gpt-3.5-turbo-0125', messages: [{role: 'user', content: prompt}], temperature: 0})
    return response.choices[0].message.content.split(',')
  }

  const handleNodeClick = async node => {
    const angleStep = (2 * Math.PI) / 3
    const childNodeNames = await generateResponse(node.name)
    const newNodes = childNodeNames.map((childName, i) => ({
      id: graph.nodes.length + i + 1,
      name: childName.trim(),
      x: node.x + 50 * Math.cos(i * angleStep),
      y: node.y + 50 * Math.sin(i * angleStep)
    }))
    const newLinks = newNodes.map(newNode => ({source: node.id, target: newNode.id}))
    setGraph(prevGraph => ({nodes: [...prevGraph.nodes, ...newNodes], links: [...prevGraph.links, ...newLinks]}))
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
    <div className="text-center flex flex-col justify-between min-h-screen">
      <svg ref={svgRef} width="960" height="600"></svg>
      <div className="mb-16 flex items-center justify-center w-full">
        <input
          type="text"
          placeholder="MAKE A SENTENCE USING THE CHOSEN WORD"
          className="w-128 p-3 border rounded-md text-lg"
          value={sentence}
          onChange={e => setSentence(e.target.value)}
        />
        <button className="ml-4 p-3 bg-gray-400 rounded-md text-lg" onClick={() => alert(`Sentence: ${sentence}`)}>
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
