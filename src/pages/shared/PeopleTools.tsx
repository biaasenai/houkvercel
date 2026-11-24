import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  BriefcaseBusiness,
  GraduationCap,
  Link2,
  MapPin,
  Star,
  UserRound,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

type Candidate = { id: string; full_name: string; headline: string | null; bio: string | null; city: string | null; state: string | null; is_pcd: boolean | null }
type CandidateSkill = {
  level: string | null
  skills: { name: string } | { name: string }[] | null
}
type CandidatePortfolio = {
  id: string
  title: string
  description: string | null
  url: string
}

export function CandidateDetailsPage() {
  const [params] = useSearchParams()
  const id = params.get('id')
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [experiences, setExperiences] = useState<Array<{
    id: string
    title: string
    company: string
    current: boolean
  }>>([])
  const [educations, setEducations] = useState<Array<{
    id: string
    course: string
    institution: string
    current: boolean
  }>>([])
  const [skills, setSkills] = useState<CandidateSkill[]>([])
  const [portfolios, setPortfolios] = useState<CandidatePortfolio[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    void (async () => {
      if (!id) {
        setMessage('Selecione um candidato.')
        return
      }

      const [
        profile,
        experienceData,
        educationData,
        skillData,
        portfolioData,
      ] = await Promise.all([
        supabase
          .from('public_profiles')
          .select('id, full_name, headline, bio, city, state, is_pcd')
          .eq('id', id)
          .single(),
        supabase
          .from('experiences')
          .select('id, title, company, current')
          .eq('candidate_id', id)
          .order('started_on', { ascending: false }),
        supabase
          .from('educations')
          .select('id, course, institution, current')
          .eq('candidate_id', id),
        supabase
          .from('candidate_skills')
          .select('level, skills(name)')
          .eq('candidate_id', id),
        supabase
          .from('portfolios')
          .select('id, title, description, url')
          .eq('candidate_id', id),
      ])

      if (profile.error) {
        setMessage('Não foi possível carregar o perfil do candidato.')
      } else {
        setCandidate(profile.data)
      }
      setExperiences(experienceData.data ?? [])
      setEducations(educationData.data ?? [])
      setSkills(skillData.data ?? [])
      setPortfolios(portfolioData.data ?? [])
      const relatedDataError =
        experienceData.error ??
        educationData.error ??
        skillData.error ??
        portfolioData.error
      if (relatedDataError) {
        setMessage(
          `Não foi possível carregar todos os dados do perfil: ${relatedDataError.message}`
        )
      }
    })()
  }, [id])

  if (message && !candidate) {
    return (
      <section className="workspace-card error-box">
        <UserRound size={22} />
        <div>
          <h2>Candidato indisponível</h2>
          <p>{message}</p>
        </div>
      </section>
    )
  }
  if (!candidate) {
    return (
      <section className="workspace-card loading-card">
        <div className="loading-dot" />
        <span>Carregando candidato...</span>
      </section>
    )
  }

  const location = [candidate.city, candidate.state].filter(Boolean).join(', ') || 'Local não informado'

  return (
    <section className="opportunity-flow candidate-profile">
      <Link className="flow-back" to="/contratante/candidates">
        <ArrowLeft size={16} />
        Voltar para candidatos
      </Link>
      <article className="workspace-card candidate-profile-header">
        <div className="candidate-heading">
          <span className="record-avatar"><UserRound size={22} /></span>
          <div>
            <span className="section-eyebrow">CANDIDATO</span>
            <h2>{candidate.full_name}</h2>
            <p>{candidate.headline || 'Profissional HOUK'}</p>
          </div>
        </div>
        <div className="candidate-profile-meta">
          <span><MapPin size={16} />{location}</span>
          {candidate.is_pcd && <span>Perfil PCD</span>}
        </div>
      </article>

      {message && (
        <p className="form-message" role="alert">
          {message}
        </p>
      )}

      <div className="candidate-profile-grid">
        <section className="workspace-card candidate-profile-section candidate-profile-section-full">
          <h3>Sobre</h3>
          <p>{candidate.bio || 'Nenhuma descrição informada.'}</p>
        </section>

        <section className="workspace-card candidate-profile-section">
          <h3><Star size={17} /> Competências</h3>
          {skills.length ? (
            <div className="candidate-skill-list">
              {skills.map((item, index) => {
                const skill = Array.isArray(item.skills)
                  ? item.skills[0]
                  : item.skills
                return skill?.name ? (
                  <span className="candidate-skill-pill" key={`${skill.name}-${index}`}>
                    {skill.name}
                    {item.level && <small>{item.level}</small>}
                  </span>
                ) : null
              })}
            </div>
          ) : (
            <p>Nenhuma competência cadastrada.</p>
          )}
        </section>

        <section className="workspace-card candidate-profile-section">
          <h3><BriefcaseBusiness size={17} /> Experiência</h3>
          {experiences.length ? (
            <div className="candidate-profile-items">
              {experiences.map(item => (
                <article className="candidate-profile-item" key={item.id}>
                  <strong>{item.title}</strong>
                  <span>{item.company}{item.current ? ' · Atual' : ''}</span>
                </article>
              ))}
            </div>
          ) : (
            <p>Nenhuma experiência cadastrada.</p>
          )}
        </section>

        <section className="workspace-card candidate-profile-section">
          <h3><GraduationCap size={17} /> Formação</h3>
          {educations.length ? (
            <div className="candidate-profile-items">
              {educations.map(item => (
                <article className="candidate-profile-item" key={item.id}>
                  <strong>{item.course}</strong>
                  <span>{item.institution}{item.current ? ' · Em curso' : ''}</span>
                </article>
              ))}
            </div>
          ) : (
            <p>Nenhuma formação cadastrada.</p>
          )}
        </section>

        <section className="workspace-card candidate-profile-section candidate-profile-section-full">
          <h3><Link2 size={17} /> Portfólio</h3>
          {portfolios.length ? (
            <div className="candidate-profile-items">
              {portfolios.map(item => (
                <article className="candidate-profile-item" key={item.id}>
                  <a href={item.url} target="_blank" rel="noreferrer">
                    {item.title}
                  </a>
                  {item.description && <span>{item.description}</span>}
                </article>
              ))}
            </div>
          ) : (
            <p>Nenhum item de portfólio cadastrado.</p>
          )}
        </section>
      </div>
    </section>
  )
}

