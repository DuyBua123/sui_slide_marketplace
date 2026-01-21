import jsPDF from 'jspdf';

/**
 * Export slides to PDF document
 * Each slide becomes a page in the PDF
 */
export const exportSlidesToPDF = async (slides, title = 'Presentation') => {
    if (!slides || slides.length === 0) {
        throw new Error('No slides to export');
    }

    // Get the Konva stage
    const stage = window.__slideStage;
    if (!stage) {
        throw new Error('Canvas not found');
    }

    // Create PDF (landscape, 960x540)
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [960, 540],
    });

    // Export current slide (for now, single slide)
    // Full multi-slide export would require re-rendering each slide
    const dataURL = stage.toDataURL({
        pixelRatio: 2,
        mimeType: 'image/png',
    });

    pdf.addImage(dataURL, 'PNG', 0, 0, 960, 540);

    // Add more pages if needed (placeholder for future multi-slide)
    // for (let i = 1; i < slides.length; i++) {
    //     pdf.addPage();
    //     // Render slide i and add image
    // }

    // Save PDF
    pdf.save(`${title || 'presentation'}.pdf`);
};
