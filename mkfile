#!/usr/bin/env bash

set -xe

t:
  pnpm run test $@

ben:
  pnpm run bench $@

b:
  pnpm run build $@

c:
  pnpm run check $@

cs:
  pnpm changeset
