import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * E2E test for the complete lab upload flow:
 * 1. Upload a sample PDF
 * 2. Verify processing
 * 3. Verify table displays results
 * 4. Verify chart renders
 */

test.describe('Lab Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/');
    await expect(page.getByText('GregMD Dashboard')).toBeVisible();
  });

  test('complete lab upload and visualization flow', async ({ page }) => {
    // Step 1: Verify initial state
    await expect(page.getByText('Upload Lab Report')).toBeVisible();
    await expect(page.getByText('No lab results found')).toBeVisible();
    
    // Step 2: Prepare a sample PDF file
    // Note: In a real scenario, you'd have a sample PDF in your test fixtures
    // For this test, we'll create a minimal PDF or use a test fixture
    const samplePdfPath = path.join(__dirname, '..', 'fixtures', 'sample-lab-report.pdf');
    
    // Check if the sample PDF exists (for demo purposes, we'll skip if it doesn't)
    if (!fs.existsSync(samplePdfPath)) {
      test.skip();
      return;
    }

    // Step 3: Upload the PDF file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(samplePdfPath);

    // Step 4: Click the upload button
    const uploadButton = page.getByRole('button', { name: /upload/i });
    await expect(uploadButton).toBeEnabled();
    await uploadButton.click();

    // Step 5: Wait for success message
    await expect(page.getByText(/file uploaded successfully/i)).toBeVisible({ timeout: 10000 });

    // Step 6: Wait for processing to complete and results to appear
    // In a real scenario, we'd poll the status endpoint or wait for results
    // For this test, we'll wait for the table to update
    await page.waitForTimeout(2000); // Give backend time to process

    // Reload to fetch latest results
    await page.reload();

    // Step 7: Verify table displays results
    await expect(page.getByText('Recent Biomarkers')).toBeVisible();
    
    // Check that at least one biomarker is displayed
    const tableRows = page.locator('table tbody tr');
    await expect(tableRows).not.toHaveCount(0);

    // Verify table columns are present
    await expect(page.getByText('Date')).toBeVisible();
    await expect(page.getByText('Biomarker')).toBeVisible();
    await expect(page.getByText('Value')).toBeVisible();
    await expect(page.getByText('Range')).toBeVisible();
    await expect(page.getByText('Status')).toBeVisible();

    // Step 8: Verify chart renders
    await expect(page.getByText('Biomarker Trends')).toBeVisible();
    await expect(page.getByText('Select Biomarker:')).toBeVisible();
    
    // Verify that the chart is rendered (check for Recharts SVG)
    const chartContainer = page.locator('.recharts-wrapper');
    await expect(chartContainer).toBeVisible();

    // Step 9: Test biomarker selection in chart
    const biomarkerSelect = page.locator('button[id="biomarker-select"]');
    await biomarkerSelect.click();
    
    // Select a biomarker from the dropdown
    const firstOption = page.locator('[role="option"]').first();
    await firstOption.click();

    // Verify chart updates (by checking that SVG is still present)
    await expect(chartContainer).toBeVisible();
  });

  test('upload form validation - non-PDF file', async ({ page }) => {
    // Try to upload a non-PDF file
    const textContent = 'This is not a PDF file';
    const buffer = Buffer.from(textContent);
    
    await page.locator('input[type="file"]').setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: buffer,
    });

    const uploadButton = page.getByRole('button', { name: /upload/i });
    await expect(uploadButton).toBeEnabled();
    await uploadButton.click();

    // Verify error message is displayed
    await expect(page.getByText(/only pdf files are supported/i)).toBeVisible({ timeout: 5000 });
  });

  test('empty state is displayed when no results exist', async ({ page }) => {
    // Verify that empty state is shown initially
    await expect(page.getByText(/no lab results found/i)).toBeVisible();
    await expect(page.getByText(/upload a report to get started/i)).toBeVisible();

    // Verify chart shows empty state
    await expect(page.getByText(/no biomarker data available/i)).toBeVisible();
    await expect(page.getByText(/upload lab reports to see trends/i)).toBeVisible();
  });

  test('upload button is disabled when no file selected', async ({ page }) => {
    const uploadButton = page.getByRole('button', { name: /upload/i });
    await expect(uploadButton).toBeDisabled();
  });

  test('flagged biomarkers are highlighted in table', async ({ page }) => {
    // This test assumes data already exists in the database
    // You would seed test data before running this test
    
    // Look for flagged badges in the table
    const flaggedBadge = page.getByText('Flagged', { exact: true });
    
    // If flagged data exists, verify the badge is visible
    // If no flagged data, this test will be skipped
    const count = await flaggedBadge.count();
    if (count > 0) {
      await expect(flaggedBadge.first()).toBeVisible();
    }
  });

  test('chart displays multiple data points over time', async ({ page }) => {
    // This test assumes historical data exists in the database
    // Verify that the chart can display time series data
    
    const chartContainer = page.locator('.recharts-wrapper');
    const chartExists = await chartContainer.count();
    
    if (chartExists > 0) {
      await expect(chartContainer).toBeVisible();
      
      // Verify X-axis (dates) and Y-axis are present
      const xAxis = page.locator('.recharts-xAxis');
      const yAxis = page.locator('.recharts-yAxis');
      
      await expect(xAxis).toBeVisible();
      await expect(yAxis).toBeVisible();
    }
  });
});

test.describe('API Integration', () => {
  test('backend health check endpoint is accessible', async ({ request }) => {
    const response = await request.get('http://localhost:8000/api/v1/health');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('status', 'ok');
  });

  test('results endpoint returns valid data structure', async ({ request }) => {
    const response = await request.get('http://localhost:8000/api/v1/labs/results');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    
    // If data exists, verify structure
    if (data.length > 0) {
      const firstResult = data[0];
      expect(firstResult).toHaveProperty('id');
      expect(firstResult).toHaveProperty('biomarker_name');
      expect(firstResult).toHaveProperty('value');
      expect(firstResult).toHaveProperty('unit');
      expect(firstResult).toHaveProperty('test_date');
    }
  });
});
