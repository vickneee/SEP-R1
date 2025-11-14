# SonarQube / SonarCloud Integration Guide

This document provides instructions on how to integrate SonarQube or SonarCloud into your project for continuous code quality inspection.

## Overview

SonarQube is an open-source platform for continuous inspection of code quality, while SonarCloud is its cloud-based counterpart. Both tools help identify bugs, vulnerabilities, and code smells in your codebase, ensuring high-quality software development.

## Prerequisites

- A SonarQube server or a SonarCloud account.
- SonarScanner installed on your local machine or CI/CD environment.
- Access to your project's source code repository.
- A SonarQube project created for your codebase.
- A SonarCloud project created for your codebase (if using SonarCloud).
- A SonarQube or SonarCloud token for authentication.
- A CI/CD pipeline set up (optional but recommended for automated analysis).
- Node.js and npm installed (if using JavaScript/TypeScript projects).

## Installation

To install SonarQube, you can either set up a local server or use a Docker container. Follow the instructions in the [official SonarQube documentation](https://www.sonarsource.com/products/sonarqube/downloads/?_gl=1*1cb3ncb*_gcl_aw*R0NMLjE3NTY4MTY4NTAuQ2p3S0NBandxOXJGQmhBSUVpd0FHVkFaUDhpSnpMWFFYOFM0U1NYN1h6YUlEVkxqYWpaVzBENFoyaFZfNFlRMnU5ejVlZ2xkdE43dnd4b0M5ZFFRQXZEX0J3RQ..*_gcl_au*MTUyODQxMjM2OC4xNzU3OTQwNjA3LjIwNDk1NTUzMjIuMTc1OTkxNTc4Ny4xNzU5OTE1Nzg2*_ga*MzU0MTY0OTcwLjE3MjY2NzExODc.*_ga_9JZ0GZ5TC6*czE3NjA2MTUyNDkkbzEyMSRnMSR0MTc2MDYxNzkwOCRqNjAkbDAkaDA.).

To install SonarScanner, follow the instructions for your operating system from the [official SonarQube documentation](https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/).

## Configuration

1. Obtain your SonarQube or SonarCloud token:
   - For SonarQube: Go to your user account security settings and generate a new token.
   - For SonarCloud: Navigate to your account security settings and create a new token.

2. Create a `sonar-project.properties` file in the root directory of your project with the following content:

   ```properties
   sonar.projectKey=your_project_key
   sonar.organization=your_organization_key (for SonarCloud)
   sonar.host.url=https://sonarcloud.io (for SonarCloud) 
   or your SonarQube server URL http://localhost:9000 (for SonarQube)
   sonar.login=your_sonar_token directly or use environment variable SONAR_TOKEN
   sonar.sources=.
   sonar.language=ts (or your project's primary language)
   sonar.sourceEncoding=UTF-8
   ```
   
3. Replace `your_project_key`, `your_organization_key`, and `your_sonar_token` with your actual project key, organization key (if using SonarCloud), and token.
4. If you're using a CI/CD pipeline, add the SonarScanner execution command to your pipeline configuration. For example, in a GitHub Actions workflow:

   ```yaml
   - name: SonarQube Scan
     run: sonar-scanner
     env:
       SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
   ```
   
## Running the Analysis (Locally example with SonarScanner)

To run the SonarQube or SonarCloud analysis, execute the following command in your project's root directory:

```bash
sonar-scanner
```

This command will analyze your codebase and send the results to your SonarQube server or SonarCloud project.

## Running the Analysis with npm Script

1. Create a `run_sonar.sh` file in the root of your project as described in the Configuration section.

You can also add a script to your `package.json` to run the SonarScanner. Add the following under the "scripts" section:

```json
"scripts": {
  "sonar:run": "bash run_sonar.sh"
}
``` 

Then, you can run the analysis using:

```bash
npm run sonar:run
```

## Viewing Results

After the analysis is complete, you can view the results in your SonarQube server or SonarCloud dashboard. The dashboard provides insights into code quality, including bugs, vulnerabilities, code smells, and test coverage.

## Conclusion

Integrating SonarQube or SonarCloud into your development workflow helps maintain high code quality and ensures that potential issues are identified early in the development process. Regularly running code analysis and addressing the findings will lead to more robust and maintainable software.
