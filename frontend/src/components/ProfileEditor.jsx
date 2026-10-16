import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { usersApi } from '../services/api.js';

// Edição rápida do currículo: GitHub, LinkedIn e resumo.
export default function ProfileEditor() {
  const { user, token, updateUser } = useAuth();
  const [form, setForm] = useState({
    githubUrl: user.githubUrl ?? '',
    linkedinUrl: user.linkedinUrl ?? '',
    bio: user.bio ?? '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState(null); // { type, text }
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setMessage(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setFieldErrors({});
    try {
      const data = await usersApi.updateMe(token, form);
      updateUser(data.user);
      setMessage({ type: 'success', text: 'Perfil atualizado.' });
    } catch (err) {
      const byField = {};
      (err.errors || []).forEach(({ field, message: text }) => {
        if (field && !byField[field]) byField[field] = text;
      });
      setFieldErrors(byField);
      setMessage({
        type: 'error',
        text: Object.keys(byField).length ? 'Corrija os campos destacados.' : err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="panel">
      <h2>Meu currículo</h2>
      <p className="hint">As empresas veem estes dados quando você se candidata.</p>

      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="profile-github">GitHub</label>
          <input
            id="profile-github"
            name="githubUrl"
            type="url"
            placeholder="https://github.com/seu-usuario"
            value={form.githubUrl}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.githubUrl)}
          />
          {fieldErrors.githubUrl && <span className="field__error">{fieldErrors.githubUrl}</span>}
        </div>

        <div className="field">
          <label htmlFor="profile-linkedin">LinkedIn</label>
          <input
            id="profile-linkedin"
            name="linkedinUrl"
            type="url"
            placeholder="https://linkedin.com/in/seu-perfil"
            value={form.linkedinUrl}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.linkedinUrl)}
          />
          {fieldErrors.linkedinUrl && <span className="field__error">{fieldErrors.linkedinUrl}</span>}
        </div>

        <div className="field">
          <label htmlFor="profile-bio">Resumo</label>
          <textarea
            id="profile-bio"
            name="bio"
            rows={4}
            maxLength={500}
            placeholder="Conte em poucas linhas quem você é e no que trabalha."
            value={form.bio}
            onChange={handleChange}
          />
          {fieldErrors.bio && <span className="field__error">{fieldErrors.bio}</span>}
        </div>

        {message && (
          <p className={`alert ${message.type === 'success' ? 'alert--success' : 'alert--error'}`} role="status">
            {message.text}
          </p>
        )}

        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar perfil'}
        </button>
      </form>
    </section>
  );
}
