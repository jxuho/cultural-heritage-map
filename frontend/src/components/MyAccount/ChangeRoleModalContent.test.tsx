import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChangeRoleModalContent } from './ChangeRoleModalContent';
import useUiStore from '../../store/uiStore';
import { useUpdateUserRole } from '../../hooks/data/useUserQueries';

// 1. Mocking dependencies
vi.mock('../../store/uiStore', () => ({
  default: vi.fn(),
}));

vi.mock('../../hooks/data/useUserQueries', () => ({
  useUpdateUserRole: vi.fn(),
}));

const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

describe('ChangeRoleModalContent', () => {
  const mockUser = { _id: '123', username: 'testuser', role: 'user' };
  const mockCloseModal = vi.fn();
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useUiStore as any).mockReturnValue({
      closeModal: mockCloseModal,
    });

    (useUpdateUserRole as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      error: null,
    });
  });

  test("Displays the user's name correctly", () => {
    render(<ChangeRoleModalContent user={mockUser} />);
    expect(screen.getByText(/"testuser"/i)).toBeInTheDocument();
  });

  test('Shows an alert and closes the modal if the role is not changed', async () => {
    render(<ChangeRoleModalContent user={mockUser} />);

    const submitButton = screen.getByRole('button', {
      name: /commit_changes/i,
    });
    fireEvent.click(submitButton);

    expect(alertMock).toHaveBeenCalledWith(
      'Security Warning: No change in authorization level detected.',
    );
    expect(mockCloseModal).toHaveBeenCalled();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  test('Shows a success message and closes the modal if the role is changed and submitted', async () => {
    mockMutateAsync.mockResolvedValueOnce({});

    render(<ChangeRoleModalContent user={mockUser} />);

    const select = screen.getByLabelText(/assign_new_clearance/i);
    const submitButton = screen.getByRole('button', {
      name: /commit_changes/i,
    });

    fireEvent.change(select, { target: { value: 'admin' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        userId: '123',
        newRole: 'admin',
      });
      expect(mockCloseModal).toHaveBeenCalled();
    });
  });

  test('Shows loading state (isPending) with disabled buttons', () => {
    (useUpdateUserRole as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
      isError: false,
    });

    render(<ChangeRoleModalContent user={mockUser} />);

    expect(
      screen.getByRole('button', { name: /updating_registry/i }),
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: /abort/i })).toBeDisabled();
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  test('Shows error message on the screen when an error occurs', () => {
    const errorMessage = 'Server error occurred.';
    (useUpdateUserRole as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: true,
      error: { message: errorMessage },
    });

    render(<ChangeRoleModalContent user={mockUser} />);

    expect(
      screen.getByText(new RegExp(`CRITICAL_ERROR: ${errorMessage}`, 'i')),
    ).toBeInTheDocument();
  });

  test('Abort button click calls closeModal', () => {
    render(<ChangeRoleModalContent user={mockUser} />);

    const abortButton = screen.getByRole('button', { name: /abort/i });
    fireEvent.click(abortButton);

    expect(mockCloseModal).toHaveBeenCalled();
  });
});
