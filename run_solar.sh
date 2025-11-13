#!/bin/bash

# --- SonarCloud local scanner runner ---

# Load environment variables from .env if you have one
if [[ -f .env.local ]]; then
  export $(grep -v '^#' .env.local | xargs)
fi

# Check if SONAR_TOKEN is set
if [ -z "$SONAR_TOKEN" ]; then
  echo "❌ SONAR_TOKEN is missing!"
  echo "Add it to your .env file or export it manually:"
  echo "  export SONAR_TOKEN=your_token_here"
  exit 1
fi

echo "🚀 Running SonarCloud analysis..."

# Run sonar-scanner
sonar-scanner \
  -Dsonar.projectKey=vickneee_SEP-R1 \
  -Dsonar.organization=sep-r1 \
  -Dsonar.sources=. \
  -Dsonar.host.url=https://sonarcloud.io \
  -Dsonar.login=$SONAR_TOKEN \
  -Dsonar.sourceEncoding=UTF-8 \
  -Dsonar.exclusions="**/node_modules/**, .next/**"

echo "✅ Analysis complete. Check your project at:"
echo "   https://sonarcloud.io/project/overview?id=vickneee_SEP-R1"
