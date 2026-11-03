---
title: "i18n Key Extraction & Generation - Design"
---
# Design: i18n Key Extraction & Generation

## Architecture Overview
The i18n key extraction and generation system provides tooling for managing translation keys across the A-L-L-A-H.COM ecosystem.

## Component Structure
- Key extractor (AST-based scanning of source code)
- Key generator (naming convention enforcement)
- Usage analyzer (duplicate/unused key detection)
- CLI interface for key management
- Integration with build pipeline

## Data Flow
- Source code → AST parsing → Key extraction → Key database
- Key generation → Naming convention validation → Key registration
- Usage analysis → Unused key detection → Cleanup recommendations