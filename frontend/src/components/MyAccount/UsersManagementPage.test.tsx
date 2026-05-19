import { render, screen, fireEvent, within } from '@testing-library/react';
import UsersManagementPage from './UsersManagementPage';
import { useAllUsers } from '../../hooks/data/useUserQueries';
import useAuthStore from '../../store/authStore';
import { MemoryRouter } from 'react-router';
import { User } from '@/types/user';

vi.mock('../../hooks/data/useUserQueries', () => ({
  useAllUsers: vi.fn(),
}));

vi.mock('../../store/authStore', () => ({
  default: vi.fn(),
}));

vi.mock('./UserProfileCard', () => ({
  default: ({ user }: { user: any }) => (
    <div data-testid="user-profile-card">
      {user.username}'s Detailed Profile
    </div>
  ),
}));

describe('UsersManagementPage', () => {
  const mockCurrentUser: User = {
    _id: 'admin-id',
    username: 'AdminUser',
    email: 'admin@test.com',
    googleId: 'google-admin-12345',
    role: 'admin',
    favoriteSites: [],
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  };

  const mockUsers: User[] = [
    {
      _id: 'admin-id',
      username: 'AdminUser',
      email: 'admin@test.com',
      role: 'admin',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    } as User,
    {
      _id: 'user-1',
      username: 'Zebra',
      email: 'zebra@test.com',
      role: 'user',
      createdAt: '2023-02-01T00:00:00Z',
      updatedAt: '2023-02-01T00:00:00Z',
    } as User,
    {
      _id: 'user-2',
      username: 'Apple',
      email: 'apple@test.com',
      role: 'user',
      createdAt: '2023-01-15T00:00:00Z',
      updatedAt: '2023-01-15T00:00:00Z',
    } as User,
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockReturnValue({ user: mockCurrentUser });
  });

  test('Display a loading spinner and message when loading', () => {
    (useAllUsers as any).mockReturnValue({ isLoading: true });
    render(<UsersManagementPage />);
    expect(
      screen.getByText(/Accessing Personnel Records.../i),
    ).toBeInTheDocument();
  });

  test('Displays an error message when an error occurs', () => {
    (useAllUsers as any).mockReturnValue({
      isError: true,
      error: { message: 'Failed to load user database.' },
    });
    render(<UsersManagementPage />);
    expect(
      screen.getByText('Failed to load user database.'),
    ).toBeInTheDocument();
  });

  test('Render the user list and place the logged in user at the top (showing CURRENT_ADMIN tag)', () => {
    (useAllUsers as any).mockReturnValue({ data: mockUsers, isLoading: false });
    render(
      <MemoryRouter>
        <UsersManagementPage />
      </MemoryRouter>,
    );

    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings[0]).toHaveTextContent(/AdminUser/i);
    expect(screen.getByText(/CURRENT_ADMIN/i)).toBeInTheDocument();
  });

  test('Click the Sort by Username button to change the order.', () => {
    (useAllUsers as any).mockReturnValue({ data: mockUsers, isLoading: false });
    render(
      <MemoryRouter>
        <UsersManagementPage />
      </MemoryRouter>,
    );

    const sortBtn = screen.getByRole('button', { name: /Username/i });

    fireEvent.click(sortBtn);

    const names = screen
      .getAllByRole('heading', { level: 2 })
      .map((h) => h.textContent);
    expect(names[1]).toMatch(/Zebra/i);
  });

  test('Clicking the Open_Record button toggles the detail card.', () => {
    (useAllUsers as any).mockReturnValue({ data: mockUsers, isLoading: false });
    render(
      <MemoryRouter>
        <UsersManagementPage />
      </MemoryRouter>,
    );

    const appleCard = screen
      .getByText('Apple')
      .closest('.border-2.border-black') as HTMLElement;
    const openBtn = within(appleCard).getByRole('button', {
      name: /Open_Record/i,
    });

    fireEvent.click(openBtn);
    expect(screen.getByTestId('user-profile-card')).toBeInTheDocument();
    expect(
      within(appleCard).getByRole('button', { name: /Close_File/i }),
    ).toBeInTheDocument();
  });
});
