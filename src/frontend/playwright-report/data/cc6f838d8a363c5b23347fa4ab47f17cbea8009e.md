# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: lab_upload_flow.spec.ts >> Lab Upload Flow >> empty state is displayed when no results exist
- Location: src\__tests__\e2e\lab_upload_flow.spec.ts:109:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/no lab results found/i)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/no lab results found/i)

```

```yaml
- main:
  - heading "GregMD Dashboard" [level=1]
  - paragraph: Your personal health AI agent. Upload labs to automatically extract and track your biomarkers.
  - text: Upload Lab Report Upload a PDF of your blood work or hormone panel to extract the biomarkers.
  - button "Upload lab report PDF file"
  - button "Upload" [disabled]
  - text: Recent Biomarkers
  - table:
    - rowgroup:
      - row "Date Biomarker Value Range Status":
        - columnheader "Date"
        - columnheader "Biomarker"
        - columnheader "Value"
        - columnheader "Range"
        - columnheader "Status"
    - rowgroup:
      - row "Mar 15, 2024 Hemoglobin 14.8 g/dL 13.5-17.5 Normal":
        - cell "Mar 15, 2024"
        - cell "Hemoglobin"
        - cell "14.8 g/dL"
        - cell "13.5-17.5"
        - cell "Normal"
      - row "Mar 15, 2024 Vitamin D 18.5 ng/mL 30-100 Flagged":
        - cell "Mar 15, 2024"
        - cell "Vitamin D"
        - cell "18.5 ng/mL"
        - cell "30-100"
        - cell "Flagged"
      - row "Mar 15, 2024 TSH 2.1 mIU/L 0.4-4.0 Normal":
        - cell "Mar 15, 2024"
        - cell "TSH"
        - cell "2.1 mIU/L"
        - cell "0.4-4.0"
        - cell "Normal"
  - text: "Biomarker Trends Track how your biomarkers change over time Select Biomarker:"
  - combobox "Select Biomarker:": Hemoglobin
  - list:
    - listitem:
      - img "Hemoglobin legend icon"
      - text: Hemoglobin
  - application: Mar 15, 2024 0 4 8 12 16 g/dL
- alert
```

# Test source

```ts
  11  |  */
  12  | 
  13  | test.describe("Lab Upload Flow", () => {
  14  |   test.beforeEach(async ({ page }) => {
  15  |     // Navigate to the dashboard
  16  |     await page.goto("/");
  17  |     await expect(page.getByText("GregMD Dashboard")).toBeVisible();
  18  |   });
  19  | 
  20  |   test("complete lab upload and visualization flow", async ({ page }) => {
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
> 111 |     await expect(page.getByText(/no lab results found/i)).toBeVisible();
      |                                                           ^ Error: expect(locator).toBeVisible() failed
  112 |     await expect(page.getByText(/upload a report to get started/i)).toBeVisible();
  113 | 
  114 |     // Verify chart shows empty state
  115 |     await expect(page.getByText(/no biomarker data available/i)).toBeVisible();
  116 |     await expect(page.getByText(/upload lab reports to see trends/i)).toBeVisible();
  117 |   });
  118 | 
  119 |   test("upload button is disabled when no file selected", async ({ page }) => {
  120 |     const uploadButton = page.getByRole("button", { name: /upload/i });
  121 |     await expect(uploadButton).toBeDisabled();
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