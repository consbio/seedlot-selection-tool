#!/bin/sh
set -eo pipefail

# Extract messages using ttag
ttag update locales/es_MX/sst-js.po src

pushd locales/es_MX

# Extract untranslated messages and update MT file
rm  -f sst-js-untranslated.po && msgattrib sst-js.po --untranslated -o sst-js-untranslated.po
msgcat sst-js-mt.po sst-js-untranslated.po --use-first --force-po --no-location | \
  msgattrib - --set-obsolete --ignore-file=sst-js-untranslated.po --no-location | \
  msgattrib - --no-obsolete --no-location -o sst-js-mt.po
sed -i '' '/^#-#-#-#/d' sst-js-mt.po

# Cleanup
rm sst-js-untranslated.po

popd
