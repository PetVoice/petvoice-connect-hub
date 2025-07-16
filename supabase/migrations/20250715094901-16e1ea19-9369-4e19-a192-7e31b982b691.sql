-- Remove the unwanted channels (Generale and Emergenze)
DELETE FROM public.community_channels 
WHERE name IN ('🌍 Generale', '🆘 Emergenze');