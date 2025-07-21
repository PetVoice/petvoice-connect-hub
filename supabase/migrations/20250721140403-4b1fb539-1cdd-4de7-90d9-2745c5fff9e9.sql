UPDATE private_chats 
SET deleted_by_participant_1 = false, 
    deleted_by_participant_2 = false,
    updated_at = NOW()
WHERE id = 'd46b1896-e133-454b-9aa2-4c49f7ea09c9';