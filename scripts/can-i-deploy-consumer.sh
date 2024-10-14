#!/bin/bash

# Load environment variables
. ./scripts/env-setup.sh

# Run the can-i-deploy check for both WebConsumer and WebConsumer-event-consumer
pact-broker can-i-deploy \
    --pacticipant WebConsumer \
    --version=$GITHUB_SHA \
    --pacticipant WebConsumer-event-consumer \
    --version=$GITHUB_SHA \
    --to-environment dev \
    --retry-while-unknown=10
