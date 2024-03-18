'use client';

import { CustomerField } from '@/app/lib/definitions';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { createCustomer } from '@/app/lib/actions';
import { useFormState } from 'react-dom';
import { useState } from 'react';
import Image from 'next/image';

type FormErrors = {
  name?: string;
  email?: string;
  image?: string;
};

export default function Form() {
  const validationRules = {
    name: {
      required: true,
      minLength: 5,
    },
    email: {
      required: true,
      email: true,
    },
    image: {
      required: true,
    },
  };
  const validateFormData = (formData: CustomerField) => {
    const errors: FormErrors = {};
    for (const field in formData) {
      switch (field) {
        case 'name':
          if (validationRules.name.required && !formData[field]) {
            errors[field] = 'Required';
          }
          if (formData[field] && validationRules.name.minLength && formData[field].length < validationRules.name.minLength) {
            errors[field] = `Must be at least ${validationRules.name.minLength} characters`;
          }
          break;
        case 'email':
          if (validationRules.email.required && !formData[field]) {
            errors[field] = 'Required';
          }
          if (formData[field] && validationRules.email.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[field])) {
            errors[field] = 'Invalid email format';
          }
          break;
        case 'image':
          if (validationRules.image.required && !formData[field]) {
            errors[field] = 'Required';
          }
          break;
        default:
          break;
      }
    }
    return errors;
  };

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(createCustomer, initialState);
  const [imagePath, setImagePath] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    // Verifique se há arquivos selecionados
    if (!files || files.length === 0) {
      return;
    }

    // Verifique se há mais de um arquivo selecionado
    if (files.length > 1) {
      alert('Please select only one file.');
      return;
    }

    const file = files[0];

    // Verifique se o arquivo é do tipo imagem
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Verifique se o arquivo é do tipo PNG
    if (!file.type.includes('png')) {
      alert('Please select a PNG image file.');
      return;
    }

    // Lógica para processar e enviar o arquivo de imagem para a pasta /public/customers
    // Crie um objeto FormData para enviar o arquivo
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    setImagePath(data.imagePath);
        
  };
  
  return (
    <form action={dispatch}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Name */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            defaultValue=""
            aria-describedby="customer-error"
          />
        </div>
        <div id="customer-error" aria-live="polite" aria-atomic="true">
        {state.errors?.name && (
          state.errors.name.map((error: string) => (
            <p className="mt-2 text-sm text-red-500" key={error}>
              {error}
            </p>
          ))}</div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          />
        </div>

        {/* Image Upload */}
        <div className="mb-4">
          <label htmlFor="image" className="block text-sm font-medium">
            Image
          </label>
          <input
            id="image"
            name="image"
            type="file"
            accept=".jpg, .jpeg, .png"
            onChange={handleFileChange}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          />
           {imagePath && <Image src={imagePath} alt="Uploaded Image" />}
        </div>
         {/* Hidden input to store the image path for form submission */} 
         <input type="hidden" name="image_url" value={imagePath} />
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/customers"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Create Customer</Button>
      </div>
    </form>
  );
}
