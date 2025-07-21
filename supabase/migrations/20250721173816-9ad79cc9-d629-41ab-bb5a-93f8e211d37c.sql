-- APPROCCIO SELETTIVO: rimuovere solo i trigger creati da noi, non quelli di sistema

-- 1. Prima verifica quali trigger esistono che NON sono constraint trigger di sistema
SELECT tgname, prosrc 
FROM pg_trigger t 
JOIN pg_class c ON c.oid = t.tgrelid 
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE c.relname = 'subscribers' 
  AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND NOT t.tgisinternal  -- Esclude trigger interni di sistema
  AND tgname NOT LIKE 'RI_ConstraintTrigger%'  -- Esclude trigger di constraint
ORDER BY tgname;