# Supabase CLI Guide

This guide explains how to use Supabase CLI for local development of your library management system.

## What is Supabase CLI?

Supabase CLI is a command-line tool that allows you to:
- Run Supabase services locally on your machine
- Develop and test your application with a local database
- Manage database migrations and seeds
- Deploy your changes to production

## Prerequisites

Before you begin, make sure you have the following installed:

### 1. Docker Desktop
Docker Desktop is **required** for running Supabase locally.

**Installation Steps:**
1. Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
2. Install Docker Desktop for your operating system
3. Start Docker Desktop and ensure it's running
4. **Important:** Make sure Docker Desktop has at least 4GB of RAM allocated

**Verification:**
```bash
docker --version
# Should show: Docker version XX.XX.X
```

### 2. Node.js and npm
```bash
node --version
# Should show: v18.0.0 or higher

npm --version
# Should show: 8.0.0 or higher
```

### 3. Git
```bash
git --version
# Should show: git version 2.X.X
```

## Installation

Install Supabase CLI globally using npm:

```bash
npm install -g supabase
```

**Verification:**
```bash
supabase --version
# Should show: 1.X.X
```

## Project Setup

### 1. Initialize Supabase (if not already done)

If this is your first time setting up Supabase in this project:

```bash
supabase init
```

This will create the `supabase/` directory with configuration files.

### 2. Start Supabase Services

Start all Supabase services locally:

```bash
supabase start
```

This command will:
- Download required Docker images
- Start PostgreSQL database
- Start Supabase API server
- Start Supabase Studio (web interface)
- Start other services (Auth, Storage, Realtime, etc.)

**First run may take 5-10 minutes** as Docker downloads images.

### 3. Check Status

Verify all services are running:

```bash
supabase status
```

You should see output similar to:
```
supabase local development setup is running.

API URL: http://127.0.0.1:54321
DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL: http://127.0.0.1:54323
Inbucket URL: http://127.0.0.1:54324
```

## Key URLs and Ports

After starting Supabase, these services will be available:

| Service | URL | Purpose |
|---------|-----|---------|
| Supabase Studio | http://127.0.0.1:54323 | Web interface for database management |
| API | http://127.0.0.1:54321 | REST and GraphQL API endpoints |
| Database | postgresql://postgres:postgres@127.0.0.1:54322/postgres | Direct database connection |
| Email Testing | http://127.0.0.1:54324 | Test emails without sending real emails |

## Common Commands

### Development Workflow

```bash
# Start services
supabase start

# Stop services
supabase stop

# Restart services
supabase restart

# Check status
supabase status

# View logs
supabase logs
```

### Database Management

```bash
# Reset database (drops all data and re-runs migrations)
supabase db reset

# Push local changes to remote
supabase db push

# Pull remote changes to local
supabase db pull

# Create a new migration
supabase migration new "add_user_profiles_table"
```

### Authentication

```bash
# Generate types from your database
supabase gen types typescript --local > types/supabase.ts
```

## Configuration

The `config.toml` file contains all your Supabase configuration:

- **Database settings**: Port, version, pool settings
- **API settings**: Port, schemas, row limits
- **Auth settings**: Site URL, JWT expiry, password requirements
- **Storage settings**: File size limits, buckets
- **Email/SMS settings**: Templates, rate limits

## Development Workflow

### Daily Development

1. **Start your day:**
   ```bash
   supabase start
   ```

2. **Make database changes:**
   - Create/modify tables in Supabase Studio (http://127.0.0.1:54323)
   - Or create migrations for schema changes

3. **Test your application:**
   - Connect your app to `http://127.0.0.1:54321`
   - Use the local database for testing

4. **Generate types** (if using TypeScript):
   ```bash
   supabase gen types typescript --local > types/supabase.ts
   ```

### Making Schema Changes

1. **Create a migration:**
   ```bash
   supabase migration new "add_books_table"
   ```

2. **Edit the migration file** in `supabase/migrations/`

3. **Apply the migration:**
   ```bash
   supabase db reset
   ```

## Troubleshooting

### Common Issues

#### 1. Docker Issues
```bash
# Check if Docker is running
docker ps

# Restart Docker Desktop
# Then restart Supabase
supabase restart
```

#### 2. Port Conflicts
If ports are already in use:
- Check what's using the ports: `netstat -ano | findstr :54321`
- Stop the conflicting service
- Or modify ports in `config.toml`

#### 3. Database Connection Issues
```bash
# Reset database
supabase db reset

# Check database logs
supabase logs db
```

#### 4. Permission Issues (Windows)
Run terminal as Administrator or use:
```bash
supabase start --ignore-health-check
```

#### 5. Services Won't Start
```bash
# Clean restart
supabase stop
docker system prune -a  # Careful: removes all unused containers
supabase start
```

### Useful Commands

```bash
# View all logs
supabase logs

# View specific service logs
supabase logs api
supabase logs db
supabase logs auth

# Stop all services and clean up
supabase stop --no-backup
```

## Environment Variables

Create a `.env.local` file for local environment variables:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# OpenAI (for Supabase AI features)
OPENAI_API_KEY="your-openai-key"
```

## Next Steps

1. **Connect your application** to the local Supabase instance
2. **Explore Supabase Studio** at http://127.0.0.1:54323
3. **Create your database schema** using the web interface or migrations
4. **Test authentication flows** using the local auth service
5. **Set up storage buckets** if needed

## Production Deployment

When ready to deploy:

1. Create a project on [supabase.com](https://supabase.com)
2. Push your local changes: `supabase db push`
3. Update your application to use production URLs
4. Configure production environment variables

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/guides/cli)
- [Local Development Guide](https://supabase.com/docs/guides/local-development)

---

Happy coding! 🚀
