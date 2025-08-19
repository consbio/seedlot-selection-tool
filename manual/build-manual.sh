#!/bin/bash
set -eo pipefail

asciidoctor-pdf -r asciidoctor-mathematical -o "../javascript/documents/SST User Guide.pdf" index.adoc
asciidoctor-pdf -r asciidoctor-mathematical -o "../javascript/documents/translations/es_MX/SST User Guide.pdf" translations/es_MX/index.adoc
