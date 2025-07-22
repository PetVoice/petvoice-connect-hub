-- Remove affiliate program from the user guide knowledge base
UPDATE support_knowledge_base
SET content = REPLACE(content, '- **Programma Affiliazione**: Invita amici e guadagna con il programma affiliazione', '')
WHERE title LIKE '%Guida%' OR category = 'guide';