# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: lab_upload_flow.spec.ts >> Lab Upload Flow >> upload button is disabled when no file selected
- Location: src\__tests__\e2e\lab_upload_flow.spec.ts:119:7

# Error details

```
Error: expect(locator).toBeDisabled() failed

Locator: getByRole('button', { name: /upload/i })
Expected: disabled
Error: strict mode violation: getByRole('button', { name: /upload/i }) resolved to 2 elements:
    1) <input type="file" accept=".pdf" data-slot="input" id="lab-report-upload" aria-label="Upload lab report PDF file" class="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-no…/> aka getByRole('button', { name: 'Upload lab report PDF file' })
    2) <button disabled tabindex="0" type="button" data-disabled="" data-slot="button" class="group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-inva…>…</button> aka getByRole('button', { name: 'Upload', exact: true })

Call log:
  - Expect "toBeDisabled" with timeout 5000ms
  - waiting for getByRole('button', { name: /upload/i })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - heading "GregMD Dashboard" [level=1] [ref=e5]
        - paragraph [ref=e6]: Your personal health AI agent. Upload labs to automatically extract and track your biomarkers.
      - generic [ref=e7]:
        - generic [ref=e9]:
          - generic [ref=e10]:
            - generic [ref=e11]: Upload Lab Report
            - generic [ref=e12]: Upload a PDF of your blood work or hormone panel to extract the biomarkers.
          - generic [ref=e15]:
            - button "Upload lab report PDF file" [ref=e16]
            - button "Upload" [disabled]:
              - img
              - text: Upload
        - generic [ref=e17]:
          - generic [ref=e18]: Loading lab results...
          - generic [ref=e21]: Loading chart...
  - button "Open Next.js Dev Tools" [ref=e27] [cursor=pointer]:
    - img [ref=e28]
  - alert [ref=e31]
```

# Test source

