# Onboarding Guide

This guide explains how to set up the Tmura repository locally.

## Prerequisites

1. **Node.js** (v20 or higher)
2. **Git** (with submodule support)
3. **Python** (for Livemark static site generation)
4. **Mathematica / Wolfram Engine** (for evidence and PoCs)

## Initial Setup

Clone the repository including the Archify submodule:

git clone --recursive https://github.com/NepoPetro/Tmura.git
cd Tmura

Install the Node dependencies:

npm install

## Running the Pipeline

Validate all Archify JSON files against the official schema:

npm run validate

Generate draw.io files from the JSON sources:

npm run export:drawio

Render Archify diagrams to HTML (requires the candidate hash from the validate step):

node vendor/archify/archify/bin/archify.mjs finalize <type> <input.json> <output.html> --quality standard --candidate-sha256 <HASH> --json

## Building the Documentation Site

To regenerate the static HTML files for the ADRs and README:

python -m livemark build README.md --target docs/README.html
python -m livemark build docs/adrs -o docs/adrs-html
