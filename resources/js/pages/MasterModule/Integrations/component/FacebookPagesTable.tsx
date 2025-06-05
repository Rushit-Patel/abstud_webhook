import React from 'react';

interface Page {
    id: string;
    name: string;
    category: string;
}

interface Props {
    meta: any;
}

export const FacebookPagesTable: React.FC<Props> = ({ meta }) => {
    if (!meta.pages || !Array.isArray(meta.pages) || meta.pages.length === 0) {
        return <div className="text-gray-500">No pages found.</div>;
    }

    return (
        <div className="w-full overflow-x-auto  ">
            <table className="min-w-full table-auto rounded-xl border border-gray-200 text-sm shadow-sm">
                <thead className="bg-gray-100 text-left">
                    <tr>
                        <th className="border px-3 py-2">Page Name</th>
                        <th className="border px-3 py-2">Page ID</th>
                        <th className="border px-3 py-2">Category</th>
                    </tr>
                </thead>
                <tbody>
                    {meta.pages.map((page: Page) => (
                        <tr key={page.id} className="hover:bg-gray-50">
                            <td className="border px-3 py-2">{page.name}</td>
                            <td className="border px-3 py-2">{page.id}</td>
                            <td className="border px-3 py-2">{page.category}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
