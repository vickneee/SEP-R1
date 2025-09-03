# VS Code Settings

This directory contains shared VS Code configuration for the project.

## Setup Instructions

1. **Copy the default settings:**
   ```bash
   cp .vscode/settings.default.json .vscode/settings.json
   ```

2. **Customize as needed:**
   - Add your personal preferences (themes, font sizes, etc.)
   - The `settings.json` file is ignored by git, so personal changes won't be committed

## What's Included

The default settings include:
- **Deno configuration** for Supabase Edge Functions
- **TypeScript formatter** set to use Deno
- **Linting enabled** for better code quality

## Important Notes

- **Never commit `settings.json`** - it's ignored for personal customization
- **Always commit changes to `settings.default.json`** - this ensures all team members get project settings
- **Test settings after copying** - make sure Deno extension is working properly

## Troubleshooting

If you don't see the Deno language server working:
1. Make sure you have the Deno VS Code extension installed
2. Reload VS Code window (`Ctrl/Cmd + Shift + P` → "Developer: Reload Window")
3. Check that the settings.json file exists in .vscode/
