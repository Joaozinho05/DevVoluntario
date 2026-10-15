import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthPanel from '../components/AuthPanel.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES } from '../utils/roles.js';

const ROLE_OPTIONS = [
  {
    value: ROLES.TRABALHADOR,
    title: 'Sou voluntário',
    description: 'Quero contribuir com meu código em projetos sociais.',
  },
  {
    value: ROLES.EMPRESA,
    title: 'Represento uma empresa',
    description: 'Quero publicar vagas e receber candidaturas.',
  },
];

const INITIAL_FORM = {
  name: '',
  email: '',
  password: '',
  role: ROLES.TRABALHADOR,
  githubUrl: '',
  linkedinUrl: '',
  bio: '',
};

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  };

  // Em caso de sucesso, o PublicRoute redireciona automaticamente.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    try {
      await register(form);
    } catch (err) {
      const byField = {};
      (err.errors || []).forEach(({ field, message }) => {
        if (field && !byField[field]) byField[field] = message;
      });
      setFieldErrors(byField);
      setError(Object.keys(byField).length ? 'Corrija os campos destacados.' : err.message);
      setLoading(false);
    }
  };

  const renderField = ({ name, label, type = 'text', autoComplete, placeholder, optional }) => (
    <div className="field">
      <label htmlFor={name}>
        {label}
        {optional && <span className="field__optional"> (opcional)</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={form[name]}
        onChange={handleChange}
        aria-invalid={Boolean(fieldErrors[name])}
        aria-describedby={fieldErrors[name] ? `${name}-error` : undefined}
        required={!optional}
      />
      {fieldErrors[name] && (
        <span id={`${name}-error`} className="field__error">
          {fieldErrors[name]}
        </span>
      )}
    </div>
  );

  return (
    <AuthPanel
      title="Criar sua conta"
      subtitle="Leva menos de um minuto. Você pode completar o perfil depois."
      footer={
        <>
          Já tem conta? <Link to="/login">Entrar</Link>
        </>
      }
    >
      <form className="form" onSubmit={handleSubmit} noValidate>
        {error && (
          <p className="alert alert--error" role="alert">
            {error}
          </p>
        )}

        <fieldset className="role-picker">
          <legend>Como você vai usar a plataforma?</legend>
          {ROLE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`role-picker__option${form.role === option.value ? ' role-picker__option--active' : ''}`}
            >
              <input
                type="radio"
                name="role"
                value={option.value}
                checked={form.role === option.value}
                onChange={handleChange}
              />
              <span className="role-picker__title">{option.title}</span>
              <span className="role-picker__desc">{option.description}</span>
            </label>
          ))}
          {fieldErrors.role && <span className="field__error">{fieldErrors.role}</span>}
        </fieldset>

        {renderField({ name: 'name', label: 'Nome completo', autoComplete: 'name' })}
        {renderField({ name: 'email', label: 'E-mail', type: 'email', autoComplete: 'email' })}
        {renderField({
          name: 'password',
          label: 'Senha',
          type: 'password',
          autoComplete: 'new-password',
          placeholder: 'Mínimo de 8 caracteres, com letra e número',
        })}
        {renderField({
          name: 'githubUrl',
          label: 'GitHub',
          type: 'url',
          placeholder: 'https://github.com/seu-usuario',
          optional: true,
        })}
        {renderField({
          name: 'linkedinUrl',
          label: 'LinkedIn',
          type: 'url',
          placeholder: 'https://linkedin.com/in/seu-perfil',
          optional: true,
        })}

        <div className="field">
          <label htmlFor="bio">
            Bio<span className="field__optional"> (opcional)</span>
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            maxLength={500}
            value={form.bio}
            onChange={handleChange}
            placeholder="Conte em poucas linhas quem você é e no que trabalha."
          />
          {fieldErrors.bio && <span className="field__error">{fieldErrors.bio}</span>}
        </div>

        <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
          {loading ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>
    </AuthPanel>
  );
}
