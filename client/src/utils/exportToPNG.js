import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Export slides to PNG images
 * Single slide → Direct download
 * Multiple slides → ZIP file
 */
export const exportSlidesToPNG = async (slides) => {
    if (!slides || slides.length === 0) {
        throw new Error('No slides to export');
    }

    // Get the Konva stage
    const stage = window.__slideStage;
    if (!stage) {
        throw new Error('Canvas not found');
    }

    if (slides.length === 1) {
        // Single slide - direct download
        const dataURL = stage.toDataURL({
            pixelRatio: 2,
            mimeType: 'image/png',
        });

        // Convert to blob and download
        const response = await fetch(dataURL);
        const blob = await response.blob();
        saveAs(blob, `slide.png`);
    } else {
        // Multiple slides - create ZIP
        const zip = new JSZip();

        // Note: We can only export current slide's rendered state
        // For multi-slide export, we'd need to render each slide separately
        // For now, export current slide only
        const dataURL = stage.toDataURL({
            pixelRatio: 2,
            mimeType: 'image/png',
        });

        const response = await fetch(dataURL);
        const blob = await response.blob();

        zip.file(`slide-1.png`, blob);

        // Generate ZIP
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, `presentation.zip`);
    }
};
