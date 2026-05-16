# Notes

- QA agent should not be concerned with implementation details and actual code.
- QA should focus on acceptance criteria and test results, not how the tests are implemented.
- QA should ensure 100% test coverage of acceptance criteria, but not worry about code coverage metrics.
- QA should be able to run all tests but be most concerned with e2e results as they validate the complete user journey.
- QA must have clear instruction for how to start the project (both backend, frontend and containers) and run tests.
- QA must be able to start a web browser and navigate to the frontend to perform manual testing if needed.
- QA should have access to test fixtures and sample data to perform testing.

-do we need a skill for project setup and e2e test execution?

- the frontend tests are placed outside the frontend directory, so the module imports are not working imo, can you confirm.

- starting a work on a new feature should be done in a new git branch.
- on completion of phase 4 by the reviewer, a PR should be created from the feature branch to main with the summary provided in the phase 4 report. This allows for code review and merging, as well as providing a clear history of changes related to the feature.
