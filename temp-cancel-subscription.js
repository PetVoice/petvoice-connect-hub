// Script per cancellare l'abbonamento test su Stripe
// Questo deve essere eseguito manualmente

const cancelTestSubscription = async () => {
  try {
    const response = await fetch('https://unwxkufzauulzhmjxxqi.supabase.co/functions/v1/cancel-test-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVud3hrdWZ6YXV1bHpobWp4eHFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMDcwMTIsImV4cCI6MjA2NzU4MzAxMn0.QfjmWCFEIaHzeYy0Z1gROZQchzqcCCo9In4ayqR3cXw`
      },
      body: JSON.stringify({
        email: 'mariolana12321@hotmail.com'
      })
    });

    const result = await response.json();
    console.log('Risultato cancellazione:', result);
    
    if (response.ok) {
      console.log('✅ Abbonamento cancellato con successo su Stripe!');
    } else {
      console.log('❌ Errore nella cancellazione:', result.error);
    }
  } catch (error) {
    console.log('❌ Errore di rete:', error);
  }
};

// Esegui la cancellazione
cancelTestSubscription();

console.log('🔄 Chiamata alla funzione di cancellazione inviata...');