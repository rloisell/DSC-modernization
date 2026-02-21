import { render, screen } from '@testing-library/react'
import Home from '../pages/Home'

// Mock BC Gov design system to avoid CSS/custom-element issues in jsdom
vi.mock('@bcgov/design-system-react-components', () => ({
  Heading: ({ children }) => <h1>{children}</h1>,
  Text:    ({ children, elementType }) => {
    const Tag = elementType ?? 'span'
    return <Tag>{children}</Tag>
  },
}))

describe('Home page', () => {
  it('renders the DSC Modernization heading', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { name: /DSC Modernization/i })).toBeInTheDocument()
  })

  it('renders the navigation hint text', () => {
    render(<Home />)
    expect(screen.getByText(/Use the navigation/i)).toBeInTheDocument()
  })
})
