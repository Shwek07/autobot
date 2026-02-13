// app/admin/components/AutoModelManagement.tsx
'use client';

import { useState, useEffect } from 'react';
import styles from '../maindashboard.module.css';

interface AutoModel {
  auto_id: number;
  auto_merk: string;
  auto_model: string;
  bouwjaar: number;
  engine_variant: string;
  body_type: string;
  created_at: string;
}

export default function AutoModelManagement() {
  const [models, setModels] = useState<AutoModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    auto_merk: '',
    auto_model: '',
    bouwjaar: '',
    engine_variant: '',
    body_type: ''
  });

  useEffect(() => {
    loadModels();
  }, []);

  async function loadModels() {
    try {
      const res = await fetch('/api/admin/automodels');
      const data = await res.json();
      setModels(data);
    } catch (error) {
      console.error('Fout bij laden auto modellen:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/admin/automodels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Auto model succesvol toegevoegd!' });
        setFormData({
          auto_merk: '', auto_model: '', bouwjaar: '',
          engine_variant: '', body_type: ''
        });
        setShowForm(false);
        loadModels();
      } else {
        setMessage({ type: 'error', text: data.error || 'Er is een fout opgetreden' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Verbinding mislukt' });
    } finally {
      setLoading(false);
    }
  }

  const filteredModels = models.filter(m =>
    m.auto_merk.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.auto_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.engine_variant?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Groepeer op merk
  const groupedModels = filteredModels.reduce((acc, model) => {
    if (!acc[model.auto_merk]) {
      acc[model.auto_merk] = [];
    }
    acc[model.auto_merk].push(model);
    return acc;
  }, {} as Record<string, AutoModel[]>);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Auto Modellen</h1>
        <button onClick={() => setShowForm(!showForm)} className={styles.button}>
          {showForm ? 'Annuleren' : '+ Nieuw Model'}
        </button>
      </div>

      {message.text && (
        <div className={message.type === 'success' ? styles.success : styles.error}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div className={styles.card} style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Nieuw auto model toevoegen</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Merk *</label>
              <input
                required
                value={formData.auto_merk}
                onChange={e => setFormData({...formData, auto_merk: e.target.value})}
                placeholder="Bijv. BMW, Audi, Volkswagen"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Model *</label>
              <input
                required
                value={formData.auto_model}
                onChange={e => setFormData({...formData, auto_model: e.target.value})}
                placeholder="Bijv. 3 Serie, A4, Golf"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Bouwjaar</label>
              <input
                type="number"
                min="1900"
                max="2025"
                value={formData.bouwjaar}
                onChange={e => setFormData({...formData, bouwjaar: e.target.value})}
                placeholder="Bijv. 2020"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Motor variant</label>
              <input
                value={formData.engine_variant}
                onChange={e => setFormData({...formData, engine_variant: e.target.value})}
                placeholder="Bijv. 2.0 TDI, 1.6 EcoBoost"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Carrosserie type</label>
              <input
                value={formData.body_type}
                onChange={e => setFormData({...formData, body_type: e.target.value})}
                placeholder="Bijv. Sedan, Hatchback, SUV"
              />
            </div>

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? 'Bezig met opslaan...' : 'Auto model opslaan'}
            </button>
          </form>
        </div>
      )}

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Zoek op merk, model of motor variant..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {Object.entries(groupedModels).map(([merk, merkModels]) => (
        <div key={merk} className={styles.card} style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', color: '#2563eb' }}>{merk}</h2>
          
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Bouwjaar</th>
                  <th>Motor variant</th>
                  <th>Carrosserie</th>
                  <th>Toegevoegd op</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {merkModels.map(model => (
                  <tr key={model.auto_id}>
                    <td><strong>{model.auto_model}</strong></td>
                    <td>{model.bouwjaar || '-'}</td>
                    <td>{model.engine_variant || '-'}</td>
                    <td>{model.body_type || '-'}</td>
                    <td>{new Date(model.created_at).toLocaleDateString('nl-NL')}</td>
                    <td>
                      <button className={styles.button} style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>
                        Bewerk
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {filteredModels.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          Geen auto modellen gevonden
        </div>
      )}
    </div>
  );
}