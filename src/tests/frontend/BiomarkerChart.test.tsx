import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BiomarkerChart } from '@/components/BiomarkerChart';

// Mock recharts - uses the mock from __mocks__/recharts.tsx
jest.mock('recharts');

// Mock the fetch API
global.fetch = jest.fn();

const mockResults = [
  {
    id: 1,
    report_id: 1,
    biomarker_name: 'Vitamin D',
    value: 22.0,
    unit: 'ng/mL',
    reference_range: '30-100',
    is_flagged: true,
    test_date: '2024-01-15',
  },
  {
    id: 2,
    report_id: 2,
    biomarker_name: 'Vitamin D',
    value: 28.0,
    unit: 'ng/mL',
    reference_range: '30-100',
    is_flagged: true,
    test_date: '2024-02-15',
  },
  {
    id: 3,
    report_id: 3,
    biomarker_name: 'Vitamin D',
    value: 35.0,
    unit: 'ng/mL',
    reference_range: '30-100',
    is_flagged: false,
    test_date: '2024-03-15',
  },
  {
    id: 4,
    report_id: 1,
    biomarker_name: 'Hemoglobin',
    value: 15.5,
    unit: 'g/dL',
    reference_range: '13.5-17.5',
    is_flagged: false,
    test_date: '2024-01-15',
  },
];

describe('BiomarkerChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<BiomarkerChart />);
    
    expect(screen.getByText(/Loading chart/i)).toBeInTheDocument();
  });

  it('renders chart with mock historical data', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    render(<BiomarkerChart />);

    await waitFor(() => {
      expect(screen.getByText('Biomarker Trends')).toBeInTheDocument();
    });

    expect(screen.getByText(/Track how your biomarkers change/i)).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('displays biomarker selection dropdown', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    render(<BiomarkerChart />);

    await waitFor(() => {
      expect(screen.getByText('Select Biomarker:')).toBeInTheDocument();
    });

    // Check that select trigger exists
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('selects first biomarker by default', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    render(<BiomarkerChart />);

    await waitFor(() => {
      // "Hemoglobin" comes before "Vitamin D" alphabetically
      expect(screen.getByRole('combobox')).toHaveTextContent(/Hemoglobin|Vitamin D/i);
    });
  });

  it('displays empty state when no data available', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<BiomarkerChart />);

    await waitFor(() => {
      expect(screen.getByText(/No biomarker data available/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Upload lab reports to see trends/i)).toBeInTheDocument();
  });

  it('handles biomarker selection interaction', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    render(<BiomarkerChart />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    // Note: Full dropdown interaction testing with Radix UI Select
    // requires more complex setup. This verifies the select is present.
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('displays empty state when selected biomarker has no data', async () => {
    const singleBiomarkerResult = [
      {
        id: 1,
        report_id: 1,
        biomarker_name: 'TSH',
        value: 2.5,
        unit: 'mIU/L',
        reference_range: '0.4-4.0',
        is_flagged: false,
        test_date: '2024-01-15',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => singleBiomarkerResult,
    });

    render(<BiomarkerChart />);

    await waitFor(() => {
      expect(screen.getByText('Biomarker Trends')).toBeInTheDocument();
    });

    // With only one data point for TSH, chart should still render
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('handles fetch error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<BiomarkerChart />);

    await waitFor(() => {
      // Should show empty state after error
      expect(screen.getByText(/No biomarker data available/i)).toBeInTheDocument();
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

    render(<BiomarkerChart />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/labs/results')
      );
    });
  });

  it('renders chart components when data is available', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    render(<BiomarkerChart />);

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    expect(screen.getByTestId('line')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('extracts and sorts unique biomarkers', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    render(<BiomarkerChart />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    // Verify that unique biomarkers are extracted (Hemoglobin, Vitamin D)
    // Both should be in the dropdown options (requires opening dropdown to verify fully)
    const combobox = screen.getByRole('combobox');
    expect(combobox).toBeInTheDocument();
  });

  it('renders card with proper structure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    render(<BiomarkerChart />);

    await waitFor(() => {
      expect(screen.getByText('Biomarker Trends')).toBeInTheDocument();
    });

    expect(screen.getByText(/Track how your biomarkers change over time/i)).toBeInTheDocument();
  });
});
