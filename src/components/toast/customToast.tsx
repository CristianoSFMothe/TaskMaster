import React from 'react';
import { toast } from 'react-toastify';
import { FaTrash } from 'react-icons/fa';

interface CustomToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export const CustomToast: React.FC<CustomToastProps> = ({ message, type }) => {
  const toastOptions = {
    icon: type === 'error' ? <FaTrash color="#EA3140" /> : undefined,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    style: {
      border: type === 'error' ? '1px solid #EA3140' : '1px solid #0F0F0F',
      padding: '16px',
      color: '#0F0F0F',
    },
    progressStyle: {
      background: type === 'error' ? '#EA3140' : undefined,
    },
  };

  switch (type) {
    case 'success':
      toast.success(message, toastOptions);
      break;
    case 'error':
      toast.error(message, toastOptions);
      break;
    case 'info':
      toast.info(message, toastOptions);
      break;
    case 'warning':
      toast.warn(message, toastOptions);
      break;
    default:
      toast(message, toastOptions);
  }

  return null;
};
