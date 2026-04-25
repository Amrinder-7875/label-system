import { useState } from 'react'
import SectionLabel from './ui/SectionLabel'
import SectionTitle from './ui/SectionTitle'
import { applyStatusOverride } from '../utils/submissionStatusOverrides'

const FIELDS = [
  { id: 'artist', label: 'Artist Name', type: 'text', placeholder: 'Your artist name' },
  { id: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com' },
  { id: 'demo', label: 'Demo Link (SoundCloud)', type: 'url', placeholder: 'https://soundcloud.com/...' },
]

const inputClass =
  'w-full bg-[#141414] border border-[#2a2a2a] text-[#f0ede8] font-mono text-[13px] px-4 py-3 outline-none transition-colors duration-200 placeholder:text-[#2a2a2a] focus:border-[#e63329]'
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://label-system-d8af.onrender.com/api'
const statusLabelMap = {
  pending: 'Pending Review',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
}

export default function DemoForm() {
  const [formData, setFormData] = useState({
    artist: '',
    email: '',
    demo: '',
    message: '',
  })
  const [trackingId, setTrackingId] = useState('')
  const [copied, setCopied] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [trackingInput, setTrackingInput] = useState('')
  const [trackingResult, setTrackingResult] = useState(null)
  const [trackingError, setTrackingError] = useState('')
  const [trackingLoading, setTrackingLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')
    setSubmitting(true)

    try {
      const res = await fetch(`${API_BASE_URL}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistName: formData.artist,
          email: formData.email,
          demoUrl: formData.demo,
          message: formData.message,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setSubmitError(data.message || 'Could not submit demo.')
        return
      }

      setSubmitted(true)
      setTrackingId(data.submission.trackingId)
      setTrackingInput(data.submission.trackingId)
      setTrackingResult(applyStatusOverride(data.submission))
      setFormData({
        artist: '',
        email: '',
        demo: '',
        message: '',
      })
    } catch {
      setSubmitError('Cannot reach server. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleTrackSubmit(e) {
    e.preventDefault()
    setTrackingError('')
    setTrackingResult(null)
    setTrackingLoading(true)

    try {
      const normalizedTrackingId = trackingInput.trim().toUpperCase()
      const res = await fetch(`${API_BASE_URL}/submissions/track/${normalizedTrackingId}`)
      const data = await res.json()

      if (!res.ok) {
        setTrackingError(data.message || 'Tracking ID not found.')
        return
      }

      setTrackingResult(applyStatusOverride(data.submission))
    } catch {
      setTrackingError('Cannot reach server. Try again.')
    } finally {
      setTrackingLoading(false)
    }
  }

  async function handleCopyTrackingId() {
    if (!trackingId) return

    try {
      await navigator.clipboard.writeText(trackingId)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section id="contact" className="px-6 md:px-12 py-24 border-b border-[#2a2a2a] bg-[#0e0e0e]">
      {submitted && trackingId && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center px-6 bg-[rgba(0,0,0,0.72)] backdrop-blur-sm">
          <div className="w-full max-w-[520px] border border-[#2a2a2a] bg-[#0f0f0f] p-8 shadow-[0_0_0_1px_rgba(230,51,41,0.1)]">
            <SectionLabel>Submission Saved</SectionLabel>
            <h3 className="text-[#f0ede8] text-[42px] leading-[0.95]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              YOUR TRACKING
              <br />
              ID IS READY
            </h3>
            <div className="mt-6 border border-[#e63329] bg-[#141414] px-5 py-5">
              <p className="text-[10px] tracking-[0.18em] uppercase text-[#666] mb-3">Tracking ID</p>
              <p className="font-mono text-[24px] md:text-[28px] tracking-[0.22em] text-[#f0ede8] break-all">
                {trackingId}
              </p>
            </div>
            <p className="mt-4 text-[12px] leading-[1.8] text-[#9a9a9a]">
              Keep this ID safe. You can use it in the tracking panel below to check your demo status anytime.
            </p>
            <div className="mt-6 flex flex-col md:flex-row gap-3">
              <button
                type="button"
                onClick={handleCopyTrackingId}
                className="flex-1 border border-[#2a2a2a] bg-[#141414] text-[#f0ede8] text-[11px] tracking-[0.18em] uppercase py-4 hover:border-[#e63329] transition-colors duration-200"
              >
                {copied ? 'Copied ✓' : 'Copy Tracking ID'}
              </button>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="flex-1 bg-[#e63329] text-[#f0ede8] text-[11px] tracking-[0.18em] uppercase py-4 hover:opacity-90 transition-opacity duration-200"
              >
                Continue →
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-20 items-start">
        {/* Intro */}
        <div>
          <SectionLabel>Get Signed</SectionLabel>
          <SectionTitle>SUBMIT<br />YOUR<br />DEMO</SectionTitle>
          <p className="text-[#666] text-[13px] leading-[1.9] mt-6 max-w-[400px]">
            Got a track? We listen to everything. Send your demo and we&apos;ll evaluate it for quality,
            originality, and fit with our sound. We review every submission carefully.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-12">
        <form onSubmit={handleSubmit} noValidate>
          {FIELDS.map(({ id, label, type, placeholder }) => (
            <div key={id} className="mb-6">
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#666] mb-2">
                {label}
              </label>
              <input
                name={id}
                type={type}
                value={formData[id]}
                onChange={handleChange}
                placeholder={placeholder}
                className={inputClass}
                required={id !== 'demo'}
              />
            </div>
          ))}

          <div className="mb-6">
            <label className="block text-[10px] tracking-[0.2em] uppercase text-[#666] mb-2">
              Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us about yourself and your sound..."
              rows={4}
              className={`${inputClass} resize-y min-h-[100px]`}
            />
          </div>

          {submitError && (
            <div className="mb-6 border border-[#e63329] px-4 py-3 text-[10px] tracking-[0.14em] uppercase text-[#e63329]">
              {submitError}
            </div>
          )}

          {submitted && trackingId && (
            <div className="mb-6 border border-[#2a2a2a] bg-[#141414] px-4 py-4">
              <div className="flex items-center justify-between gap-4 mb-2">
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#666]">Tracking ID</p>
                <button
                  type="button"
                  onClick={handleCopyTrackingId}
                  className="text-[10px] tracking-[0.16em] uppercase text-[#e63329] hover:opacity-80 transition-opacity duration-200"
                >
                  {copied ? 'Copied ✓' : 'Copy ID'}
                </button>
              </div>
              <p className="font-mono text-[20px] tracking-[0.2em] text-[#f0ede8]">{trackingId}</p>
              <p className="text-[11px] text-[#888] mt-3 leading-[1.8]">
                Save this ID. You can track your demo status below at any time.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full text-[12px] tracking-[0.2em] uppercase py-4 mt-2 transition-all duration-200"
            style={{
              fontFamily: 'inherit',
              background: submitting ? '#1a1a1a' : '#e63329',
              color: submitting ? '#666' : '#f0ede8',
              border: submitting ? '1px solid #2a2a2a' : 'none',
              cursor: submitting ? 'default' : 'pointer',
              opacity: submitting ? 1 : undefined,
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Demo →'}
          </button>

          <p className="text-[10px] text-[#666] mt-3 tracking-[0.05em] italic">
            * We review every submission. Response time may vary.
          </p>
        </form>

        <div className="border border-[#2a2a2a] p-6 bg-[#101010]">
          <SectionLabel>Track Demo</SectionLabel>
          <h3 className="text-[#f0ede8] text-[28px] leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            TRACK YOUR SUBMISSION
          </h3>

          <form onSubmit={handleTrackSubmit} className="mt-6">
            <label className="block text-[10px] tracking-[0.2em] uppercase text-[#666] mb-2">
              Tracking ID
            </label>
            <input
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value.toUpperCase())}
              placeholder="XC-ABC123"
              className={inputClass}
              required
            />

            <button
              type="submit"
              disabled={trackingLoading}
              className="w-full text-[12px] tracking-[0.2em] uppercase py-4 mt-4 transition-all duration-200 bg-[#141414] border border-[#2a2a2a] text-[#f0ede8] hover:border-[#e63329]"
            >
              {trackingLoading ? 'Checking...' : 'Track Submission →'}
            </button>
          </form>

          {trackingError && (
            <div className="mt-4 border border-[#e63329] px-4 py-3 text-[10px] tracking-[0.14em] uppercase text-[#e63329]">
              {trackingError}
            </div>
          )}

          {trackingResult && (
            <div className="mt-5 border border-[#2a2a2a] bg-[#141414] p-4 space-y-3">
              <div>
                <p className="text-[9px] tracking-[0.18em] uppercase text-[#666] mb-1">Tracking ID</p>
                <p className="text-[#f0ede8] font-mono text-[15px]">{trackingResult.trackingId}</p>
              </div>
              <div>
                <p className="text-[9px] tracking-[0.18em] uppercase text-[#666] mb-1">Artist</p>
                <p className="text-[#f0ede8] font-mono text-[15px]">{trackingResult.artistName}</p>
              </div>
              <div>
                <p className="text-[9px] tracking-[0.18em] uppercase text-[#666] mb-1">Status</p>
                <p className="inline-flex items-center border border-[#e63329] px-3 py-2 text-[10px] tracking-[0.18em] uppercase text-[#e63329]">
                  {statusLabelMap[trackingResult.status] || trackingResult.status}
                </p>
              </div>
              <div>
                <p className="text-[9px] tracking-[0.18em] uppercase text-[#666] mb-1">Submitted</p>
                <p className="text-[#aaa] font-mono text-[13px]">
                  {new Date(trackingResult.submittedAt).toLocaleString()}
                </p>
              </div>
              {trackingResult.demoUrl && (
                <div>
                  <p className="text-[9px] tracking-[0.18em] uppercase text-[#666] mb-1">Demo Link</p>
                  <a
                    href={trackingResult.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#f0ede8] font-mono text-[13px] break-all hover:text-[#e63329] transition-colors duration-200"
                  >
                    {trackingResult.demoUrl}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    </section>
  )
}
