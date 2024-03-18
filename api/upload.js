import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import pngquant from 'pngquant-bin';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadHandler = async (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: 'Error uploading file.' });
      return;
    }

    const file = files.file; // 'file' is the name of the file field in the form
    const filePath = path.join(process.cwd(), 'public', 'customers', file.name);

    // Compress the PNG image using pngquant
    const pngBuffer = fs.readFileSync(file.path);
    const compressedBuffer = await new Promise((resolve, reject) => {
      pngquant({ input: pngBuffer, quality: '60' }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.buffer);
        }
      });
    });

    // Save the compressed image to the server
    fs.writeFileSync(filePath, compressedBuffer);

    // Delete the temporary file
    fs.unlinkSync(file.path);

    const imagePath = `/customers/${file.name}`;

    res.status(200).json({ imagePath });
  });
};

export default uploadHandler;