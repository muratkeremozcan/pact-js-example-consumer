#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Load environment variables
. ./scripts/env-setup.sh

# Wait longer for provider verification
RETRY_WHILE_UNKNOWN=4   # Number of retries
RETRY_INTERVAL=80       # Seconds between retries

# Check if WebConsumer can be deployed
PACT_BREAKING_CHANGE=${PACT_BREAKING_CHANGE:-false}

if [ "$PACT_BREAKING_CHANGE" = "true" ]; then
  echo "Breaking change detected. Running can-i-deploy only against matching branch."
  pact-broker can-i-deploy \
      --pacticipant WebConsumer \
      --version=$GITHUB_SHA \
      --to-environment dev \
      --retry-while-unknown=$RETRY_WHILE_UNKNOWN \
      --retry-interval=$RETRY_INTERVAL \
      --consumer-version-selector matchingBranch \
      --verbose
else
  echo "No breaking change. Running can-i-deploy against matching branch + main + deployed."
  pact-broker can-i-deploy \
      --pacticipant WebConsumer \
      --version=$GITHUB_SHA \
      --to-environment dev \
      --retry-while-unknown=$RETRY_WHILE_UNKNOWN \
      --retry-interval=$RETRY_INTERVAL \
      --verbose
fi
