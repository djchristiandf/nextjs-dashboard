import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

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

    const file = files.file; // 'file' é o nome do campo de arquivo no formulário
    const filePath = path.join(process.cwd(), 'public', 'customers', file.name);

    fs.copyFileSync(file.path, filePath);

    const imagePath = `/customers/${file.name}`;
    
    res.status(200).json({ imagePath });
  });
};

export default uploadHandler;
