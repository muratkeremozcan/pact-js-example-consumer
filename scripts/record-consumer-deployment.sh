#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Load environment variables
. ./scripts/env-setup.sh

# Only record deployment if on the main branch
if [ "$GITHUB_BRANCH" = "main" ]; then
  # Record deployment for WebConsumer
  pact-broker record-deployment \
      --pacticipant WebConsumer \
      --version $GITHUB_SHA \
      --environment $npm_config_env
  
  # Record deployment for WebConsumer-event-consumer
  pact-broker record-deployment \
      --pacticipant WebConsumer-event-consumer \
      --version $GITHUB_SHA \
      --environment $npm_config_env
fi
