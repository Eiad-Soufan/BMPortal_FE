
const Paginator = ({ page, pageSize, count, onPageChange }) => {
    const totalPages = Math.max(1, Math.ceil((count || 0) / (pageSize || 10)));

    return (
        <div className="d-flex align-items-center gap-2 justify-content-center mt-3 mb-2">
            <button
                className="btn btn-outline-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
            >
                &laquo;
            </button>

            <span style={{ fontWeight: 800 }}>
                {page} / {totalPages}
            </span>

            <button
                className="btn btn-outline-secondary btn-sm"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                &raquo;
            </button>
        </div>
    );
};

export default Paginator;
