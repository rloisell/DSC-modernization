import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SubTabs from '../components/SubTabs'

const TABS = [
  { id: 'list', label: 'Items' },
  { id: 'form', label: 'Add / Edit' },
]

describe('SubTabs component', () => {
  it('renders all tab labels', () => {
    render(<SubTabs tabs={TABS} activeTab="list" onTabChange={() => {}} />)
    expect(screen.getByRole('tab', { name: 'Items' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Add / Edit' })).toBeInTheDocument()
  })

  it('marks the active tab with aria-selected="true"', () => {
    render(<SubTabs tabs={TABS} activeTab="list" onTabChange={() => {}} />)
    expect(screen.getByRole('tab', { name: 'Items' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Add / Edit' })).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onTabChange with the clicked tab id', async () => {
    const user = userEvent.setup()
    const onTabChange = vi.fn()
    render(<SubTabs tabs={TABS} activeTab="list" onTabChange={onTabChange} />)
    await user.click(screen.getByRole('tab', { name: 'Add / Edit' }))
    expect(onTabChange).toHaveBeenCalledWith('form')
  })
})
