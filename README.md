# SEP-R1
## Software Engineering Project - Group 1

### Overview
Library Hub is an accessible, user-friendly, and efficient digital library catalogue
system that simplifies the process of searching, borrowing, and returning books. The project aims to increase the efficiency of the library system by automating routine operations and
providing real-time updates on book availability, which supports user engagement and positive
outcomes.

## Features

- **Feature:** User can authenticate (Sign Up / Sign In) to make book reservations.

- **Feature:** Role-based authentication: Customer/Librarian.

- **Feature:** Librarians can perform basic CRUD operations for books database.

- **Feature:** Users can search and list books from the library database.

- **Feature:** Users can make an online reservation for a book for a set time-period.

- **Feature:** Users can manage their reservation state by returning the book / extend reservation periods.

- **Feature:** Penalty-system with reminders for overdue reservations.

- **Feature:** Users are unable to make reservations if restrictions apply.

- **Feature:** Users can read content in their own language.

- **Feature:** When the user logs in, the content is shown in their preferred language, which is stored in the database.

## Technology Stack

### Development Tools
- **Version Control:** Git with GitHub
- **Framework:** Next.js 15
- **Styling** TailwindCSS, shadcn UI (lucide-react)
- **Backend as a Service:** Supabase (PostgreSQL Database, Authentication, S3 Storage Bucket)

### Design Tools
- **UI/UX Design:** Figma

### Testing Tools
- **Automated Testing Framework:** Jest + React Testing Library
- **Testing Coverage:** Jest Coverage Report

### Localization
- `i18next`: Core internationalization framework.
- `react-i18next`: React bindings for i18next.
- `next-i18n-router`: Next.js routing with i18n support.
- `i18next-resources-to-backend`: Backend plugin for loading localization resources.

### CI/CD
- Docker
- GitHub Actions
- Vercel

### Code Quality and Analysis
- **Linting Tool:** ESLint
- **Code Quality Tool:** SonarQube / SonarCloud

### Project Management
- **Project Management Software:** Jira

## Use Case Diagram
![Use Case Diagram](public/LibraryHub-UseCaseDiagram.png)

## Sequence Diagrams
![Sequence Diagram](public/LibraryHub-SequenceDiagram.png)
## Database 

This [document](https://github.com/vickneee/SEP-R1/blob/main/supabase/README.md) is Supabase CLI Guide.

Database schema:

![Database Relational Schema](public/LibraryHub-RelationalSchema.png)

## Localization

This [document](LOCALIZATION.md) explains how localization is implemented in the project.

## Docker

This [document](https://github.com/vickneee/SEP-R1/blob/main/DOCKER.md) explains how to build and run the library management system using Docker.

## SonarQube / SonarCloud

This [document](SONARQUBE.md) provides instructions on how to integrate SonarQube or SonarCloud into your project for continuous code quality inspection.

## Members
- Monami Kirjavainen
- Victoria Vavulina
- Riku Kaartoaho
- Riku Toivanen
