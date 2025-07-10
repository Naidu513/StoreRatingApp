import React, { useState, useEffect } from 'react';

function Table({ data, columns, renderRowActions, onSortChange, initialSortField = '', initialSortOrder = 'asc' }) {
  const [sortField, setSortField] = useState(initialSortField);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);

  useEffect(() => {
    if (onSortChange && sortField) {
      onSortChange(sortField, sortOrder);
    }
  }, [sortField, sortOrder, onSortChange]);

  const handleSort = (field) => {
    if (!field) return;
    const newSortOrder = (sortField === field && sortOrder === 'asc') ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newSortOrder);
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === undefined || bValue === undefined) return 0;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((col, index) => (
            <th key={index} className={col.sortable ? 'sortable-header' : ''} onClick={() => col.sortable && handleSort(col.field)}>
              {col.header}
              {col.sortable && sortField === col.field && (
                <span className="sort-icon">{sortOrder === 'asc' ? '▲' : '▼'}</span>
              )}
            </th>
          ))}
          {renderRowActions && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {sortedData.length === 0 ? (
          <tr>
            <td colSpan={columns.length + (renderRowActions ? 1 : 0)} style={{ textAlign: 'center', padding: '20px' }}>
              No data available.
            </td>
          </tr>
        ) : (
          sortedData.map((item, rowIndex) => (
            <tr key={item.id || rowIndex}>
              {columns.map((col, colIndex) => (
                <td key={colIndex}>
                  {item[col.field]}
                </td>
              ))}
              {renderRowActions && (
                <td>
                  {renderRowActions(item)}
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export default Table;