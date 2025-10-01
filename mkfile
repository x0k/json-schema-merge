#!/usr/bin/env bash

set -xe

t:
  pnpm run test $@

ben:
  pnpm run bench $@

b:
  pnpm run build $@

l:
  pnpm run lint $@

f:
  pnpm run format $@

c:
  pnpm run check $@

cs:
  pnpm changeset
