import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { AnalysisData } from '../hooks/useAnalysisData';

export const generateAnalysisPDF = (analysis: AnalysisData): jsPDF => {
  try {
    const pdf = new jsPDF();
    pdf.setFont('helvetica', 'normal');
    
    let yPosition = 20;
    const lineHeight = 7;
    
    const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
      if (yPosition > 280) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      
      const splitText = pdf.splitTextToSize(text, 170);
      pdf.text(splitText, 20, yPosition);
      yPosition += splitText.length * lineHeight;
    };

    // Header
    addText('REPORT ANALISI EMOTIVA - PET VOICE', 18, true);
    yPosition += 5;
    
    // Analysis Info
    addText('INFORMAZIONI ANALISI', 14, true);
    addText(`File: ${analysis.file_name}`);
    addText(`Tipo: ${analysis.file_type}`);
    addText(`Dimensione: ${(analysis.file_size / 1024 / 1024).toFixed(2)} MB`);
    addText(`Data Analisi: ${format(new Date(analysis.created_at), 'dd/MM/yyyy HH:mm', { locale: it })}`);
    yPosition += 5;

    // Emotional Results
    addText('RISULTATI EMOTIVI', 14, true);
    addText(`Emozione Principale: ${analysis.primary_emotion.charAt(0).toUpperCase() + analysis.primary_emotion.slice(1)}`);
    addText(`Confidenza: ${analysis.primary_confidence}%`);
    
    if (Object.keys(analysis.secondary_emotions).length > 0) {
      addText('Emozioni Secondarie:', 12, true);
      Object.entries(analysis.secondary_emotions).forEach(([emotion, confidence]) => {
        addText(`- ${emotion}: ${confidence}%`);
      });
    }
    yPosition += 5;

    // Insights
    if (analysis.behavioral_insights) {
      addText('INSIGHTS COMPORTAMENTALI', 14, true);
      addText(analysis.behavioral_insights);
      yPosition += 5;
    }

    // Recommendations
    if (analysis.recommendations.length > 0) {
      addText('RACCOMANDAZIONI', 14, true);
      analysis.recommendations.forEach((rec, index) => {
        addText(`${index + 1}. ${rec}`);
      });
      yPosition += 5;
    }

    // Triggers
    if (analysis.triggers.length > 0) {
      addText('TRIGGER IDENTIFICATI', 14, true);
      analysis.triggers.forEach((trigger) => {
        addText(`- ${trigger}`);
      });
    }

    // Footer
    yPosition = 280;
    addText(`Report generato il ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: it })}`, 8);
    addText('PetVoice - Analisi Emotiva Avanzata', 8);

    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const generateBatchPDF = (analyses: AnalysisData[], petName: string): jsPDF => {
  const pdf = new jsPDF();
  pdf.setFont('helvetica', 'normal');
  
  let yPosition = 20;
  const lineHeight = 7;
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('REPORT ANALISI MULTIPLE - PET VOICE', 20, yPosition);
  yPosition += 15;
  
  pdf.setFontSize(14);
  pdf.text(`Pet: ${petName}`, 20, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(12);
  pdf.text(`Numero analisi: ${analyses.length}`, 20, yPosition);
  yPosition += 10;
  
  analyses.forEach((analysis, index) => {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${index + 1}. ${analysis.file_name}`, 20, yPosition);
    yPosition += lineHeight;
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Data: ${format(new Date(analysis.created_at), 'dd/MM/yyyy HH:mm')}`, 25, yPosition);
    yPosition += lineHeight;
    pdf.text(`Emozione: ${analysis.primary_emotion} (${analysis.primary_confidence}%)`, 25, yPosition);
    yPosition += lineHeight;
    
    if (analysis.behavioral_insights) {
      const insight = analysis.behavioral_insights.length > 100 
        ? analysis.behavioral_insights.substring(0, 100) + '...'
        : analysis.behavioral_insights;
      pdf.text(`Insight: ${insight}`, 25, yPosition);
      yPosition += lineHeight;
    }
    yPosition += 5;
  });

  return pdf;
};