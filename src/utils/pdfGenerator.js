import html2pdf from 'html2pdf.js';

export const generateAndOpenPDF = async (element, filename = 'document.pdf') => {
    // Receipt style options
    const opt = {
        margin: [0, 0, 0, 0],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            letterRendering: true
        },
        jsPDF: {
            unit: 'mm',
            format: [58, 210], // 58mm width, A4 height (ish) - ensures it looks like a receipt strip
            orientation: 'portrait'
        }
    };

    try {
        // We use the worker API to generate and get the output URL
        const worker = html2pdf().set(opt).from(element);

        // Generate Blob URL
        const pdfUrl = await worker.output('bloburl');

        // Open text in new window
        if (pdfUrl) {
            window.open(pdfUrl, '_blank');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};
