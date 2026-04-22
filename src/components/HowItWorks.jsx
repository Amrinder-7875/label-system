import { useState } from 'react'
import SectionLabel from './ui/SectionLabel'
import SectionTitle from './ui/SectionTitle'

const STEPS = [
  {
    num: '01',
    title: 'Submit',
    desc: 'Artists submit their tracks through our platform for review. Include a SoundCloud link and brief artist info.',
  },
  {
    num: '02',
    title: 'Evaluate',
    desc: 'Our team evaluates each submission based on quality, originality, and alignment with our sound direction.',
  },
  {
    num: '03',
    title: 'Release',
    desc: 'Selected tracks are scheduled and released through the label with full distribution and promotion support.',
  },
]

function StepCard({ num, title, desc }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="bg-[#141414] px-8 py-10"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="text-[64px] leading-none mb-6 transition-colors duration-300"
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          color: hovered ? '#7a1a15' : '#2a2a2a',
        }}
      >
        {num}
      </div>
      <div
        className="text-[22px] tracking-[0.05em] text-[#f0ede8] mb-3"
        style={{ fontFamily: "'Anton', sans-serif" }}
      >
        {title}
      </div>
      <p className="text-[13px] text-[#666] leading-[1.8]">{desc}</p>
    </div>
  )
}

export default function HowItWorks() {
  return (
    <section id="how" className="px-6 md:px-12 py-24 border-b border-[#2a2a2a]">
      <SectionLabel>Process</SectionLabel>
      <SectionTitle>HOW IT<br />WORKS</SectionTitle>

      <div
        className="grid md:grid-cols-3 mt-14 border border-[#2a2a2a]"
        style={{ gap: '1px', background: '#2a2a2a' }}
      >
        {STEPS.map((step) => (
          <StepCard key={step.num} {...step} />
        ))}
      </div>
    </section>
  )
}
