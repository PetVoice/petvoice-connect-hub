-- Translate remaining Italian instructions to English in ai_training_exercises
UPDATE ai_training_exercises SET instructions = 
CASE 
    WHEN instructions = '[Simula arrivo di ospiti (campanello, bussare) Pet deve sedersi e aspettare prima che tu apra Mantieni pet in posizione durante "saluti" simulati Premia calma e controllo, ignora eccitazione Ripeti scenario 4-5 volte per sessione Aumenta gradualmente durata della interazione]' 
    THEN '[Simulate guest arrival (doorbell, knocking) Pet must sit and wait before you open Keep pet in position during simulated "greetings" Reward calm and control, ignore excitement Repeat scenario 4-5 times per session Gradually increase interaction duration]'
    
    WHEN instructions = '[Mostra preparativi per trigger before presenting it Osserva se animale mostra anticipo positivo Rinforza massivamente segnali di eccitazione vs paura Permetti all''animale di avvicinarsi autonomamente Se si avvicina, jackpot di rinforzi Documenta transizione da evitamento a ricerca]' 
    THEN '[Show trigger preparations before presenting it Observe if animal shows positive anticipation Massively reinforce excitement signals vs fear Allow animal to approach autonomously If it approaches, jackpot of reinforcements Document transition from avoidance to seeking]'
    
    WHEN instructions = '[La persona sconosciuta deve ignorare l''animale e parlare solo con te Lascia che l''animale decida se e quando avvicinarsi Ricompensa ogni movimento volontario verso la persona La persona non deve toccare o parlare all''animale inizialmente Mantieni sessione breve e termina con successo positivo BODY LANGUAGE: Osserva approach e retreat patterns dell''animale BODY LANGUAGE: Cerca segnali di interesse come sniffing volontario BODY LANGUAGE: Valuta stress signs e interrompi se necessario]' 
    THEN '[The stranger must ignore the animal and speak only to you Let the animal decide if and when to approach Reward every voluntary movement toward the person The person must not touch or speak to the animal initially Keep session brief and end with positive success BODY LANGUAGE: Observe animal''s approach and retreat patterns BODY LANGUAGE: Look for interest signals like voluntary sniffing BODY LANGUAGE: Assess stress signs and stop if necessary]'
    
    ELSE instructions
END
WHERE instructions LIKE '%[%]%' AND (
    instructions LIKE '%Simula%' OR 
    instructions LIKE '%Mostra%' OR 
    instructions LIKE '%La persona sconosciuta%'
);