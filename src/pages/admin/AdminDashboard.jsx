import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import VisiteManager from '../../components/admin/VisiteManager';
import ExpositionManager from '../../components/admin/ExpositionManager';
import ArtisteManager from '../../components/admin/ArtisteManager';
import ContactManager from '../../components/admin/ContactManager';
import { authAPI } from '../../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!authAPI.isAuthenticated()) {
      navigate('/admin/login');
    }
  }, [navigate]);

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <ExpositionManager activeTab={activeTab} setActiveTab={setActiveTab} />
    </AdminLayout>
  );
}
