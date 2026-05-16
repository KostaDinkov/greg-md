import { render, screen, waitFor } from '@testing-library/react';
import { LabResultsTable } from '@/components/LabResultsTable';

// Mock the fetch API
global.fetch = jest.fn();

const mockResults = [
  {
    id: 1,
    report_id: 1,
    biomarker_name: 'Hemoglobin',
    value: 15.5,
    unit: 'g/dL',
    reference_range: '13.5-17.5',
    is_flagged: false,
    test_date: '2024-01-15',
  },
  {
    id: 2,
    report_id: 1,
    biomarker_name: 'Vitamin D',
    value: 22.0,
    unit: 'ng/mL',
    reference_range: '30-100',
    is_flagged: true,
    test_date: '2024-01-15',
  },
  {
    id: 3,
    report_id: 2,
    biomarker_name: 'Glucose',
    value: 95.0,
    unit: 'mg/dL',
    reference_range: '70-100',
    is_flagged: false,
    test_date: '2024-02-20',
  },
];

describe('LabResultsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<LabResultsTable />);
    
    expect(screen.getByText(/Loading lab results/i)).toBeInTheDocument();
  });

  it('renders table with mock data', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    render(<LabResultsTable />);

    await waitFor(() => {
      expect(screen.getByText('Hemoglobin')).toBeInTheDocument();
    });

    expect(screen.getByText('Vitamin D')).toBeInTheDocument();
    expect(screen.getByText('Glucose')).toBeInTheDocument();
  });

  it('displays biomarker values with units', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    render(<LabResultsTable />);

    await waitFor(() => {
      expect(screen.getByText('15.5')).toBeInTheDocument();
    });

    expect(screen.getByText('g/dL')).toBeInTheDocument();
    expect(screen.getByText('22')).toBeInTheDocument();
    expect(screen.getByText('ng/mL')).toBeInTheDocument();
  });

  it('displays reference ranges', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    render(<LabResultsTable />);

    await waitFor(() => {
      expect(screen.getByText('13.5-17.5')).toBeInTheDocument();
    });

    expect(screen.getByText('30-100')).toBeInTheDocument();
    expect(screen.getByText('70-100')).toBeInTheDocument();
  });

  it('displays flagged badge for abnormal values', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    render(<LabResultsTable />);

    await waitFor(() => {
      expect(screen.getByText('Flagged')).toBeInTheDocument();
    });
  });

  it('displays normal badge for normal values', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    render(<LabResultsTable />);

    await waitFor(() => {
      const normalBadges = screen.getAllByText('Normal');
      expect(normalBadges).toHaveLength(2); // Hemoglobin and Glucose
    });
  });

  it('displays formatted dates', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    render(<LabResultsTable />);

    await waitFor(() => {
      expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
    });

    expect(screen.getByText('Feb 20, 2024')).toBeInTheDocument();
  });

  it('displays empty state when no results exist', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<LabResultsTable />);

    await waitFor(() => {
      expect(screen.getByText(/No lab results found/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Upload a report to get started/i)).toBeInTheDocument();
  });

  it('handles fetch error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<LabResultsTable />);

    await waitFor(() => {
      // Should show empty state after error
      expect(screen.getByText(/No lab results found/i)).toBeInTheDocument();
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('calls correct API endpoint', async () => {
    const mockFetch = global.fetch as jest.Mock;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    render(<LabResultsTable />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/labs/results')
      );
    });
  });

  it('renders table headers correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    render(<LabResultsTable />);

    await waitFor(() => {
      expect(screen.getByText('Date')).toBeInTheDocument();
    });

    expect(screen.getByText('Biomarker')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByText('Range')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('handles null reference range', async () => {
    const resultsWithNullRange = [
      {
        id: 1,
        report_id: 1,
        biomarker_name: 'Custom Marker',
        value: 10.0,
        unit: 'units',
        reference_range: null,
        is_flagged: false,
        test_date: '2024-01-15',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => resultsWithNullRange,
    });

    render(<LabResultsTable />);

    await waitFor(() => {
      expect(screen.getByText('Custom Marker')).toBeInTheDocument();
    });

    // Should display "-" for null reference range
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('sorts table by date in ascending order when date column is clicked', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    const { container } = render(<LabResultsTable />);

    await waitFor(() => {
      expect(screen.getByText('Hemoglobin')).toBeInTheDocument();
    });

    // Get the Date header and click it (should already be descending, so will toggle to ascending)
    const dateHeader = screen.getByText('Date').closest('th');
    if (dateHeader) {
      dateHeader.click();
    }

    // Verify order: oldest first (2024-01-15 before 2024-02-20)
    const rows = container.querySelectorAll('tbody tr');
    expect(rows[0]).toHaveTextContent('Jan 15, 2024');
    expect(rows[2]).toHaveTextContent('Feb 20, 2024');
  });

  it('sorts table by date in descending order by default', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    const { container } = render(<LabResultsTable />);

    await waitFor(() => {
      expect(screen.getByText('Hemoglobin')).toBeInTheDocument();
    });

    // Verify default order: newest first (2024-02-20 before 2024-01-15)
    const rows = container.querySelectorAll('tbody tr');
    expect(rows[0]).toHaveTextContent('Feb 20, 2024');
    expect(rows[2]).toHaveTextContent('Jan 15, 2024');
  });

  it('sorts table by biomarker name alphabetically', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    const { container } = render(<LabResultsTable />);

    await waitFor(() => {
      expect(screen.getByText('Hemoglobin')).toBeInTheDocument();
    });

    // Click Biomarker column header
    const biomarkerHeader = screen.getByText('Biomarker').closest('th');
    if (biomarkerHeader) {
      biomarkerHeader.click();
    }

    // Verify alphabetical order: Glucose, Hemoglobin, Vitamin D
    const rows = container.querySelectorAll('tbody tr');
    expect(rows[0]).toHaveTextContent('Glucose');
    expect(rows[1]).toHaveTextContent('Hemoglobin');
    expect(rows[2]).toHaveTextContent('Vitamin D');
  });

  it('sorts table by value numerically', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    const { container } = render(<LabResultsTable />);

    await waitFor(() => {
      expect(screen.getByText('Hemoglobin')).toBeInTheDocument();
    });

    // Click Value column header
    const valueHeader = screen.getByText('Value').closest('th');
    if (valueHeader) {
      valueHeader.click();
    }

    // Verify numeric order: 15.5, 22, 95
    const rows = container.querySelectorAll('tbody tr');
    expect(rows[0]).toHaveTextContent('Hemoglobin'); // 15.5
    expect(rows[1]).toHaveTextContent('Vitamin D');  // 22
    expect(rows[2]).toHaveTextContent('Glucose');    // 95
  });

  it('toggles sort direction when clicking the same column twice', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    const { container } = render(<LabResultsTable />);

    await waitFor(() => {
      expect(screen.getByText('Hemoglobin')).toBeInTheDocument();
    });

    // Click Biomarker column header for ascending sort
    const biomarkerHeader = screen.getByText('Biomarker').closest('th');
    if (biomarkerHeader) {
      biomarkerHeader.click();
    }

    // Verify ascending order
    let rows = container.querySelectorAll('tbody tr');
    expect(rows[0]).toHaveTextContent('Glucose');

    // Click again for descending sort
    if (biomarkerHeader) {
      biomarkerHeader.click();
    }

    // Verify descending order
    rows = container.querySelectorAll('tbody tr');
    expect(rows[0]).toHaveTextContent('Vitamin D');
    expect(rows[2]).toHaveTextContent('Glucose');
  });

  it('displays sort direction indicator icons', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    render(<LabResultsTable />);

    await waitFor(() => {
      expect(screen.getByText('Hemoglobin')).toBeInTheDocument();
    });

    // Date column should show active sort indicator (default sort)
    const dateHeader = screen.getByText('Date').closest('th');
    expect(dateHeader?.querySelector('svg')).toBeInTheDocument();

    // Other columns should show neutral sort indicators
    const biomarkerHeader = screen.getByText('Biomarker').closest('th');
    expect(biomarkerHeader?.querySelector('svg')).toBeInTheDocument();
  });

  it('sorts by status (flagged vs normal)', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    const { container } = render(<LabResultsTable />);

    await waitFor(() => {
      expect(screen.getByText('Hemoglobin')).toBeInTheDocument();
    });

    // Click Status column header
    const statusHeader = screen.getByText('Status').closest('th');
    if (statusHeader) {
      statusHeader.click();
    }

    // Verify order: Normal items first (false=0), then Flagged (true=1)
    const rows = container.querySelectorAll('tbody tr');
    expect(rows[0]).toHaveTextContent('Normal');
    expect(rows[1]).toHaveTextContent('Normal');
    expect(rows[2]).toHaveTextContent('Flagged');
  });
});
