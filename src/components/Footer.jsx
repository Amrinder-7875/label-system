const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Artists', href: '#artists' },
  { label: 'Releases', href: '#releases' },
  { label: 'Contact', href: '#contact' },
]

const RIGHT_LINKS = [
  { label: 'info@xcile.media', href: 'mailto:info@xcile.media' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Accessibility Statement', href: '#' },
]

export default function Footer() {
  return (
    <footer className="px-6 md:px-12 py-12 grid md:grid-cols-3 items-center gap-10 bg-[#0e0e0e]">
      {/* Brand */}
      <div>
        <div
          className="text-[32px] tracking-[0.1em] text-[#f0ede8]"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          XCILE<span className="text-[#e63329]">.</span>MEDIA
        </div>
        <div className="text-[10px] tracking-[0.2em] uppercase text-[#666] mt-1.5">
          Where Music Meets Art
        </div>
        <div className="text-[10px] tracking-[0.1em] text-[#2a2a2a] mt-5">
          © 2025 Xcile Media. All rights reserved.
        </div>
      </div>

      {/* Nav links */}
      <div className="flex flex-col gap-3">
        {NAV_LINKS.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            className="text-[11px] tracking-[0.15em] uppercase text-[#666] hover:text-[#f0ede8] transition-colors duration-200"
          >
            {label}
          </a>
        ))}
      </div>

      {/* Right links */}
      <div className="md:text-right">
        {RIGHT_LINKS.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            className="block text-[13px] text-[#666] hover:text-[#f0ede8] transition-colors duration-200 mb-1.5"
          >
            {label}
          </a>
        ))}
      </div>
    </footer>
  )
}
