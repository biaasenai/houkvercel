import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import {
  PROFESSIONAL_CATEGORIES,
  type ProfessionalCategory,
} from '../../lib/professionalCategories'

export function BusinessEditor() {
  const [form, setForm] = useState({ name: '', legal_name: '', cnpj: '', description: '', website: '', phone: '', email: '', city: '', state: '', address: '' })
  const [message, setMessage] = useState(''); const [saving, setSaving] = useState(false)
  useEffect(() => { void (async () => { const { data: auth } = await supabase.auth.getUser(); if (!auth.user) return; const { data } = await supabase.from('businesses').select('name, legal_name, cnpj, description, website, phone, email, city, state, address').eq('contractor_id', auth.user.id).maybeSingle(); if (data) setForm({ name: data.name ?? '', legal_name: data.legal_name ?? '', cnpj: data.cnpj ?? '', description: data.description ?? '', website: data.website ?? '', phone: data.phone ?? '', email: data.email ?? '', city: data.city ?? '', state: data.state ?? '', address: data.address ?? '' }) })() }, [])
  const set = (field: keyof typeof form, value: string) => setForm(current => ({ ...current, [field]: value }))
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSaving(true); const { data: auth } = await supabase.auth.getUser(); if (!auth.user) { setMessage('Faça login para continuar.'); setSaving(false); return }; const payload = { ...form, legal_name: form.legal_name || null, cnpj: form.cnpj || null, description: form.description || null, website: form.website || null, phone: form.phone || null, email: form.email || null, city: form.city || null, state: form.state.toUpperCase() || null, address: form.address || null, contractor_id: auth.user.id }; const { error } = await supabase.from('businesses').upsert(payload, { onConflict: 'contractor_id' }); setMessage(error ? `Não foi possível salvar: ${error.message}` : 'Dados da empresa atualizados.'); setSaving(false) }
  return <section className="workspace-card editor-card"><span className="section-eyebrow">EMPRESA</span><h2>Edite os dados da empresa</h2><p>Essas informações aparecem para os candidatos nas oportunidades publicadas.</p><form className="opportunity-form" onSubmit={submit}><div className="opportunity-form-grid"><label className="form-field"><span>Nome da empresa *</span><input required value={form.name} onChange={e => set('name', e.target.value)} /></label><label className="form-field"><span>Razão social</span><input value={form.legal_name} onChange={e => set('legal_name', e.target.value)} /></label><label className="form-field"><span>CNPJ</span><input value={form.cnpj} onChange={e => set('cnpj', e.target.value)} /></label><label className="form-field"><span>Telefone</span><input value={form.phone} onChange={e => set('phone', e.target.value)} /></label><label className="form-field"><span>E-mail</span><input type="email" value={form.email} onChange={e => set('email', e.target.value)} /></label><label className="form-field"><span>Site</span><input type="url" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://" /></label><label className="form-field"><span>Cidade</span><input value={form.city} onChange={e => set('city', e.target.value)} /></label><label className="form-field"><span>UF</span><input maxLength={2} value={form.state} onChange={e => set('state', e.target.value)} /></label><label className="form-field form-field-full"><span>Endereço</span><input value={form.address} onChange={e => set('address', e.target.value)} /></label><label className="form-field form-field-full"><span>Descrição</span><textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)} /></label></div>{message && <p className="form-message">{message}</p>}<div className="form-actions"><button className="workspace-primary" disabled={saving}><Save size={16} />{saving ? 'Salvando...' : 'Salvar empresa'}</button></div></form></section>
}

