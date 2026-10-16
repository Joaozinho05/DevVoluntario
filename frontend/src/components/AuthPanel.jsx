// Moldura compartilhada de Login e Cadastro: texto de apresentação à esquerda, formulário à direita.
export default function AuthPanel({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <aside className="auth__aside">
        <p className="auth__statement">Seu código pode destravar o trabalho de quem ajuda os outros.</p>
        <p className="auth__code">
          <span>const impacto = </span>
          <span className="auth__code-hl">tempo + código</span>
          <span>;</span>
        </p>
        <p className="auth__aside-note">
          Desenvolvedores voluntários e organizações que precisam de tecnologia, no mesmo lugar.
        </p>
      </aside>

      <section className="auth__content">
        <h1 className="auth__title">{title}</h1>
        <p className="auth__subtitle">{subtitle}</p>
        {children}
        {footer && <p className="auth__footer">{footer}</p>}
      </section>
    </div>
  );
}