```ts
  21  |     // Step 1: Verify initial state
  22  |     await expect(page.getByText("Upload Lab Report")).toBeVisible();
  23  |     await expect(page.getByText("No lab results found")).toBeVisible();
  24  | 
  25  |     // Step 2: Prepare a sample PDF file
  26  |     // Note: In a real scenario, you'd have a sample PDF in your test fixtures
  27  |     // For this test, we'll create a minimal PDF or use a test fixture
  28  |     const samplePdfPath = path.join(__dirname, "..", "fixtures", "sample-lab-report.pdf");
  29  | 
  30  |     // Check if the sample PDF exists (for demo purposes, we'll skip if it doesn't)
  31  |     if (!fs.existsSync(samplePdfPath)) {
  32  |       test.skip();
  33  |       return;
  34  |     }
  35  | 
  36  |     // Step 3: Upload the PDF file
  37  |     const fileInput = page.locator('input[type="file"]');
  38  |     await fileInput.setInputFiles(samplePdfPath);
  39  | 
  40  |     // Step 4: Click the upload button
  41  |     const uploadButton = page.getByRole("button", { name: /upload/i });
  42  |     await expect(uploadButton).toBeEnabled();
  43  |     await uploadButton.click();
  44  | 
  45  |     // Step 5: Wait for success message
  46  |     await expect(page.getByText(/file uploaded successfully/i)).toBeVisible({ timeout: 10000 });
  47  | 
  48  |     // Step 6: Wait for processing to complete and results to appear
  49  |     // In a real scenario, we'd poll the status endpoint or wait for results
  50  |     // For this test, we'll wait for the table to update
  51  |     await page.waitForTimeout(2000); // Give backend time to process
  52  | 
  53  |     // Reload to fetch latest results
  54  |     await page.reload();
  55  | 
  56  |     // Step 7: Verify table displays results
  57  |     await expect(page.getByText("Recent Biomarkers")).toBeVisible();
  58  | 
  59  |     // Check that at least one biomarker is displayed
  60  |     const tableRows = page.locator("table tbody tr");
  61  |     await expect(tableRows).not.toHaveCount(0);
  62  | 
  63  |     // Verify table columns are present
  64  |     await expect(page.getByText("Date")).toBeVisible();
  65  |     await expect(page.getByText("Biomarker")).toBeVisible();
  66  |     await expect(page.getByText("Value")).toBeVisible();
  67  |     await expect(page.getByText("Range")).toBeVisible();
  68  |     await expect(page.getByText("Status")).toBeVisible();
  69  | 
  70  |     // Step 8: Verify chart renders
  71  |     await expect(page.getByText("Biomarker Trends")).toBeVisible();
  72  |     await expect(page.getByText("Select Biomarker:")).toBeVisible();
  73  | 
  74  |     // Verify that the chart is rendered (check for Recharts SVG)
  75  |     const chartContainer = page.locator(".recharts-wrapper");
  76  |     await expect(chartContainer).toBeVisible();
  77  | 
  78  |     // Step 9: Test biomarker selection in chart
  79  |     const biomarkerSelect = page.locator('button[id="biomarker-select"]');
  80  |     await biomarkerSelect.click();
  81  | 
  82  |     // Select a biomarker from the dropdown
  83  |     const firstOption = page.locator('[role="option"]').first();
  84  |     await firstOption.click();
  85  | 
  86  |     // Verify chart updates (by checking that SVG is still present)
  87  |     await expect(chartContainer).toBeVisible();
  88  |   });
  89  | 
  90  |   test("upload form validation - non-PDF file", async ({ page }) => {
  91  |     // Try to upload a non-PDF file
  92  |     const textContent = "This is not a PDF file";
  93  |     const buffer = Buffer.from(textContent);
  94  | 
  95  |     await page.locator('input[type="file"]').setInputFiles({
  96  |       name: "test.txt",
  97  |       mimeType: "text/plain",
  98  |       buffer: buffer,
  99  |     });
  100 | 
  101 |     const uploadButton = page.getByRole("button", { name: /upload/i });
  102 |     await expect(uploadButton).toBeEnabled();
  103 |     await uploadButton.click();
  104 | 
  105 |     // Verify error message is displayed
  106 |     await expect(page.getByText(/only pdf files are supported/i)).toBeVisible({ timeout: 5000 });
  107 |   });
  108 | 
  109 |   test("empty state is displayed when no results exist", async ({ page }) => {
  110 |     // Verify that empty state is shown initially
  111 |     await expect(page.getByText(/no lab results found/i)).toBeVisible();
  112 |     await expect(page.getByText(/upload a report to get started/i)).toBeVisible();
  113 | 
  114 |     // Verify chart shows empty state
  115 |     await expect(page.getByText(/no biomarker data available/i)).toBeVisible();
  116 |     await expect(page.getByText(/upload lab reports to see trends/i)).toBeVisible();
  117 |   });
  118 | 
  119 |   test("upload button is disabled when no file selected", async ({ page }) => {
  120 |     const uploadButton = page.getByRole("button", { name: /upload/i });
> 121 |     await expect(uploadButton).toBeDisabled();
      |                                ^ Error: expect(locator).toBeDisabled() failed
  122 |   });
  123 | 
  124 |   test("flagged biomarkers are highlighted in table", async ({ page }) => {
  125 |     // This test assumes data already exists in the database
  126 |     // You would seed test data before running this test
  127 | 
  128 |     // Look for flagged badges in the table
  129 |     const flaggedBadge = page.getByText("Flagged", { exact: true });
  130 | 
  131 |     // If flagged data exists, verify the badge is visible
  132 |     // If no flagged data, this test will be skipped
  133 |     const count = await flaggedBadge.count();
  134 |     if (count > 0) {
  135 |       await expect(flaggedBadge.first()).toBeVisible();
  136 |     }
  137 |   });
  138 | 
  139 |   test("chart displays multiple data points over time", async ({ page }) => {
  140 |     // This test assumes historical data exists in the database
  141 |     // Verify that the chart can display time series data
  142 | 
  143 |     const chartContainer = page.locator(".recharts-wrapper");
  144 |     const chartExists = await chartContainer.count();
  145 | 
  146 |     if (chartExists > 0) {
  147 |       await expect(chartContainer).toBeVisible();
  148 | 
  149 |       // Verify X-axis (dates) and Y-axis are present
  150 |       const xAxis = page.locator(".recharts-xAxis");
  151 |       const yAxis = page.locator(".recharts-yAxis");
  152 | 
  153 |       await expect(xAxis).toBeVisible();
  154 |       await expect(yAxis).toBeVisible();
  155 |     }
  156 |   });
  157 | });
  158 | 
  159 | test.describe("API Integration", () => {
  160 |   test("backend health check endpoint is accessible", async ({ request }) => {
  161 |     const response = await request.get("http://localhost:8000/api/v1/health");
  162 |     expect(response.ok()).toBeTruthy();
  163 | 
  164 |     const data = await response.json();
  165 |     expect(data).toHaveProperty("status", "ok");
  166 |   });
  167 | 
  168 |   test("results endpoint returns valid data structure", async ({ request }) => {
  169 |     const response = await request.get("http://localhost:8000/api/v1/labs/results");
  170 |     expect(response.ok()).toBeTruthy();
  171 | 
  172 |     const data = await response.json();
  173 |     expect(Array.isArray(data)).toBeTruthy();
  174 | 
  175 |     // If data exists, verify structure
  176 |     if (data.length > 0) {
  177 |       const firstResult = data[0];
  178 |       expect(firstResult).toHaveProperty("id");
  179 |       expect(firstResult).toHaveProperty("biomarker_name");
  180 |       expect(firstResult).toHaveProperty("value");
  181 |       expect(firstResult).toHaveProperty("unit");
  182 |       expect(firstResult).toHaveProperty("test_date");
  183 |     }
  184 |   });
  185 | });
  186 | 
```