export function OpportunityEditor({
  role = 'contractor',
}: {
  role?: 'contractor' | 'admin'
}) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const id = params.get('id')
  const base = role === 'admin' ? '/admin' : '/contratante'
  const [form, setForm] = useState({
    title: '',
    description: '',
    city: '',
    state: '',
    opportunity_type: 'CLT',
    work_model: 'PRESENTIAL',
    status: 'ACTIVE',
    categoryId: '',
  })
  const [persistedStatus, setPersistedStatus] = useState<string | null>(null)
  const [categories, setCategories] = useState<
    Array<{ id: string; name: ProfessionalCategory }>
  >([])
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void (async () => {
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('active', true)
        .in('name', [...PROFESSIONAL_CATEGORIES])

      if (categoryError) {
        setMessage(`Não foi possível carregar categorias: ${categoryError.message}`)
      } else {
        const orderedCategories = PROFESSIONAL_CATEGORIES.flatMap(name => {
          const category = categoryData?.find(item => item.name === name)
          return category ? [{ id: category.id, name }] : []
        })
        setCategories(orderedCategories)
        if (orderedCategories.length !== PROFESSIONAL_CATEGORIES.length) {
          setMessage('As categorias padronizadas não estão disponíveis. Atualize as categorias da plataforma antes de editar.')
        }
      }

      if (!id) {
        setMessage('Selecione uma oportunidade para editar.')
        return
      }

      const { data, error } = await supabase
        .from('opportunities')
        .select('title, description, city, state, opportunity_type, work_model, status, category_id')
        .eq('id', id)
        .single()

      if (error) {
        setMessage(`Não foi possível carregar a oportunidade: ${error.message}`)
        return
      }

      setPersistedStatus(data.status)
      setForm({
        title: data.title,
        description: data.description,
        city: data.city ?? '',
        state: data.state ?? '',
        opportunity_type: data.opportunity_type,
        work_model: data.work_model,
        status: data.status,
        categoryId: data.category_id ?? '',
      })
    })()
  }, [id])

  const set = (field: keyof typeof form, value: string) =>
    setForm(current => ({ ...current, [field]: value }))

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!id || !form.categoryId) {
      setMessage('Selecione uma categoria para a oportunidade.')
      return
    }

    setSaving(true)
    setMessage('')
    const { categoryId, ...opportunityFields } = form
    const { error } = await supabase
      .from('opportunities')
      .update({
        ...opportunityFields,
        category_id: categoryId,
        state: form.state.toUpperCase() || null,
      })
      .eq('id', id)

    if (error) {
      setMessage(`Não foi possível salvar: ${error.message}`)
    } else {
      navigate(`${base}/opportunity-details?id=${id}`)
    }
    setSaving(false)
  }

  return (
    <section className="opportunity-flow">
      <Link className="flow-back" to={`${base}/opportunities`}>
        <ArrowLeft size={16} /> Voltar para oportunidades
      </Link>
      <section className="workspace-card editor-card">
        <span className="section-eyebrow">OPORTUNIDADE</span>
        <h2>Edite a oportunidade</h2>
        <form className="opportunity-form" onSubmit={submit}>
          <div className="opportunity-form-grid">
            <label className="form-field form-field-full">
              <span>Título *</span>
              <input
                required
                value={form.title}
                onChange={event => set('title', event.target.value)}
              />
            </label>
            <label className="form-field form-field-full">
              <span>Descrição *</span>
              <textarea
                required
                rows={5}
                value={form.description}
                onChange={event => set('description', event.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Cidade</span>
              <input
                value={form.city}
                onChange={event => set('city', event.target.value)}
              />
            </label>
            <label className="form-field">
              <span>UF</span>
              <input
                maxLength={2}
                value={form.state}
                onChange={event => set('state', event.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Categoria *</span>
              <select
                required
                value={form.categoryId}
                onChange={event => set('categoryId', event.target.value)}
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Contratação</span>
              <select
                value={form.opportunity_type}
                onChange={event => set('opportunity_type', event.target.value)}
              >
                <option value="CLT">CLT</option>
                <option value="PJ">PJ</option>
                <option value="APPRENTICE">Jovem aprendiz</option>
                <option value="INTERNSHIP">Estágio</option>
                <option value="FREELANCE">Freelance</option>
              </select>
            </label>
            <label className="form-field">
              <span>Modalidade</span>
              <select
                value={form.work_model}
                onChange={event => set('work_model', event.target.value)}
              >
                <option value="PRESENTIAL">Presencial</option>
                <option value="HYBRID">Híbrido</option>
                <option value="REMOTE">Remoto</option>
              </select>
            </label>
            <label className="form-field">
              <span>Status</span>
              <select
                value={form.status}
                disabled={role === 'contractor' && persistedStatus === 'DRAFT'}
                onChange={event => set('status', event.target.value)}
              >
                {persistedStatus === 'DRAFT' && (
                  <option value="DRAFT" disabled>
                    Rascunho
                  </option>
                )}
                <option value="ACTIVE">Ativa</option>
                <option value="PAUSED">Pausada</option>
                <option value="CLOSED">Encerrada</option>
              </select>
            </label>
          </div>
          {message && <p className="form-message" role="alert">{message}</p>}
          <div className="form-actions">
            <button
              className="workspace-primary"
              disabled={saving || categories.length !== PROFESSIONAL_CATEGORIES.length}
            >
              <Save size={16} />
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </section>
    </section>
  )
}
