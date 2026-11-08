export default function Table({ columns = [], data = [], rowKey = 'id', emptyMessage = 'Chưa có dữ liệu.', className = '' }) {
  return (
    <div className={`bm-table-wrap ${className}`.trim()}>
      <table className="bm-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={{ width: column.width, textAlign: column.align || 'left' }}>
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? data.map((row, rowIndex) => (
            <tr key={row[rowKey] ?? rowIndex}>
              {columns.map((column) => (
                <td key={column.key} style={{ textAlign: column.align || 'left' }}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          )) : (
            <tr><td className="bm-table__empty" colSpan={columns.length}>{emptyMessage}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
