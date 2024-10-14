#!/bin/bash

# Load environment variables
. ./scripts/env-setup.sh

# Only run if on the main branch
if [ "$GITHUB_BRANCH" = "main" ]; then
  pact-broker record-deployment \
      --pacticipant WebConsumer \
      --version $GITHUB_SHA \
      --pacticipant WebConsumer-event-consumer \
      --version $GITHUB_SHA \
      --environment $npm_config_env
fi
