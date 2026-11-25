import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  ArrowRight, ArrowUp, Brain, Check, Clock, Globe, Link, List, Minus, Plus,
  ShieldCheck, Users, X,
} from '@phosphor-icons/react'
import { detectLang, useDict, type Lang } from './i18n.ts'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CURVE = 'cubic-bezier(0.22,1,0.36,1)'

/* ---------- Reveal on scroll, once only ---------- */
function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { el.classList.add('is-visible'); io.disconnect() }
        })
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>
}

/* ---------- Tagline word ---------- */
function TagWord({ word }: { word: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-on'); return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { el.classList.add('is-on'); io.disconnect() }
        })
      },
      { threshold: 0.6, rootMargin: '0px 0px -20% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <span ref={ref} className="tagline-word">{word} </span>
}

/* ---------- Dialog ---------- */
function Dialog({ open, onClose, title, children, label }: { open: boolean; onClose: () => void; title: string; children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    ref.current?.querySelector<HTMLElement>('input, button')?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation" onClick={onClose}>
      <div className="absolute inset-0 bg-black opacity-80" aria-hidden="true" />
      <div ref={ref} role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-[#313131] bg-[#1F1F1F] p-6 sm:p-8 ease-base duration-500"
        style={{ transitionTimingFunction: CURVE }}>
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-2xl font-semibold">{title}</h3>
          <button type="button" onClick={onClose} aria-label={label}
            className="rounded-lg p-2 text-[#9B9B9B] transition-colors duration-300 hover:bg-[#272727] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-[0.98]">
            <X size={20} weight="bold" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

const benefitIcons: Record<string, typeof Clock> = { Clock, Link, ShieldCheck, Users }

const btnPrimary = 'inline-flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-base font-semibold text-black transition-all duration-300 hover:bg-[#E5E5E5] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.98]'
const btnSecondary = 'inline-flex items-center justify-center gap-2 rounded-xl border border-[#313131] bg-[#1F1F1F] px-3 py-2 text-base font-semibold text-white transition-all duration-300 hover:bg-[#272727] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.98]'
const inputCls = 'w-full rounded-xl border border-[#313131] bg-[#181818] px-3 py-2 text-base text-white placeholder:text-[#9B9B9B] transition-colors duration-300 focus:border-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white'

export default function App() {
  const [lang, setLang] = useState<Lang>(() => detectLang())
  const { t, dict } = useDict(lang)
  const isAr = lang === 'ar'
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState('features')
  const [demoOpen, setDemoOpen] = useState(false)
  const [legal, setLegal] = useState<null | 'privacy' | 'terms'>(null)

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = isAr ? 'rtl' : 'ltr'
    document.title = t('meta.title')
    try { localStorage.setItem('flowmind-lang', lang) } catch { /* ignore */ }
  }, [lang, isAr, t])

  const switchLang = () => setLang(isAr ? 'en' : 'ar')

  const navLinks = [
    { id: 'features', label: t('nav.features') },
    { id: 'how', label: t('nav.how') },
    { id: 'pricing', label: t('nav.pricing') },
    { id: 'faq', label: t('nav.faq') },
  ]
  const goTo = (id: string) => {
    setActive(id); setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }
  const goSignup = () => {
    setMenuOpen(false)
    document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })
    setTimeout(() => document.getElementById('trial-email')?.focus(), 600)
  }

  /* --- Hero trial form --- */
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [emailSaved, setEmailSaved] = useState<string | null>(() => {
    try { return localStorage.getItem('flowmind-trial-email') } catch { return null }
  })
  const submitTrial = (e: FormEvent) => {
    e.preventDefault()
    const v = email.trim()
    if (!v) { setEmailError(t('hero.emailErrorRequired')); return }
    if (!EMAIL_RE.test(v)) { setEmailError(t('hero.emailErrorInvalid')); return }
    setEmailError('')
    try { localStorage.setItem('flowmind-trial-email', v) } catch { /* ignore */ }
    setEmailSaved(v)
  }

  /* --- Demo dialog form --- */
  const [demoName, setDemoName] = useState('')
  const [demoEmail, setDemoEmail] = useState('')
  const [demoNameErr, setDemoNameErr] = useState('')
  const [demoEmailErr, setDemoEmailErr] = useState('')
  const [demoDone, setDemoDone] = useState(false)
  const submitDemo = (e: FormEvent) => {
    e.preventDefault()
    let ok = true
    if (!demoName.trim()) { setDemoNameErr(t('demoDialog.nameError')); ok = false } else setDemoNameErr('')
    if (!demoEmail.trim()) { setDemoEmailErr(t('demoDialog.emailErrorRequired')); ok = false }
    else if (!EMAIL_RE.test(demoEmail.trim())) { setDemoEmailErr(t('demoDialog.emailErrorInvalid')); ok = false }
    else setDemoEmailErr('')
    if (!ok) return
    try { localStorage.setItem('flowmind-demo-request', JSON.stringify({ name: demoName.trim(), email: demoEmail.trim() })) } catch { /* ignore */ }
    setDemoDone(true)
  }
  const closeDemo = () => { setDemoOpen(false); setDemoDone(false); setDemoName(''); setDemoEmail('') }

  /* --- FAQ --- */
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const taglineWords = t('tagline').split(' ')

  return (
    <div className="min-h-screen bg-black text-white">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-white focus:px-3 focus:py-2 focus:text-base focus:font-semibold focus:text-black">
        {t('skip')}
      </a>

      {/* ---------- Nav ---------- */}
      <header className="fixed inset-x-0 top-4 z-40 flex justify-center px-4">
        <nav aria-label="Main" className="flex w-full max-w-5xl items-center justify-between gap-2 rounded-2xl border border-[#313131] bg-black/80 px-4 py-2 backdrop-blur-xl">
          <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="flex items-center gap-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Flowmind">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black"><Brain size={20} weight="fill" /></span>
            <span className="text-lg font-bold">Flowmind</span>
          </a>
          <div className="hidden items-center gap-2 md:flex">
            {navLinks.map((l) => (
              <button key={l.id} type="button" onClick={() => goTo(l.id)} aria-current={active === l.id ? 'true' : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-[0.98] ${active === l.id ? 'bg-[#272727] text-white' : 'text-[#9B9B9B] hover:bg-[#1F1F1F] hover:text-white'}`}>
                {l.label}{active === l.id && <span className="sr-only"> ({t('nav.current')})</span>}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={switchLang} aria-label={t('nav.language')}
              className="inline-flex items-center gap-2 rounded-xl border border-[#313131] bg-[#1F1F1F] px-3 py-2 text-sm font-semibold transition-colors duration-300 hover:bg-[#272727] focus:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-[0.98]">
              <Globe size={16} /><span>{isAr ? 'English' : 'العربية'}</span>
            </button>
            <button type="button" onClick={goSignup} className="hidden rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black transition-colors duration-300 hover:bg-[#E5E5E5] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.98] sm:inline-flex">
              {t('nav.cta')}
            </button>
            <button type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? t('nav.close') : t('nav.menu')}
              className="rounded-xl border border-[#313131] bg-[#1F1F1F] p-2 transition-colors duration-300 hover:bg-[#272727] focus:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-[0.98] md:hidden">
              {menuOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 bg-black/95 pt-24 backdrop-blur-xl md:hidden" role="dialog" aria-label={t('nav.menu')}>
          <div className="flex flex-col gap-2 px-4">
            {navLinks.map((l, i) => (
              <button key={l.id} type="button" onClick={() => goTo(l.id)} style={{ animationDelay: `${Math.min(i * 60, 400)}ms` }}
                className="menu-item rounded-xl bg-[#181818] px-4 py-4 text-start text-xl font-semibold transition-colors duration-300 hover:bg-[#272727] focus:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-[0.98]">
                {l.label}
              </button>
            ))}
            <button type="button" onClick={goSignup} style={{ animationDelay: `${Math.min(4 * 60, 400)}ms` }}
              className="menu-item mt-4 rounded-xl bg-white px-4 py-4 text-center text-base font-semibold text-black transition-colors duration-300 hover:bg-[#E5E5E5] focus:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-[0.98]">
              {t('nav.cta')}
            </button>
          </div>
        </div>
      )}

      <main id="main">
        {/* ---------- Hero ---------- */}
        <section id="top" className="px-4 pt-32 pb-16 sm:pt-40">
          <div className="mx-auto max-w-5xl text-center">
            <Reveal>
              <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#313131] bg-[#181818] px-3 py-2 text-xs font-medium text-[#9B9B9B]">
                <span className="h-2 w-2 rounded-full bg-white" aria-hidden="true" />{t('hero.badge')}
              </p>
              <h1 className="hero-gradient mx-auto mt-6 max-w-[680px] text-5xl font-semibold leading-none sm:text-6xl">{t('hero.title')}</h1>
              <p className="mx-auto mt-6 max-w-[680px] text-lg text-[#9B9B9B]">{t('hero.subtitle')}</p>
            </Reveal>

            <Reveal className="mt-8">
              <form id="signup" onSubmit={submitTrial} noValidate className="mx-auto flex max-w-[680px] flex-col gap-2 sm:flex-row">
                <label htmlFor="trial-email" className="sr-only">{t('hero.emailLabel')}</label>
                <input id="trial-email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
                  placeholder={t('hero.emailPlaceholder')} aria-invalid={!!emailError} aria-describedby={emailError ? 'trial-error' : undefined}
                  className={inputCls} />
                <button type="submit" className={`${btnPrimary} shrink-0`}>
                  {t('hero.ctaPrimary')}<ArrowRight size={18} weight="bold" />
                </button>
              </form>
              {emailError && <p id="trial-error" role="alert" className="mt-2 text-sm font-medium text-[#FF9B9B]">{emailError}</p>}
              {emailSaved && !emailError && (
                <p role="status" className="mt-2 flex items-center justify-center gap-2 text-sm font-medium text-white">
                  <Check size={16} weight="bold" />{t('hero.emailSuccess')} <span className="text-[#9B9B9B]">{t('hero.emailSaved')}: {emailSaved}</span>
                </p>
              )}
              <p className="mt-2 text-sm text-[#9B9B9B]">{t('hero.trialNote')}</p>
              <button type="button" onClick={() => setDemoOpen(true)} className={`${btnSecondary} mt-4`}>
                {t('hero.ctaSecondary')}
              </button>
              <p className="mt-8 text-sm text-[#9B9B9B]">{t('hero.proof')}</p>
            </Reveal>

            {/* Dashboard mockup */}
            <Reveal className="mt-12">
              <div className="mx-auto max-w-4xl rounded-2xl border border-[#313131] bg-[#181818] p-4 text-start sm:p-6" aria-label={t('dashboard.label')}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black"><Brain size={18} weight="fill" /></span>
                    <p className="text-base font-semibold">{t('dashboard.title')}</p>
                  </div>
                  <span className="rounded-full border border-[#313131] bg-[#1F1F1F] px-3 py-2 text-xs font-medium text-[#9B9B9B]">{t('dashboard.label')}</span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[#313131] bg-[#1F1F1F] p-4">
                    <p className="text-sm text-[#9B9B9B]">{t('dashboard.active')}</p>
                    <p className="mt-2 text-3xl font-semibold">{t('dashboard.activeValue')}</p>
                  </div>
                  <div className="rounded-xl border border-[#313131] bg-[#1F1F1F] p-4">
                    <p className="text-sm text-[#9B9B9B]">{t('dashboard.saved')}</p>
                    <p className="mt-2 text-3xl font-semibold">{t('dashboard.savedValue')}</p>
                    <p className="mt-2 text-xs text-[#9B9B9B]">{t('dashboard.savedNote')}</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2">
                  {dict.dashboard.flows.map((f) => (
                    <li key={f.name} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#313131] bg-[#1F1F1F] px-4 py-3">
                      <div>
                        <p className="text-base font-medium">{f.name}</p>
                        <p className="text-sm text-[#9B9B9B]">{f.detail}</p>
                      </div>
                      <span className={`rounded-full px-3 py-2 text-xs font-semibold ${f.status === 'Done' || f.status === 'تم' ? 'bg-[#272727] text-white' : 'bg-white text-black'}`}>
                        {f.status === 'Done' ? t('dashboard.done') : f.status === 'Running' ? t('dashboard.running') : f.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- Benefits ---------- */}
        <section id="features" className="scroll-mt-24 px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <p className="text-sm font-semibold text-[#9B9B9B]">{t('benefits.eyebrow')}</p>
              <h2 className="mt-4 max-w-[680px] text-4xl font-semibold sm:text-5xl">{t('benefits.title')}</h2>
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {dict.benefits.items.map((b) => {
                const Icon = benefitIcons[b.icon] ?? Clock
                return (
                  <Reveal key={b.title}>
                    <article className="h-full rounded-2xl border border-[#313131] bg-[#181818] p-6 transition-colors duration-300 hover:bg-[#1F1F1F]">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black"><Icon size={24} /></span>
                      <h3 className="mt-4 text-xl font-semibold">{b.title}</h3>
                      <p className="mt-2 text-base text-[#9B9B9B]">{b.text}</p>
                    </article>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        {/* ---------- How it works ---------- */}
        <section id="how" className="scroll-mt-24 bg-[#181818] px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <p className="text-sm font-semibold text-[#9B9B9B]">{t('how.eyebrow')}</p>
              <h2 className="mt-4 max-w-[680px] text-4xl font-semibold sm:text-5xl">{t('how.title')}</h2>
            </Reveal>
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {dict.how.steps.map((s, i) => (
                <Reveal key={s.title}>
                  <li className="h-full rounded-2xl border border-[#313131] bg-[#1F1F1F] p-6">
                    <p className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl font-bold text-black">{i + 1}</p>
                    <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
                    <p className="mt-2 text-base text-[#9B9B9B]">{s.text}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Tagline reveal ---------- */}
        <section aria-label={t('tagline')} className="px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-[680px]">
            <p className="text-4xl font-semibold leading-tight sm:text-5xl">
              {taglineWords.map((w, i) => <TagWord key={`${w}-${i}`} word={w} />)}
            </p>
          </div>
        </section>

        {/* ---------- Proof ---------- */}
        <section id="proof" className="scroll-mt-24 bg-[#181818] px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <p className="text-sm font-semibold text-[#9B9B9B]">{t('proof.eyebrow')}</p>
              <h2 className="mt-4 max-w-[680px] text-4xl font-semibold sm:text-5xl">{t('proof.title')}</h2>
              <figure className="mt-8 max-w-3xl rounded-2xl border border-[#313131] bg-[#1F1F1F] p-6 sm:p-8">
                <p className="mb-4 inline-block rounded-full bg-[#272727] px-3 py-2 text-xs font-medium text-[#9B9B9B]">{t('proof.label')}</p>
                <blockquote className="text-2xl font-medium leading-snug">“{t('proof.quote')}”</blockquote>
                <figcaption className="mt-6">
                  <p className="text-base font-semibold">{t('proof.name')}</p>
                  <p className="text-sm text-[#9B9B9B]">{t('proof.role')}</p>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </section>

        {/* ---------- Pricing ---------- */}
        <section id="pricing" className="scroll-mt-24 px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <p className="text-sm font-semibold text-[#9B9B9B]">{t('pricing.eyebrow')}</p>
              <h2 className="mt-4 max-w-[680px] text-4xl font-semibold sm:text-5xl">{t('pricing.title')}</h2>
              <p className="mt-4 text-base text-[#9B9B9B]">{t('pricing.note')}</p>
            </Reveal>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {dict.pricing.tiers.map((tier) => (
                <Reveal key={tier.name}>
                  <article className={`flex h-full flex-col rounded-2xl border p-6 ${tier.featured ? 'border-white bg-[#1F1F1F]' : 'border-[#313131] bg-[#181818]'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xl font-semibold">{tier.name}</h3>
                      {tier.featured && <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-black">{t('pricing.featuredBadge')}</span>}
                    </div>
                    <p className="mt-2 text-base text-[#9B9B9B]">{tier.desc}</p>
                    <p className="mt-6"><span className="text-4xl font-semibold">{tier.price}</span> <span className="text-sm text-[#9B9B9B]">{tier.period}</span></p>
                    <ul className="mt-6 flex-1 space-y-2">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-base"><Check size={18} weight="bold" className="mt-1 shrink-0" />{f}</li>
                      ))}
                    </ul>
                    <button type="button" onClick={goSignup} className={`${tier.featured ? btnPrimary : btnSecondary} mt-8 w-full`}>{tier.cta}</button>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section id="faq" className="scroll-mt-24 bg-[#181818] px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <p className="text-sm font-semibold text-[#9B9B9B]">{t('faq.eyebrow')}</p>
              <h2 className="mt-4 text-4xl font-semibold sm:text-5xl">{t('faq.title')}</h2>
            </Reveal>
            <div className="mt-8 space-y-2">
              {dict.faq.items.map((item, i) => {
                const open = openFaq === i
                return (
                  <Reveal key={item.q}>
                    <div className="overflow-hidden rounded-2xl border border-[#313131] bg-[#1F1F1F]">
                      <h3>
                        <button type="button" onClick={() => setOpenFaq(open ? null : i)} aria-expanded={open} aria-controls={`faq-panel-${i}`}
                          className="flex w-full items-center justify-between gap-4 px-4 py-4 text-start text-lg font-semibold transition-colors duration-300 hover:bg-[#272727] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white active:scale-[0.98]">
                          <span>{item.q}</span>
                          {open ? <Minus size={20} weight="bold" className="shrink-0" /> : <Plus size={20} weight="bold" className="shrink-0" />}
                        </button>
                      </h3>
                      {open && <p id={`faq-panel-${i}`} className="px-4 pb-4 text-base text-[#9B9B9B]">{item.a}</p>}
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        {/* ---------- Final CTA ---------- */}
        <section className="px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <div className="rounded-2xl border border-[#313131] bg-[#181818] p-8 text-center sm:p-12">
                <h2 className="mx-auto max-w-[680px] text-4xl font-semibold sm:text-5xl">{t('finalCta.title')}</h2>
                <p className="mx-auto mt-4 max-w-[680px] text-lg text-[#9B9B9B]">{t('finalCta.text')}</p>
                <button type="button" onClick={goSignup} className={`${btnPrimary} mt-8`}>{t('finalCta.cta')}<ArrowRight size={18} weight="bold" /></button>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-[#313131] bg-[#181818] px-4 py-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-lg font-bold"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black"><Brain size={20} weight="fill" /></span>Flowmind</p>
            <p className="mt-4 max-w-xs text-base text-[#9B9B9B]">{t('footer.tagline')}</p>
          </div>
          <nav aria-label="Footer" className="flex gap-12">
            <div>
              <p className="text-sm font-semibold">{t('footer.product')}</p>
              <ul className="mt-4 space-y-2">
                <li><button type="button" onClick={() => goTo('features')} className="rounded text-sm text-[#9B9B9B] transition-colors duration-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white">{t('nav.features')}</button></li>
                <li><button type="button" onClick={() => goTo('pricing')} className="rounded text-sm text-[#9B9B9B] transition-colors duration-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white">{t('nav.pricing')}</button></li>
                <li><button type="button" onClick={() => goTo('faq')} className="rounded text-sm text-[#9B9B9B] transition-colors duration-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white">{t('nav.faq')}</button></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold">{t('footer.company')}</p>
              <ul className="mt-4 space-y-2">
                <li><button type="button" onClick={() => setLegal('privacy')} className="rounded text-sm text-[#9B9B9B] transition-colors duration-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white">{t('footer.privacy')}</button></li>
                <li><button type="button" onClick={() => setLegal('terms')} className="rounded text-sm text-[#9B9B9B] transition-colors duration-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white">{t('footer.terms')}</button></li>
              </ul>
            </div>
          </nav>
        </div>
        <div className="mx-auto mt-8 flex max-w-5xl flex-wrap items-center justify-between gap-4 border-t border-[#313131] pt-8">
          <p className="text-sm text-[#9B9B9B]">{t('footer.copyright')}</p>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="inline-flex items-center gap-2 rounded-xl border border-[#313131] bg-[#1F1F1F] px-3 py-2 text-sm font-semibold transition-colors duration-300 hover:bg-[#272727] focus:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-[0.98]">
            <ArrowUp size={16} weight="bold" />{t('footer.backToTop')}
          </button>
        </div>
      </footer>

      {/* Demo dialog */}
      <Dialog open={demoOpen} onClose={closeDemo} title={t('demoDialog.title')} label={t('demoDialog.close')}>
        {demoDone ? (
          <div role="status">
            <p className="flex items-center gap-2 text-lg font-semibold"><Check size={20} weight="bold" />{t('demoDialog.successTitle')}</p>
            <p className="mt-2 text-base text-[#9B9B9B]">{t('demoDialog.successText')}</p>
            <button type="button" onClick={closeDemo} className={`${btnPrimary} mt-6 w-full`}>{t('demoDialog.close')}</button>
          </div>
        ) : (
          <form onSubmit={submitDemo} noValidate>
            <p className="text-base text-[#9B9B9B]">{t('demoDialog.intro')}</p>
            <div className="mt-4">
              <label htmlFor="demo-name" className="text-sm font-semibold">{t('demoDialog.nameLabel')}</label>
              <input id="demo-name" type="text" value={demoName} onChange={(e) => { setDemoName(e.target.value); setDemoNameErr('') }} placeholder={t('demoDialog.namePlaceholder')} aria-invalid={!!demoNameErr} className={`${inputCls} mt-2`} />
              {demoNameErr && <p role="alert" className="mt-2 text-sm font-medium text-[#FF9B9B]">{demoNameErr}</p>}
            </div>
            <div className="mt-4">
              <label htmlFor="demo-email" className="text-sm font-semibold">{t('demoDialog.emailLabel')}</label>
              <input id="demo-email" type="email" value={demoEmail} onChange={(e) => { setDemoEmail(e.target.value); setDemoEmailErr('') }} placeholder={t('demoDialog.emailPlaceholder')} aria-invalid={!!demoEmailErr} className={`${inputCls} mt-2`} />
              {demoEmailErr && <p role="alert" className="mt-2 text-sm font-medium text-[#FF9B9B]">{demoEmailErr}</p>}
            </div>
            <div className="mt-6 flex gap-2">
              <button type="button" onClick={closeDemo} className={`${btnSecondary} flex-1`}>{t('demoDialog.cancel')}</button>
              <button type="submit" className={`${btnPrimary} flex-1`}>{t('demoDialog.submit')}</button>
            </div>
          </form>
        )}
      </Dialog>

      {/* Legal dialogs */}
      <Dialog open={legal === 'privacy'} onClose={() => setLegal(null)} title={t('footer.privacyTitle')} label={t('footer.privacy')}>
        <p className="text-base text-[#9B9B9B]">{t('footer.privacyText')}</p>
        <button type="button" onClick={() => setLegal(null)} className={`${btnPrimary} mt-6 w-full`}>{t('demoDialog.close')}</button>
      </Dialog>
      <Dialog open={legal === 'terms'} onClose={() => setLegal(null)} title={t('footer.termsTitle')} label={t('footer.terms')}>
        <p className="text-base text-[#9B9B9B]">{t('footer.termsText')}</p>
        <button type="button" onClick={() => setLegal(null)} className={`${btnPrimary} mt-6 w-full`}>{t('demoDialog.close')}</button>
      </Dialog>
    </div>
  )
}
