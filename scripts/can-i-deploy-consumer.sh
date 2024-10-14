#!/bin/bash

# Load environment variables
. ./scripts/env-setup.sh

# Check if WebConsumer can be deployed
pact-broker can-i-deploy \
    --pacticipant WebConsumer \
    --version=$GITHUB_SHA \
    --to-environment dev \
    --retry-while-unknown=10

# Check if WebConsumer-event-consumer can be deployed
pact-broker can-i-deploy \
    --pacticipant WebConsumer-event-consumer \
    --version=$GITHUB_SHA \
    --to-environment dev \
    --retry-while-unknown=10
