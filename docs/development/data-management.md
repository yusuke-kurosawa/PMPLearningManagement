# Data Directory

This directory contains all project data including input sources, documentation, and reference materials.

## Directory Structure

```
data/
├── input/              # Source data and documentation
│   ├── pmbok/         # PMBOK guides and reference materials
│   │   ├── PMBOKガイド第７版（日本語訳）.pdf
│   │   ├── knowledge_areas.md
│   │   └── process_groups.md
│   ├── references/    # External references
│   ├── samples/       # Sample data files
│   └── templates/     # Data templates
└── output/            # Generated or processed data files
```

## Input Data Sources

### PMBOK Materials

- **PMBOKガイド第７版（日本語訳）.pdf**: Official PMBOK Guide 7th Edition in Japanese
- **アジャイル実務ガイド.pdf**: Agile Practice Guide
- **knowledge_areas.md**: Knowledge areas documentation
- **process_groups.md**: Process groups documentation

### Templates

- **glossary_template.csv**: Template for glossary entries
- **itto_relationship_template.json**: Template for ITTO relationships
- **process_template.json**: Template for process definitions

### Sample Data

- **sample_processes.json**: Example process data structure

## Usage Notes

- Input data should not be modified directly in the application
- Use the templates to maintain consistent data structure
- Generated or processed data goes in the `output/` directory
- All PDF files require appropriate handling for text extraction
