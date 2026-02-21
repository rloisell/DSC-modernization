import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Login from '../pages/Login'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ state: null }),
  }
})

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ login: vi.fn() }),
}))

vi.mock('../api/AuthService', () => ({
  AuthService: { login: vi.fn() },
}))

vi.mock('@bcgov/design-system-react-components', () => ({
  Button:      ({ children, type, isDisabled }) => <button type={type} disabled={isDisabled}>{children}</button>,
  Form:        ({ children, onSubmit })         => <form onSubmit={onSubmit}>{children}</form>,
  Heading:     ({ children })                   => <h1>{children}</h1>,
  InlineAlert: ({ title, description })         => <div role="alert">{title}: {description}</div>,
  Text:        ({ children })                   => <p>{children}</p>,
  TextField:   ({ label, type, value, onChange, isRequired, isDisabled }) => (
    <input
      aria-label={label}
      type={type ?? 'text'}
      value={value}
      onChange={e => onChange(e.target.value)}
      required={isRequired}
      disabled={isDisabled}
    />
  ),
}))

// ── Tests ─────────────────────────────────────────────────────────────────────

const renderLogin = () => render(<MemoryRouter><Login /></MemoryRouter>)

describe('Login page', () => {
  it('renders the Login heading', () => {
    renderLogin()
    expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument()
  })

  it('renders a username text field', () => {
    renderLogin()
    expect(screen.getByRole('textbox', { name: /username/i })).toBeInTheDocument()
  })

  it('renders a password field', () => {
    renderLogin()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders the Login submit button', () => {
    renderLogin()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })
})
