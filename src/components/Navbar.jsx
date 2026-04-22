import { Link } from "react-router-dom";

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Artists', href: '#artists' },
  { label: 'Releases', href: '#releases' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-12 py-5 border-b border-[#2a2a2a] bg-[rgba(8,8,8,0.92)] backdrop-blur-md">
      <div
        className="text-[26px] tracking-[0.15em]"
        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
      >
        XCILE<span className="text-[#e63329]">.</span>MEDIA
      </div>

      <ul className="hidden md:flex gap-10 list-none text-[11px] tracking-[0.2em] uppercase">
        {NAV_LINKS.map(({ label, href }) => (
          <li key={label}>
            <a
              href={href}
              className="text-[#666] hover:text-[#f0ede8] transition-colors duration-200"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-4">
        <Link
          to="/login"
          className="text-[11px] tracking-[0.15em] uppercase text-[#666] hover:text-[#f0ede8] transition-colors duration-200"
        >
          Login
        </Link>
        <a
          href="#contact"
          className="text-[11px] tracking-[0.15em] uppercase px-6 py-[10px] border border-[#e63329] text-[#e63329] bg-transparent hover:bg-[#e63329] hover:text-[#f0ede8] transition-all duration-200"
        >
          Submit Demo
        </a>
      </div>
    </nav>
  )
}
