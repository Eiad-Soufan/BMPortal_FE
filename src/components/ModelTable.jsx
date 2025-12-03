import React, { useState } from 'react';

function ModelTable({ forms, t, i18n }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('name_ar');

  const handleSearch = () => {
    return forms.filter(form => {
      const value = form[searchField];
      if (typeof value === 'string' || typeof value === 'number') {
        return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    });
  };

  const filteredForms = handleSearch();

  return (
    <div className="model-table position-relative">
      {/* 🔍 شريط البحث */}
      <div className="d-flex align-items-center gap-2 mb-4 justify-content-center flex-wrap">
        <input
          type="text"
          className="form-control"
          placeholder={t('search_placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: 300 }}
        />
        <select
          className="form-select"
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
          style={{ maxWidth: 200 }}
        >
          <option value="name_ar">{t('search_field_ar')}</option>
          <option value="name_en">{t('search_field_en')}</option>
          <option value="serial_number">{t('search_field_id')}</option>
        </select>
        <button className="btn btn-outline-success">
          {t('search')}
        </button>
      </div>

      {/* 📋 جدول النماذج */}
      <div className="table-responsive">
        <table
          className="table table-bordered table-striped table-hover text-center align-middle"
          style={{
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 0 12px rgba(0,0,0,0.08)',
          }}
        >
          <thead
            className="table-success"
            style={{
              background: 'linear-gradient(to right, #1e7f4d, #28a745)',
              color: 'white',
            }}
          >
            <tr>
              <th>{t('serial')}</th>
              <th>{t('category')}</th>
              <th>{t('name_ar')}</th>
              <th>{t('name_en')}</th>
              <th>{t('description')}</th>
              <th>{t('download')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredForms.length > 0 ? (
              filteredForms.map((form, index) => (
                <tr
                  key={form.id}
                  className="model-row"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'forwards',
                  }}
                >
                  <td>{form.serial_number}</td>
                  <td>{form.category}</td>
                  <td>{form.name_ar}</td>
                  <td>{form.name_en}</td>
                  <td>{form.description}</td>
                  <td>
                    {form.file ? (
<a
  className="btn btn-outline-primary btn-sm"
  target="_blank"
  rel="noopener noreferrer"
  href={`/print?id=${form.id}`}
>
  {t('download')}
</a>

                    ) : (
                      <span className="text-muted">{t('no_file')}</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-muted">
                  {t('no_results')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✨ Animation CSS */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .model-row {
          opacity: 0;
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}

export default ModelTable;
