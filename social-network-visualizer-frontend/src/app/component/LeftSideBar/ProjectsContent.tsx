'use client';

import { useState, useRef } from 'react';

export default function ProjectsContent() {
    const [selectedDataset, setSelectedDataset] = useState('graph_data3.json');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const datasets = [
        { id: 'graph_data1.json', name: 'graph_data1.json' },
        { id: 'graph_data2.json', name: 'graph_data2.json' },
        { id: 'graph_data3.json', name: 'graph_data3.json' },
        { id: 'graph_data4.json', name: 'graph_data4.json' }
    ];

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            console.log('Uploaded file:', file.name);
            setSelectedDataset(file.name);
        }
    };

    return (
        <div className="h-full w-full box-border flex flex-col space-y-8 text-white rounded-lg shadow-md">
            <div className="min-h-[40px] w-full border-b-2 border-white flex items-center py-2">
                <h1 className="text-2xl font-bold">Projects</h1>
            </div>

            <div className="w-full">
                <div className="flex flex-col w-full">
                    {datasets.map((dataset) => (
                        <div
                            key={dataset.id}
                            className={`flex items-center py-4 border-b border-[#D3D3D3] cursor-pointer w-full hover:text-[#7140F4] ${
                                selectedDataset === dataset.id ? 'text-[#7140F4]' : ''
                            }`}
                            onClick={() => setSelectedDataset(dataset.id)}
                        >
                            <img
                                src={selectedDataset === dataset.id
                                    ? "/icons/leftSideBar/current_project_icon.png"
                                    : "/icons/leftSideBar/project_icon.png"}
                                alt="Document"
                                className="w-7 h-7 mr-2"
                            />
                            <span>
                                {dataset.name}
                            </span>
                        </div>
                    ))}

                    <div
                        className="flex items-center py-4 cursor-pointer w-full hover:text-[#7140F4]"
                        onClick={handleUploadClick}
                    >
                        <img
                            src="/icons/leftSideBar/plus_icon.png"
                            alt="Upload"
                            className="w-7 h-7 mr-2"
                        />
                        <span>Upload file</span>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".txt"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}