export function ReviewsPage({ role }: { role: 'candidate' | 'contractor' | 'admin' }) {
  const [items, setItems] = useState<Array<{ id: string; rating: number; comment: string | null; created_at: string }>>([]); const [message, setMessage] = useState('')
  useEffect(() => { void (async () => { const { data: auth } = await supabase.auth.getUser(); if (!auth.user && role !== 'admin') { setMessage('Faça login para consultar avaliações.'); return }; const query = role === 'admin' ? supabase.from('reviews').select('id, rating, comment, created_at').order('created_at', { ascending: false }) : supabase.from('reviews').select('id, rating, comment, created_at').eq('author_id', auth.user!.id).order('created_at', { ascending: false }); const { data, error } = await query; if (error) setMessage(`Não foi possível carregar avaliações: ${error.message}`); else setItems(data ?? []) })() }, [role])
  return <section className="workspace-card editor-card"><span className="section-eyebrow">AVALIAÇÕES</span><h2>{role === 'admin' ? 'Avaliações da plataforma' : 'Minhas avaliações'}</h2><p>Consulte os feedbacks que você publicou na HOUK.</p>{message && <p className="form-message">{message}</p>}{items.length ? <div className="reviews-list">{items.map(item => <article key={item.id}><strong><Star size={16} fill="currentColor" /> {item.rating}/5</strong><p>{item.comment || 'Sem comentário.'}</p></article>)}</div> : !message && <div className="empty-page compact"><Star size={28} /><h3>Nenhuma avaliação</h3><p>As avaliações publicadas aparecerão aqui.</p></div>}</section>
}
