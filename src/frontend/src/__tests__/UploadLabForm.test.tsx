import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UploadLabForm } from "@/components/UploadLabForm";

// Mock the fetch API
global.fetch = jest.fn();

describe("UploadLabForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the upload form with all elements", () => {
    render(<UploadLabForm />);

    expect(screen.getByText("Upload Lab Report")).toBeInTheDocument();
    expect(screen.getByText(/Upload a PDF of your blood work/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /upload/i })).toBeInTheDocument();
  });

  it("upload button is disabled when no file is selected", () => {
    render(<UploadLabForm />);

    const uploadButton = screen.getByRole("button", { name: /upload/i });
    expect(uploadButton).toBeDisabled();
  });

  it("upload button is enabled after file selection", async () => {
    render(<UploadLabForm />);

    const file = new File(["dummy content"], "test-report.pdf", { type: "application/pdf" });
    const input = screen.getByLabelText(/upload/i) as HTMLInputElement;

    await userEvent.upload(input, file);

    const uploadButton = screen.getByRole("button", { name: /upload/i });
    expect(uploadButton).not.toBeDisabled();
  });

  it("displays success message after successful upload", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ report_id: 1, status: "processing", message: "Success" }),
    });

    render(<UploadLabForm />);

    const file = new File(["dummy content"], "test-report.pdf", { type: "application/pdf" });
    const input = screen.getByLabelText(/upload/i) as HTMLInputElement;

    await userEvent.upload(input, file);

    const uploadButton = screen.getByRole("button", { name: /upload/i });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/File uploaded successfully/i)).toBeInTheDocument();
    });
  });

  it("displays error message when upload fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Upload failed" }),
    });

    render(<UploadLabForm />);

    const file = new File(["dummy content"], "test-report.pdf", { type: "application/pdf" });
    const input = screen.getByLabelText(/upload/i) as HTMLInputElement;

    await userEvent.upload(input, file);

    const uploadButton = screen.getByRole("button", { name: /upload/i });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/Upload failed/i)).toBeInTheDocument();
    });
  });

  it("displays error message on network error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    render(<UploadLabForm />);

    const file = new File(["dummy content"], "test-report.pdf", { type: "application/pdf" });
    const input = screen.getByLabelText(/upload/i) as HTMLInputElement;

    await userEvent.upload(input, file);

    const uploadButton = screen.getByRole("button", { name: /upload/i });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });

  it("disables input and button while uploading", async () => {
    (global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ report_id: 1, status: "processing" }),
              }),
            100,
          ),
        ),
    );

    render(<UploadLabForm />);

    const file = new File(["dummy content"], "test-report.pdf", { type: "application/pdf" });
    const input = screen.getByLabelText(/upload/i) as HTMLInputElement;

    await userEvent.upload(input, file);

    const uploadButton = screen.getByRole("button", { name: /upload/i });
    fireEvent.click(uploadButton);

    // Check that button is disabled during upload
    expect(screen.getByRole("button", { name: /uploading/i })).toBeDisabled();
    expect(input).toBeDisabled();

    // Wait for upload to complete
    await waitFor(() => {
      expect(screen.getByText(/File uploaded successfully/i)).toBeInTheDocument();
    });
  });

  it("sends correct API request on upload", async () => {
    const mockFetch = global.fetch as jest.Mock;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ report_id: 1, status: "processing" }),
    });

    render(<UploadLabForm />);

    const file = new File(["dummy content"], "test-report.pdf", { type: "application/pdf" });
    const input = screen.getByLabelText(/upload/i) as HTMLInputElement;

    await userEvent.upload(input, file);

    const uploadButton = screen.getByRole("button", { name: /upload/i });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/labs/upload"),
        expect.objectContaining({
          method: "POST",
          body: expect.any(FormData),
        }),
      );
    });
  });

  it("polls status endpoint after upload and displays polite error message on failure", async () => {
    const mockFetch = global.fetch as jest.Mock;

    // First call: successful upload
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ report_id: 123, status: "processing" }),
    });

    // Second call: status check returns failed with error message
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        report_id: 123,
        status: "failed",
        error_message:
          "We couldn't find any lab results in this document. Please ensure it's a medical lab report with biomarker data.",
      }),
    });

    jest.useFakeTimers();
    render(<UploadLabForm />);

    const file = new File(["dummy content"], "test-report.pdf", { type: "application/pdf" });
    const input = screen.getByLabelText(/upload/i) as HTMLInputElement;

    await userEvent.upload(input, file);

    const uploadButton = screen.getByRole("button", { name: /upload/i });
    fireEvent.click(uploadButton);

    // Wait for upload to complete
    await waitFor(() => {
      expect(screen.getByText(/Extracting lab results/i)).toBeInTheDocument();
    });

    // Advance timers to trigger polling
    jest.advanceTimersByTime(2000);

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/couldn't find any lab results/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/medical lab report with biomarker data/i)).toBeInTheDocument();

    jest.useRealTimers();
  });

  it("polls status endpoint and displays success message when extraction completes", async () => {
    const mockFetch = global.fetch as jest.Mock;

    // First call: successful upload
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ report_id: 456, status: "processing" }),
    });

    // Second call: status check returns complete
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        report_id: 456,
        status: "complete",
        error_message: null,
      }),
    });

    jest.useFakeTimers();
    render(<UploadLabForm />);

    const file = new File(["dummy content"], "test-report.pdf", { type: "application/pdf" });
    const input = screen.getByLabelText(/upload/i) as HTMLInputElement;

    await userEvent.upload(input, file);

    const uploadButton = screen.getByRole("button", { name: /upload/i });
    fireEvent.click(uploadButton);

    // Wait for upload to complete
    await waitFor(() => {
      expect(screen.getByText(/Extracting lab results/i)).toBeInTheDocument();
    });

    // Advance timers to trigger polling
    jest.advanceTimersByTime(2000);

    // Wait for success message to appear
    await waitFor(() => {
      expect(screen.getByText(/extracted successfully/i)).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it("stops polling when status becomes complete or failed", async () => {
    const mockFetch = global.fetch as jest.Mock;

    // Upload succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ report_id: 789, status: "processing" }),
    });

    // Status check returns complete
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ report_id: 789, status: "complete", error_message: null }),
    });

    jest.useFakeTimers();
    render(<UploadLabForm />);

    const file = new File(["dummy content"], "test-report.pdf", { type: "application/pdf" });
    const input = screen.getByLabelText(/upload/i) as HTMLInputElement;

    await userEvent.upload(input, file);

    const uploadButton = screen.getByRole("button", { name: /upload/i });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/Extracting lab results/i)).toBeInTheDocument();
    });

    // Trigger first poll
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.getByText(/extracted successfully/i)).toBeInTheDocument();
    });

    // Clear mock call history
    mockFetch.mockClear();

    // Advance timers again - should NOT trigger another status check
    jest.advanceTimersByTime(5000);

    // Verify no additional fetch calls were made
    expect(mockFetch).not.toHaveBeenCalled();

    jest.useRealTimers();
  });
});
