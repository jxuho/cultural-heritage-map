// components/SidePanel/NearbySitesList.jsx
import React from 'react';

const NearbySitesList = ({ sites, onClose }) => {
    if (!sites || sites.length === 0) {
        return (
            <div className="p-4 text-gray-600 text-center relative">
                {/* Close Button */}
                {onClose && (
                    <div className="absolute top-4 right-4">
                        <button
                            className="text-gray-500 hover:text-gray-700 text-4xl font-bold hover:cursor-pointer p-1"
                            onClick={onClose}
                            aria-label="Close panel"
                        >
                            &times;
                        </button>
                    </div>
                )}
                주변에 문화재 정보가 없습니다.
            </div>
        );
    }

    return (
        <div className="flex-grow overflow-y-auto p-4 relative">
            {/* Close Button */}
            {onClose && (
                <div className="absolute top-4 right-4 z-10">
                    <button
                        className="text-gray-500 hover:text-gray-700 text-4xl font-bold hover:cursor-pointer p-1"
                        onClick={onClose}
                        aria-label="Close panel"
                    >
                        &times;
                    </button>
                </div>
            )}
            <h2 className="text-xl font-bold mb-4 pr-10">주변 문화재 ({sites.length}개)</h2>
            <ul>
                {sites.map((site) => (
                    <li key={site.sourceId} className="border-b border-gray-200 py-3 last:border-b-0">
                        <h3 className="text-lg font-semibold text-blue-700">{site.name}</h3>
                        {site.category && <p className="text-sm text-gray-600">카테고리: {site.category}</p>}
                        {site.address && <p className="text-sm text-gray-600">주소: {site.address}</p>}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NearbySitesList;