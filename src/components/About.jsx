import SectionLabel from './ui/SectionLabel'
import SectionTitle from './ui/SectionTitle'

export default function About() {
  return (
    <section id="about" className="px-6 md:px-12 py-24 border-b border-[#2a2a2a]">
      <div className="grid md:grid-cols-2 gap-20 items-center">
        {/* Text */}
        <div>
          <SectionLabel>About Us</SectionLabel>
          <SectionTitle>OUR<br />MISSION</SectionTitle>
          <p className="text-[14px] text-[#888] leading-[1.9] max-w-[440px]">
            Xcile Media is an independent music label focused on discovering and supporting emerging artists.
            We provide a structured platform for demo submission, artist evaluation, and music release.
          </p>
          <p className="text-[14px] text-[#888] leading-[1.9] max-w-[440px] mt-5">
            We don&apos;t chase trends. We set them. Our focus is raw, aggressive energy and dark underground
            sound — artists who redefine what funk and phonk can be.
          </p>
        </div>

        {/* Visual box */}
        <div className="relative">
          <div
            className="border border-[#2a2a2a] p-10 bg-[#141414] relative"
          >
            {/* Floating label */}
            <span
              className="absolute top-0 left-5 -translate-y-1/2 bg-[#141414] px-2 text-[10px] tracking-[0.2em] text-[#e63329]"
            >
              // MISSION
            </span>
            <p
              className="text-[22px] leading-[1.3] tracking-[0.03em] text-[#f0ede8]"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              We bring raw, aggressive energy and dark underground sound to the forefront — pushing artists who redefine the genre.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
