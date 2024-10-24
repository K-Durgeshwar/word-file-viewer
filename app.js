const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
const wordFileName = 'conference-template-a4.docx';
const wordFilePath = path.join(__dirname, 'uploads', wordFileName);
const pdfFilePath = path.join(__dirname, 'uploads', `${wordFileName.replace('.docx', '.pdf')}`);

// Serve static files from the "public" folder
app.use(express.static('public')); 
app.use('/uploads', express.static('uploads')); // Serve files from the "uploads" folder

// Main upload page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to view the specific document
app.get('/view-document', (req, res) => {
  // Check if the PDF already exists, if not convert it
  if (!fs.existsSync(pdfFilePath)) {
    // Convert the DOCX file to PDF using LibreOffice
    exec(`soffice --headless --convert-to pdf --outdir uploads "${wordFilePath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error converting file:', error);
        return res.status(500).send('Error converting file');
      }
      // After conversion, send the response to display the PDF
      return sendPdfResponse(res);
    });
  } else {
    // If the PDF exists, send the response to display it
    sendPdfResponse(res);
  }
});

// Function to send the PDF response
function sendPdfResponse(res) {
  res.send(`
    <iframe src="/uploads/${pdfFilePath.split(path.sep).pop()}" width="100%" height="600px"></iframe>
    <br>
    <a href="/">Go Back</a>
  `);
}

// Start the server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
