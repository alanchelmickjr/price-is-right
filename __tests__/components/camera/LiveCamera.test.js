const { render, screen } = require('@testing-library/react');
const LiveCamera = require('../../../components/camera/LiveCamera');

test('renders LiveCamera component', () => {
    render(<LiveCamera />);
    const linkElement = screen.getByText(/camera access granted/i);
    expect(linkElement).toBeInTheDocument();
});