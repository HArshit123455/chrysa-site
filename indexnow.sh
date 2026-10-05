#!/usr/bin/env bash
# Push this site's URLs to IndexNow, which Bing (and so ChatGPT's browsing)
# reads within hours instead of waiting weeks for a crawl. Run it after any
# content change that is worth re-reading.
#
#   ./indexnow.sh
#
# Why keyLocation is passed explicitly: IndexNow expects the key file at the
# root of the host. This site lives at a path on a shared github.io subdomain,
# and we do not control harshit123455.github.io/, so the key sits in our own
# directory instead. Passing keyLocation is what makes that legal — and it
# limits what we may submit to URLs at or below that directory, which is
# exactly our site. On a real domain the key would sit at the root and this
# argument would go away.

set -euo pipefail

KEY='de497cb150464a7ab829e6729470b347'
HOST='harshit123455.github.io'
BASE="https://${HOST}/chrysa-site"

payload=$(cat <<JSON
{
  "host": "${HOST}",
  "key": "${KEY}",
  "keyLocation": "${BASE}/${KEY}.txt",
  "urlList": [
    "${BASE}/",
    "${BASE}/instead-of-scrolling.html",
    "${BASE}/alternatives.html",
    "${BASE}/privacy.html",
    "${BASE}/delete.html"
  ]
}
JSON
)

echo "Submitting 5 URLs to IndexNow…"
code=$(curl -sS -o /tmp/indexnow.out -w '%{http_code}' \
  -X POST 'https://api.indexnow.org/indexnow' \
  -H 'Content-Type: application/json; charset=utf-8' \
  --data "${payload}")

echo "HTTP ${code}"
case "${code}" in
  200) echo "Accepted." ;;
  202) echo "Accepted; the key is still being validated. That is normal on a first run." ;;
  400) echo "Bad request — check the JSON." ;;
  403) echo "Key not valid: ${BASE}/${KEY}.txt must serve the key and nothing else." ;;
  422) echo "A URL does not belong to the host, or does not sit under keyLocation's directory." ;;
  429) echo "Too many requests. Leave it a while." ;;
  *)   echo "Unexpected." ;;
esac
[ -s /tmp/indexnow.out ] && cat /tmp/indexnow.out || true
